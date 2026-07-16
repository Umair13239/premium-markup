"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Paperclip, X, Plus, FileText } from "lucide-react";
import {
  contactSchema,
  BUDGETS,
  PROJECT_TYPES,
  TIMELINES,
  REFERRALS,
  PROJECT_SUGGESTIONS,
  type ContactInput,
} from "@/lib/contact-schema";

const fieldBase =
  "w-full min-h-11 rounded-[6px] border border-line bg-surface px-3.5 py-2.5 text-base outline-none transition-colors focus:border-cobalt focus:ring-2 focus:ring-cobalt/20";
const labelBase = "mono block text-xs font-medium text-ink";

type Upload = { url: string; name: string };

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [projectType, setProjectType] = useState("");
  const [message, setMessage] = useState("");
  const [upload, setUpload] = useState<Upload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const suggestions = projectType ? PROJECT_SUGGESTIONS[projectType] || [] : [];

  function addSuggestion(text: string) {
    setMessage((prev) => {
      const next = prev.trim() ? `${prev.replace(/\s+$/, "")}\n• ${text} ` : `• ${text} `;
      setValue("message", next, { shouldValidate: true });
      return next;
    });
  }

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/contact/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      setUpload({ url: j.url, name: j.name });
      setValue("attachmentUrl", j.url);
      setValue("attachmentName", j.name);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    }
    setUploading(false);
  }

  function removeUpload() {
    setUpload(null);
    setValue("attachmentUrl", "");
    setValue("attachmentName", "");
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
        className="rounded-[6px] border border-line bg-surface p-8"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cobalt text-white">
          <Check className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl">Thanks — message received.</h2>
        <p className="mt-3 text-muted">
          We reply within one working day with honest, specific next steps. If it&rsquo;s
          urgent, call or WhatsApp us on the number on this page.
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

      {/* Hidden attachment fields kept in sync with the upload state */}
      <input type="hidden" {...register("attachmentUrl")} />
      <input type="hidden" {...register("attachmentName")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name?.message}>
          <input className={fieldBase} autoComplete="name" {...register("name")} />
        </Field>
        <Field label="Business name" error={errors.company?.message}>
          <input className={fieldBase} autoComplete="organization" {...register("company")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" required error={errors.email?.message}>
          <input type="email" inputMode="email" className={fieldBase} autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <input type="tel" inputMode="tel" className={fieldBase} autoComplete="tel" {...register("phone")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Current website (optional)" error={errors.currentWebsite?.message}>
          <input type="url" inputMode="url" placeholder="https://" className={fieldBase} autoComplete="url" {...register("currentWebsite")} />
        </Field>
        <Field label="Service required" required error={errors.projectType?.message}>
          <select
            className={fieldBase}
            defaultValue=""
            {...register("projectType", { onChange: (e) => setProjectType(e.target.value) })}
          >
            <option value="" disabled>Choose a service…</option>
            {PROJECT_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Budget range" required error={errors.budget?.message}>
          <select className={fieldBase} defaultValue="" {...register("budget")}>
            <option value="" disabled>Choose a range…</option>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Preferred timeline" error={errors.timeline?.message}>
          <select className={fieldBase} defaultValue="" {...register("timeline")}>
            <option value="">No preference</option>
            {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      {/* Contextual suggestion chips — animate in when a project type is picked */}
      <AnimatePresence initial={false}>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="mono text-xs text-muted">Tap to add helpful detail to your brief:</p>
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                >
                  <Plus className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Field label="Project details" required error={errors.message?.message}>
        <textarea
          rows={6}
          className={`${fieldBase} resize-y`}
          placeholder="What are you building, and what's gone wrong before?"
          value={message}
          {...register("message", { onChange: (e) => setMessage(e.target.value) })}
        />
      </Field>

      {/* Project brief / reference file upload */}
      <div>
        <span className={labelBase}>Attach a brief or reference (optional)</span>
        <AnimatePresence mode="wait">
          {upload ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-1.5 flex items-center gap-3 rounded-[6px] border border-line bg-surface px-3.5 py-3"
            >
              <FileText className="h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm">{upload.name}</span>
              <button
                type="button"
                onClick={removeUpload}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-paper hover:text-tag"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <label
              key="drop"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
              className={`mt-1.5 flex cursor-pointer items-center justify-center gap-2.5 rounded-[6px] border border-dashed px-4 py-6 text-sm transition-colors ${
                dragging ? "border-cobalt bg-cobalt/5 text-cobalt" : "border-line text-muted hover:border-cobalt hover:text-ink"
              }`}
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Uploading…</>
              ) : (
                <><Paperclip className="h-4 w-4" aria-hidden="true" /> Drop a file here, or click to browse — PDF, image, Word, ZIP (max 10MB)</>
              )}
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.zip,.txt"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          )}
        </AnimatePresence>
        {uploadError && <span role="alert" className="mt-1.5 block text-sm text-tag">{uploadError}</span>}
      </div>

      <Field label="How did you hear about us? (optional)" error={errors.referral?.message}>
        <select className={fieldBase} defaultValue="" {...register("referral")}>
          <option value="">Prefer not to say</option>
          {REFERRALS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-cobalt)]" {...register("consent")} />
        <span className="text-muted">
          I&rsquo;m happy for Premium Markup to store these details and reply to my enquiry. See our{" "}
          <a href="/privacy" className="text-cobalt link-underline">privacy policy</a>.
        </span>
      </label>
      {errors.consent && <span role="alert" className="-mt-2 block text-sm text-tag">{errors.consent.message}</span>}

      {serverError && (
        <p role="alert" className="rounded-[6px] border border-[color:#e3b6b5] bg-[color:#fbeeed] px-4 py-3 text-sm text-tag">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting || uploading}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-cobalt px-6 font-medium text-white transition-colors hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send project brief"}
      </motion.button>
      <p className="mono text-xs text-muted">We reply within one working day. No spam, ever.</p>
    </form>
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
        {label} {required && <span className="text-tag">*</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-tag">
          {error}
        </span>
      )}
    </label>
  );
}
