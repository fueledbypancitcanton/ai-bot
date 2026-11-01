# Xerox Doc Assistant — AI bot + website

A simple React website (styled after Xerox) with an AI chatbot docked in the
bottom-right corner. The bot answers **only** from the three Xerox PDFs in this
project — it will not use outside knowledge.

```
app/
├── server/   Express API — reads the docs, retrieves relevant passages,
│   │         and asks Claude to answer using only those passages (RAG).
│   └── docs/ Plain-text extractions of the three source PDFs.
└── web/      React + Vite front end (navigation site + chat widget).
```

## How "only answer from the docs" works

1. On each question the server scores every passage of the documents against the
   question and keeps the best few (`server/rag.js`).
2. If nothing in the docs is relevant, the bot refuses right away.
3. Otherwise those passages are sent to the LLM as the **only** allowed context,
   with strict instructions not to use outside knowledge (`server/index.js`).

The LLM provider is **Groq** (OpenAI-compatible API, open models like
`openai/gpt-oss-120b`). Swapping providers only touches the `fetch` call in
`server/index.js`.

## Run it

You need **Node 18+** and a Groq API key (free at https://console.groq.com/keys).

### 1. Start the backend

```bash
cd app/server
npm install
cp .env.example .env        # then edit .env and paste your GROQ_API_KEY
npm start                   # http://localhost:8787
```

### 2. Start the website (in a second terminal)

```bash
cd app/web
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173 and click the 💬 button in the bottom-right corner.

> The Vite dev server proxies `/api` to the backend on port 8787, so both must
> be running.

## Updating the documents

The bot's knowledge is the `.txt` files in `server/docs/`. To change the
documents, replace/extract text there (e.g. `pdftotext -layout file.pdf
server/docs/file.txt`), add a friendly title in the `TITLES` map in
`server/rag.js`, and restart the server.

## Embedding the bot in another website later

The widget is self-contained in `web/src/components/ChatWidget.jsx` +
`.css`. Drop those two files into any React app and render `<ChatWidget />`.
Point the `fetch("/api/chat")` call at wherever you deploy `server/`.
