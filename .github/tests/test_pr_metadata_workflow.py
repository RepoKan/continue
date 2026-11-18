"""Exercise the trusted workflow in a subprocess against a local fake GitHub API."""
import copy
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import textwrap
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

SHA = 'a' * 40


def candidate(number=1, draft=False, gate=None, sha=SHA):
    body = '' if gate is None else '<!-- pr-state-contract: ' + json.dumps({
        'schema': 1, 'gate': gate, 'required_draft': gate == 'HOLD',
        'recorded_head_sha': sha}) + ' -->'
    return {'number': number, 'state': 'open', 'draft': draft,
            'head': {'sha': sha}, 'body': body, 'updated_at': 'fixed'}


class WorkflowTests(unittest.TestCase):
    def execute(self, pulls, *, trigger=None, mutate=None, unavailable=False, before=None):
        publications = []
        reads = []
        trigger = trigger or candidate()
        scans = 0

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def reply(self, value, status=200):
                data = json.dumps(value).encode()
                self.send_response(status)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)

            def do_POST(self):
                head = self.path.rsplit('/', 1)[-1]
                if not re.fullmatch('[0-9a-f]{40}', head):
                    self.reply({}, 404)
                    return
                payload = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                publications.append(dict(payload, sha=head))
                self.reply({})

            def do_GET(self):
                nonlocal scans
                reads.append(self.path)
                if '/pulls?' in self.path:
                    if unavailable:
                        self.reply({}, 503)
                        return
                    page = int(self.path.rsplit('=', 1)[-1])
                    if page == 1:
                        scans += 1
                    values = copy.deepcopy(pulls)
                    if mutate and scans > 1:
                        values = mutate(values)
                    self.reply(values[(page-1)*100:page*100])
                elif self.path.endswith('/pulls/1'):
                    self.reply(trigger)
                else:
                    self.reply({}, 404)

        workflow = Path(os.environ.get('METADATA_WORKFLOW',
                        Path(__file__).resolve().parents[1] / 'workflows' / 'pr-metadata-consistency.yml'))
        code = textwrap.dedent(workflow.read_text().split("python3 - <<'PY'\n", 1)[1]
                               .rsplit('\n          PY', 1)[0])
        server = HTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with tempfile.TemporaryDirectory() as tmp:
                event = Path(tmp) / 'event.json'
                event.write_text(json.dumps({'number': 1, 'action': 'synchronize', 'before': before}))
                program = Path(tmp) / 'workflow.py'
                program.write_text(code)
                env = {'GITHUB_EVENT_PATH': str(event), 'GITHUB_REPOSITORY': 'example/repo',
                       'GITHUB_API_URL': f'http://127.0.0.1:{server.server_port}',
                       'GH_TOKEN': 'synthetic', 'GOVERNED_PR': '12',
                       'GITHUB_SERVER_URL': 'https://github.example.invalid', 'GITHUB_RUN_ID': '123'}
                result = subprocess.run([sys.executable, str(program)], env=env,
                                        capture_output=True, text=True, timeout=15)
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
        self.assertTrue(publications, result.stderr)
        self.assertEqual(publications[0]['state'], 'pending')
        self.assertTrue(all(x['context'] == 'PR metadata / merge gate' for x in publications))
        self.assertTrue(all(x['target_url'].endswith('/actions/runs/123') for x in publications))
        by_head = {x['sha']: x['state'] for x in publications}
        return by_head[SHA], reads, by_head

    def test_ready_head_passes(self):
        self.assertEqual(self.execute([candidate()])[0], 'success')

    def test_unmarked_alternate_pr_cannot_overwrite_hold(self):
        self.assertEqual(self.execute([candidate(), candidate(12, True, 'HOLD')])[0], 'failure')

    def test_conflicting_live_draft_blocks(self):
        self.assertEqual(self.execute([candidate(), candidate(12, False, 'HOLD')])[0], 'failure')

    def test_missing_governed_contract_blocks(self):
        self.assertEqual(self.execute([candidate(), candidate(12)])[0], 'failure')

    def test_unrelated_sha_does_not_block_trigger_but_is_reconciled(self):
        state, _, heads = self.execute([candidate(), candidate(12, True, 'HOLD', 'b'*40)])
        self.assertEqual(state, 'success')
        self.assertEqual(heads['b'*40], 'failure')

    def test_second_page_hold_blocks(self):
        others = [candidate(i, sha='b'*40) for i in range(100, 199)]
        state, reads, _ = self.execute([candidate(), *others, candidate(12, True, 'HOLD')])
        self.assertEqual(state, 'failure')
        self.assertTrue(any('page=2' in url for url in reads))
        self.assertTrue(all('state=all&sort=created&direction=asc' in url
                            for url in reads if '/pulls?' in url))

    def test_inventory_change_fails_closed(self):
        self.assertEqual(self.execute([candidate()], mutate=lambda ps: [*ps, candidate(12, True, 'HOLD')])[0], 'failure')

    def test_unrelated_inventory_change_also_fails_closed(self):
        self.assertEqual(self.execute([candidate(), candidate(2, sha='b'*40)],
                         mutate=lambda ps: [ps[0], dict(ps[1], state='closed')])[0], 'failure')

    def test_api_failure_does_not_leave_success(self):
        self.assertEqual(self.execute([candidate()], unavailable=True)[0], 'failure')

    def test_closed_trigger_retains_open_head_hold(self):
        self.assertEqual(self.execute([candidate(12, True, 'HOLD')],
                                     trigger=dict(candidate(), state='closed'))[0], 'failure')

    def test_no_open_pr_does_not_publish_success(self):
        self.assertEqual(self.execute([], trigger=dict(candidate(), state='closed'))[0], 'failure')

    def test_missing_trigger_inventory_fails_closed(self):
        self.assertEqual(self.execute([candidate(2)])[0], 'failure')

    def test_previous_head_is_reconciled_after_synchronize(self):
        state, _, heads = self.execute([candidate(), candidate(2, sha='b'*40)], before='b'*40)
        self.assertEqual(state, 'success')
        self.assertEqual(heads['b'*40], 'success')

    def test_surviving_run_reconciles_other_heads_after_queue_overflow(self):
        state, _, heads = self.execute([candidate(), candidate(12, True, 'HOLD', 'b'*40)])
        self.assertEqual(state, 'success')
        self.assertEqual(heads['b'*40], 'failure')


if __name__ == '__main__':
    unittest.main()
