"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CHAT_GREETING, CHAT_SUGGESTIONS, type ChatMessage } from "@/lib/chatbot";

type Msg = ChatMessage & { id: number };
let _id = 1;
const mk = (role: "user" | "assistant", content: string): Msg => ({ id: _id++, role, content });

export function ChatWidget() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([mk("assistant", CHAT_GREETING)]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [stream, setStream] = useState<{ full: string; shown: string } | null>(null);
  const [mode, setMode] = useState<"chat" | "form" | "done">("chat");
  const [form, setForm] = useState({ name: "", contact: "", msg: "" });
  const [formErr, setFormErr] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showChips = mode === "chat" && messages.length <= 1 && !busy && !stream;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, stream, busy, mode]);

  // Typewriter reveal for the latest assistant reply.
  function reveal(full: string) {
    if (reduce) { setMessages((m) => [...m, mk("assistant", full)]); return; }
    setStream({ full, shown: "" });
    let i = 0;
    const step = Math.max(2, Math.round(full.length / 90));
    const t = setInterval(() => {
      i += step;
      if (i >= full.length) {
        clearInterval(t);
        setStream(null);
        setMessages((m) => [...m, mk("assistant", full)]);
      } else {
        setStream({ full, shown: full.slice(0, i) });
      }
    }, 16);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    const next = [...messages, mk("user", content)];
    setMessages(next);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json().catch(() => ({}));
      setBusy(false);
      reveal(j.reply || "Could you say that another way?");
    } catch {
      setBusy(false);
      reveal("Sorry, I hit a snag. Leave your email or WhatsApp number and Umair will reply personally.");
    }
  }

  function onChip(c: string) {
    if (/human|person|someone|call|speak/i.test(c)) { setMode("form"); return; }
    send(c);
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setFormErr("");
    const contact = form.contact.trim();
    if (!contact) { setFormErr("Add your email or WhatsApp number."); return; }
    const isEmail = contact.includes("@");
    setSending(true);
    try {
      const transcript = messages.map((m) => (m.role === "user" ? "Visitor" : "PM") + ": " + m.content).join("\n");
      const r = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: isEmail ? contact : "", phone: isEmail ? "" : contact,
          message: form.msg, wantsHuman: true, transcript,
        }),
      });
      const j = await r.json().catch(() => ({}));
      setSending(false);
      if (!r.ok) { setFormErr(j.error || "Something went wrong."); return; }
      setMode("done");
    } catch {
      setSending(false);
      setFormErr("Network hiccup — please try again.");
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {/* ---------- panel ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex h-[560px] max-h-[78vh] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-[20px] border border-line shadow-2xl"
            style={{
              background: "color-mix(in oklab, var(--color-surface) 88%, transparent)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow: "0 30px 80px -24px color-mix(in oklab, var(--color-cobalt) 40%, transparent)",
            }}
            role="dialog"
            aria-label="Premium Markup chat"
          >
            {/* header */}
            <div
              className="flex items-center gap-3 px-4 py-3 text-white"
              style={{ background: "linear-gradient(120deg, #5b57e6, #7c7bff)" }}
            >
              <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/15 backdrop-blur">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              </div>
              <div className="flex-1 leading-tight">
                <div className="text-[14px] font-semibold">Premium Markup</div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />AI assistant · replies instantly
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full text-white/90 hover:bg-white/15">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => <Bubble key={m.id} role={m.role} text={m.content} />)}
              {stream && <Bubble role="assistant" text={stream.shown} typing />}
              {busy && <TypingDots />}

              {showChips && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {CHAT_SUGGESTIONS.map((c) => (
                    <button key={c} onClick={() => onChip(c)}
                      className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] text-ink transition hover:border-cobalt/60 hover:text-cobalt">
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {mode === "form" && (
                <form onSubmit={submitLead} className="mt-2 space-y-2 rounded-[14px] border border-line bg-surface-2 p-3">
                  <p className="text-[12.5px] text-muted">Leave your details and Umair will reply on WhatsApp shortly.</p>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name"
                    className="w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-cobalt" />
                  <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email or WhatsApp number"
                    className="w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-cobalt" />
                  <textarea value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="What do you need? (optional)" rows={2}
                    className="w-full resize-none rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-cobalt" />
                  {formErr && <p className="text-[12px] text-red-500">{formErr}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={sending}
                      className="flex-1 rounded-[10px] px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(120deg, #5b57e6, #7c7bff)" }}>
                      {sending ? "Sending…" : "Send to Umair"}
                    </button>
                    <button type="button" onClick={() => setMode("chat")} className="rounded-[10px] border border-line px-3 py-2 text-[13px] text-muted">Back</button>
                  </div>
                </form>
              )}

              {mode === "done" && (
                <div className="mt-2 rounded-[14px] border border-cobalt/40 bg-surface-2 p-3 text-[13px] text-ink">
                  ✅ Got it — Umair will message you on WhatsApp shortly. Feel free to keep chatting meanwhile.
                  <button onClick={() => setMode("chat")} className="mt-2 block text-[12.5px] font-medium text-cobalt">Back to chat</button>
                </div>
              )}
            </div>

            {/* input */}
            {mode !== "form" && (
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2 border-t border-line px-3 py-2.5"
                style={{ background: "color-mix(in oklab, var(--color-surface) 70%, transparent)" }}
              >
                <input
                  value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…"
                  className="flex-1 bg-transparent px-2 py-1.5 text-[13.5px] text-ink outline-none placeholder:text-muted"
                />
                <button type="submit" aria-label="Send" disabled={!input.trim() || busy}
                  className="grid h-9 w-9 place-items-center rounded-full text-white transition disabled:opacity-40"
                  style={{ background: "linear-gradient(120deg, #5b57e6, #7c7bff)" }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- launcher ---------- */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className="pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full text-white shadow-xl"
        style={{
          background: "linear-gradient(135deg, #5b57e6, #7c7bff)",
          boxShadow: "0 12px 40px -8px color-mix(in oklab, var(--color-cobalt) 70%, transparent)",
        }}
      >
        {!reduce && !open && (
          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "color-mix(in oklab, var(--color-cobalt) 45%, transparent)" }} />
        )}
        <span className="relative">
          {open ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
          )}
        </span>
      </motion.button>
    </div>
  );
}

function Bubble({ role, text, typing }: { role: "user" | "assistant"; text: string; typing?: boolean }) {
  const me = role === "user";
  return (
    <div className={"flex " + (me ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[85%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2.5 text-[13.5px] leading-relaxed " +
          (me ? "rounded-br-[4px] text-white" : "rounded-bl-[4px] border border-line bg-surface-2 text-ink")
        }
        style={me ? { background: "linear-gradient(120deg, #5b57e6, #7c7bff)" } : undefined}
      >
        {text}
        {typing && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-current align-middle" />}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-[14px] rounded-bl-[4px] border border-line bg-surface-2 px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: i * 0.15 + "s" }} />
        ))}
      </div>
    </div>
  );
}
