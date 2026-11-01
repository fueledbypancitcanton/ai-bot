import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm the Xerox Doc Assistant. I answer using the official Xerox printer documents only. " +
    "Ask me about setup, printing, scanning, copying, supplies, or troubleshooting.",
};

const SUGGESTIONS = [
  "How do I scan to email?",
  "What is Xerox Smart Start?",
  "How do I find the printer's IP address?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Send only the real Q&A turns as history (skip the welcome message).
      const history = nextMessages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, sources: data.sources },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the assistant. Make sure the server is running and has an API key. (" +
            (err.message || "error") +
            ")",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    send();
  }

  return (
    <div className="cw-root">
      {/* Panel */}
      {open && (
        <div className="cw-panel" role="dialog" aria-label="Xerox Doc Assistant">
          <div className="cw-header">
            <div className="cw-header-title">
              <span className="brand-mark small">✕</span>
              <div>
                <strong>Xerox Doc Assistant</strong>
                <span className="cw-status">Answers from the docs</span>
              </div>
            </div>
            <button className="cw-icon-btn" aria-label="Minimize" onClick={() => setOpen(false)}>
              ⌄
            </button>
          </div>

          <div className="cw-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`cw-msg cw-${m.role}`}>
                <div className="cw-bubble">{m.content}</div>
                {m.sources?.length > 0 && (
                  <div className="cw-sources">Sources: {m.sources.join(" · ")}</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="cw-msg cw-assistant">
                <div className="cw-bubble cw-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="cw-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="cw-chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="cw-input" onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              placeholder="Ask about your Xerox printer…"
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Launcher button */}
      <button
        className={`cw-launcher ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Minimize chat" : "Open chat"}
      >
        {open ? "⌄" : "💬"}
      </button>
    </div>
  );
}
