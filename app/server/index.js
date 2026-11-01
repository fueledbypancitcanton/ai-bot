import "dotenv/config";
import express from "express";
import cors from "cors";
import { retrieve, documentTitles } from "./rag.js";

const PORT = process.env.PORT || 8787;

// Groq exposes an OpenAI-compatible Chat Completions API.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const API_KEY = process.env.GROQ_API_KEY;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

if (!API_KEY) {
  console.warn(
    "[server] GROQ_API_KEY is not set. Copy .env.example to .env and add your key."
  );
}

const REFUSAL =
  "I can only answer questions about the provided Xerox printer documents " +
  "(the Multifunction Printers guide, the Smart Start customer tip, and the B305/B315 user guide). " +
  "Try asking about setup, printing, scanning, copying, supplies, or troubleshooting for those printers.";

function buildSystemPrompt(context) {
  return `You are "Xerox Doc Assistant", a support chatbot embedded on a website.

You answer STRICTLY and ONLY using the CONTEXT below, which is extracted from official Xerox
printer documentation. Follow these rules without exception:

- If the answer is not contained in the CONTEXT, reply that you can only help with questions about
  the provided Xerox printer documents, and suggest a relevant topic. Do NOT use outside knowledge.
- Never invent part numbers, steps, menu names, or specifications that are not in the CONTEXT.
- Be concise and practical. Use short steps or bullet points when giving instructions.
- When helpful, mention which document the information comes from.

CONTEXT:
${context}`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: "groq", model: MODEL, hasKey: !!API_KEY, documents: documentTitles() });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string." });
    }

    // Retrieve the most relevant passages from the documents.
    const hits = retrieve(message, 6);

    // Nothing relevant in the docs -> refuse without calling the model.
    if (hits.length === 0) {
      return res.json({ reply: REFUSAL, sources: [] });
    }

    if (!API_KEY) {
      return res.status(503).json({
        error:
          "The server has no GROQ_API_KEY configured. Add one to server/.env to enable answers.",
      });
    }

    const context = hits
      .map((h, i) => `[${i + 1}] (Source: ${h.source})\n${h.text}`)
      .join("\n\n---\n\n");

    // Keep a short rolling window of the conversation for follow-up questions.
    const priorTurns = history
      .slice(-6)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({ role: m.role, content: String(m.content) }));

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.2,
        messages: [
          { role: "system", content: buildSystemPrompt(context) },
          ...priorTurns,
          { role: "user", content: message },
        ],
      }),
    });

    if (!groqRes.ok) {
      const detail = await groqRes.text();
      console.error("[server] Groq error:", groqRes.status, detail.slice(0, 300));
      const status = groqRes.status === 401 ? 401 : 502;
      return res.status(status).json({
        error:
          status === 401
            ? "Invalid GROQ_API_KEY. Check server/.env."
            : "The language model service returned an error.",
      });
    }

    const data = await groqRes.json();
    const reply = (data?.choices?.[0]?.message?.content || "").trim();

    const sources = [...new Set(hits.map((h) => h.source))];
    res.json({ reply: reply || REFUSAL, sources });
  } catch (err) {
    console.error("[server] /api/chat error:", err?.message || err);
    res.status(500).json({ error: "Something went wrong answering that question." });
  }
});

app.listen(PORT, () => {
  console.log(`[server] Xerox Doc Assistant API (Groq · ${MODEL}) running on http://localhost:${PORT}`);
});
