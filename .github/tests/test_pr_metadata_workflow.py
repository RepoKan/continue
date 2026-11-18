"""Offline integration tests for the actual trusted workflow program."""
import copy
import io
import json
import os
from pathlib import Path
import tempfile
import textwrap
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

SHA = 'a' * 40


def candidate(number=1, draft=False, gate=None, sha=SHA):
    body = '' if gate is None else '<!-- pr-state-contract: ' + json.dumps({
        'schema': 1, 'gate': gate, 'required_draft': gate == 'HOLD',
        'recorded_head_sha': sha}) + ' -->'
    return {'number': number, 'state': 'open', 'draft': draft,
            'head': {'sha': sha}, 'body': body, 'updated_at': 'fixed'}


class WorkflowTests(unittest.TestCase):
    def execute(self, pulls, *, trigger=None, mutate=None, unavailable=False):
        publications = []
        reads = []
        trigger = trigger or candidate()
        scans = 0

        def respond(request, timeout):
            nonlocal scans
            url = request.full_url
            if request.data is not None:
                self.assertEqual(url.rsplit('/', 1)[-1], SHA)
                publications.append(json.loads(request.data))
                return io.BytesIO(b'{}')
            reads.append(url)
            if '/pulls?' in url:
                if unavailable:
                    raise HTTPError(url, 503, 'unavailable', {}, None)
                page = int(url.rsplit('=', 1)[-1])
                if page == 1:
                    scans += 1
                values = copy.deepcopy(pulls)
                if mutate and scans > 1:
                    values = mutate(values)
                return io.BytesIO(json.dumps(values[(page-1)*100:page*100]).encode())
            if url.endswith('/pulls/1'):
                return io.BytesIO(json.dumps(trigger).encode())
            raise AssertionError('Unexpected API route')

        workflow = Path(os.environ.get('METADATA_WORKFLOW',
                        Path(__file__).resolve().parents[1] / 'workflows' / 'pr-metadata-consistency.yml'))
        code = textwrap.dedent(workflow.read_text().split("python3 - <<'PY'\n", 1)[1]
                               .rsplit('\n          PY', 1)[0])
        with tempfile.TemporaryDirectory() as tmp:
            event = Path(tmp) / 'event.json'
            event.write_text('{"number": 1}')
            env = {'GITHUB_EVENT_PATH': str(event), 'GITHUB_REPOSITORY': 'example/repo',
                   'GITHUB_API_URL': 'https://api.example.invalid', 'GH_TOKEN': 'synthetic',
                   'GOVERNED_PR': '12', 'GITHUB_SERVER_URL': 'https://github.example.invalid',
                   'GITHUB_RUN_ID': '123'}
            with patch.dict(os.environ, env), patch('urllib.request.urlopen', respond):
                try:
                    exec(compile(code, str(workflow), 'exec'), {})
                except SystemExit:
                    pass
        self.assertEqual(publications[0]['state'], 'pending')
        self.assertTrue(all(x['context'] == 'PR metadata / merge gate' for x in publications))
        self.assertTrue(all(x['target_url'].endswith('/actions/runs/123') for x in publications))
        return publications[-1]['state'], reads

    def test_ready_head_passes(self):
        self.assertEqual(self.execute([candidate()])[0], 'success')

    def test_unmarked_alternate_pr_cannot_overwrite_hold(self):
        self.assertEqual(self.execute([candidate(), candidate(12, True, 'HOLD')])[0], 'failure')

    def test_conflicting_live_draft_blocks(self):
        self.assertEqual(self.execute([candidate(), candidate(12, False, 'HOLD')])[0], 'failure')

    def test_missing_governed_contract_blocks(self):
        self.assertEqual(self.execute([candidate(), candidate(12)])[0], 'failure')

    def test_unrelated_sha_does_not_block(self):
        self.assertEqual(self.execute([candidate(), candidate(12, True, 'HOLD', 'b'*40)])[0], 'success')

    def test_second_page_hold_blocks(self):
        others = [candidate(i, sha='b'*40) for i in range(100, 199)]
        state, reads = self.execute([candidate()] + others + [candidate(12, True, 'HOLD')])
        self.assertEqual(state, 'failure')
        self.assertTrue(any('page=2' in url for url in reads))

    def test_inventory_change_fails_closed(self):
        state, _ = self.execute([candidate()], mutate=lambda ps: ps + [candidate(12, True, 'HOLD')])
        self.assertEqual(state, 'failure')

    def test_api_failure_does_not_leave_success(self):
        self.assertEqual(self.execute([candidate()], unavailable=True)[0], 'failure')

    def test_closed_trigger_retains_open_head_hold(self):
        self.assertEqual(self.execute([candidate(12, True, 'HOLD')],
                                     trigger=dict(candidate(), state='closed'))[0], 'failure')

    def test_no_open_pr_does_not_publish_success(self):
        self.assertEqual(self.execute([], trigger=dict(candidate(), state='closed'))[0], 'failure')

    def test_missing_trigger_inventory_fails_closed(self):
        self.assertEqual(self.execute([candidate(2)])[0], 'failure')


if __name__ == '__main__':
    unittest.main()
