# ARIYA AI

A mobile-first female AI assistant interface.

## Run
npm install
npm run dev

## AI backend
The included `/api/chat` endpoint uses an OpenAI-compatible API. Configure:
- AI_API_KEY
- AI_BASE_URL
- AI_MODEL

Never put a secret API key in frontend code.

## Important
The basic voice input and text-to-speech use browser APIs and do not require paid services. The actual AI model requires an AI provider/API unless you connect a local model or another free provider.
