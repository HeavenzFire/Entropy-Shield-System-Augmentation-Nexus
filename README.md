# Entropy Shield — Local-First Edition

The app uses a local Ollama model for protocol suggestions and system-state summaries. It no longer requires a Gemini API key or sends these prompts to a hosted model provider.

## Run locally

Prerequisites: Node.js and Ollama on the same computer.

```powershell
npm install
ollama pull qwen2.5:0.5b
npm run dev
```

Optional `.env.local` settings:

```text
LOCAL_LLM_BASE_URL=http://127.0.0.1:11434
VITE_LOCAL_MODEL=qwen2.5:0.5b
```

The Vite dev/preview servers bind to 127.0.0.1 and proxy `/api/local-llm` to Ollama. No provider key is injected into browser JavaScript.

## Limits and safety

- The local model provides generated suggestions, not a trained PyTorch score, physical measurement, or verified consensus mechanism.
- JSON output is validated before a protocol is returned. A failed model request yields no accepted strategy.
- Keep Ollama and the Vite server on loopback; do not expose either to the public internet.
- Local-model quality is not assumed to match Gemini 3 Pro/Flash. Verify suggestions independently before using them for consequential changes.
