# Chatbot (OpenAI) — Setup & Usage

This project includes a frontend ChatWidget that calls OpenAI directly from the browser using Vite env variables. Follow the instructions and safety notes below.

Setup

1. Create a project `.env` in the project root (do NOT commit it).

   Example `.env`:

   VITE_OPENAI_KEY=sk-...    # use a limited-key with caps
   VITE_OPENAI_MODEL=gpt-5-mini

2. Install dependencies and run dev server:

```bash
npm install
npm run dev
```

Usage

- Open the app in your browser. Click the floating chat button to open the chatbot.
- Type queries like:
  - "강남역 근처 추천 관광지 알려줘"
  - "이번 달 서울 축제 일정 알려줘"
  - "근처 맛집 추천해줘"
  - "커뮤니티 게시글에서 '한강' 관련 글 찾아줘"

Notes & Security

- Because the key is embedded in the frontend bundle, it is visible to clients. Use a key with strict rate limits and billing caps.
- If you need to protect sensitive keys, route requests through a server or Netlify Function and keep the secret server-side.

Files of interest

- `src/components/ChatWidget.vue` — chat UI
- `src/composables/useChatbot.ts` — builds context from local JSON and localStorage then calls OpenAI
- `src/utils/openai.ts` — minimal helper that calls OpenAI Chat Completions
