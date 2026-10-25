"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import {
  contactSchema,
  PROJECT_TYPES,
  PROJECT_SUGGESTIONS,
  type ContactInput,
} from "@/lib/contact-schema";

const fieldBase =
  "w-full min-h-12 rounded-[14px] border border-[#E5E5EA] bg-white px-4 py-3 text-base text-[#1D1D1F] outline-none transition-colors placeholder:text-[#8E8E93] focus:border-[#683CE7] focus:ring-2 focus:ring-[#683CE7]/20";
const labelBase = "block text-[13px] font-semibold text-[#1D1D1F]";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const suggestions = topic ? PROJECT_SUGGESTIONS[topic] || [] : [];

  function addSuggestion(text: string) {
    setMessage((prev) => {
      const next = prev.trim() ? `${prev.replace(/\s+$/, "")}\n• ${text} ` : `• ${text} `;
      setValue("message", next, { shouldValidate: true });
      return next;
    });
  }

  async function onSubmit(data: ContactInput) {
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Something went wrong. Please try again or email us.");
      }
      setDone(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] bg-[#F5F5F7] p-8 text-[#1D1D1F]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#683CE7] text-white">
          <Check className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Thanks, message received.</h2>
        <p className="mt-3 text-[#6E6E73]">
          We reply within one working day. If it&rsquo;s urgent, call or WhatsApp us on the number on this page.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
      {/* Honeypot: visually hidden, off the tab order */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name?.message}>
          <input className={fieldBase} autoComplete="name" {...register("name")} />
        </Field>
        <Field label="Business name (optional)" error={errors.company?.message}>
          <input className={fieldBase} autoComplete="organization" {...register("company")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" required error={errors.email?.message}>
          <input type="email" inputMode="email" className={fieldBase} autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Phone or WhatsApp (optional)" error={errors.phone?.message}>
          <input type="tel" inputMode="tel" className={fieldBase} autoComplete="tel" {...register("phone")} />
        </Field>
      </div>

      <div>
        <span className={labelBase} id="topic-label">
          What do you need help with? <span className="text-[#D70015]">*</span>
        </span>
        <div className="mt-1.5">
          <input type="hidden" {...register("projectType")} />
          <ThemedSelect
            labelledBy="topic-label"
            value={topic}
            placeholder="Choose a topic…"
            options={PROJECT_TYPES}
            onChange={(v) => { setTopic(v); setValue("projectType", v, { shouldValidate: true }); }}
          />
        </div>
        {errors.projectType && <span role="alert" className="mt-1.5 block text-sm text-[#D70015]">{errors.projectType.message}</span>}
      </div>

      {/* Contextual suggestion chips: animate in when a topic is picked */}
      <AnimatePresence initial={false}>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-[#6E6E73]">Tap to add helpful detail to your message:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => addSuggestion(s)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5EA] bg-white px-3 py-1.5 text-sm text-[#1D1D1F] transition-colors hover:border-[#683CE7] hover:text-[#683CE7]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#683CE7]" aria-hidden="true" />
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Field label="Your message" required error={errors.message?.message}>
        <textarea
          rows={6}
          className={`${fieldBase} resize-y`}
          placeholder="Tell us what you need help with, and what you already tried."
          value={message}
          {...register("message", { onChange: (e) => setMessage(e.target.value) })}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#683CE7]" {...register("consent")} />
        <span className="text-[#6E6E73]">
          I&rsquo;m happy for Premium Markup to store these details and reply to my message. See our{" "}
          <a href="/privacy" className="text-[#683CE7] underline underline-offset-2">privacy policy</a>.
        </span>
      </label>
      {errors.consent && <span role="alert" className="-mt-2 block text-sm text-[#D70015]">{errors.consent.message}</span>}

      {serverError && (
        <p role="alert" className="rounded-[14px] bg-[#FFF1F0] px-4 py-3 text-sm text-[#D70015]">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#683CE7] px-7 font-semibold text-white transition-colors hover:bg-[#5A2FD1] disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send message"}
      </motion.button>
      <p className="text-xs text-[#6E6E73]">We reply within one working day. No spam, ever.</p>
    </form>
  );
}

// A dropdown in our own colours (the browser's native list cannot be themed). Keyboard: arrows, Enter, Escape.
function ThemedSelect({
  value,
  onChange,
  options,
  placeholder,
  labelledBy,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  labelledBy: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  function pick(v: string) { onChange(v); setOpen(false); }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); setActive(Math.max(0, options.indexOf(value))); return; }
      setActive((a) => (e.key === "ArrowDown" ? Math.min(options.length - 1, a + 1) : Math.max(0, a - 1)));
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && open && active >= 0) { e.preventDefault(); pick(options[active]); }
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        onClick={() => { setOpen((o) => !o); setActive(Math.max(0, options.indexOf(value))); }}
        onKeyDown={onKey}
        className={`${fieldBase} flex items-center justify-between gap-3 text-left`}
      >
        <span className={value ? "truncate" : "truncate text-[#8E8E93]"}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#683CE7] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-[18px] border border-[#E5E5EA] bg-white p-1.5 shadow-[0_24px_48px_-24px_rgba(40,20,120,.4)]"
          >
            {options.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-[12px] px-3.5 py-2.5 text-[15px] ${
                  i === active ? "bg-[#F1EEFD] text-[#1D1D1F]" : "text-[#1D1D1F]"
                }`}
              >
                <span>{o}</span>
                {o === value && <Check className="h-4 w-4 text-[#683CE7]" aria-hidden="true" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelBase}>
        {label} {required && <span className="text-[#D70015]">*</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-[#D70015]">
          {error}
        </span>
      )}
    </label>
  );
}
