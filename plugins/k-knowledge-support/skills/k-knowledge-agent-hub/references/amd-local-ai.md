# AMD Local AI — K Knowledge Supporting only

Scope: **project-only**. This directory is not a global Lemonade install.

Requested profile:
- Model: `Qwen2.5-Coder-7B-Instruct-GGUF`
- Recipe/backend family: `llamacpp`
- Universal packaged fallback: `llamacpp:vulkan`
- Local API: `http://127.0.0.1:13305/api/v1`
- Model storage: project-local `vendor/lemonade/models`

Run on the AMD Linux x64 workstation from this directory:

```bash
./scripts/install_linux.sh
```

The installer deliberately verifies the model against the live `GET /api/v1/models` catalog before pulling it. If that exact legacy model name is no longer in the current Lemonade catalog, the script stops instead of silently substituting another model.

Current ChatGPT runtime install status is recorded in `INSTALL_STATE.json`.
