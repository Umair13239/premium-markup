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
  "w-full min-h-12 rounded-[14px] border border-[#E5E5EA] bg-white px-4 py-3 text-base text-[#1D1D1F] outline-none transition-colors placeholder:text-[#8E8E93] focus:border-[#683CE7] focus:ring-2 focus:ring-[#683CE7]/20";
const labelBase = "block text-[13px] font-semibold text-[#1D1D1F]";

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
        className="rounded-[28px] bg-[#F5F5F7] p-8 text-[#1D1D1F]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#683CE7] text-white">
          <Check className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Thanks — message received.</h2>
        <p className="mt-3 text-[#6E6E73]">
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
            <p className="text-xs text-[#6E6E73]">Tap to add helpful detail to your brief:</p>
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
              className="mt-1.5 flex items-center gap-3 rounded-[14px] border border-[#E5E5EA] bg-white px-3.5 py-3"
            >
              <FileText className="h-5 w-5 shrink-0 text-[#683CE7]" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm">{upload.name}</span>
              <button
                type="button"
                onClick={removeUpload}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6E6E73] transition-colors hover:bg-[#F5F5F7] hover:text-[#D70015]"
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
              className={`mt-1.5 flex cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border border-dashed px-4 py-6 text-sm transition-colors ${
                dragging ? "border-[#683CE7] bg-[#683CE7]/5 text-[#683CE7]" : "border-[#D2D2D7] text-[#6E6E73] hover:border-[#683CE7] hover:text-[#1D1D1F]"
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
        {uploadError && <span role="alert" className="mt-1.5 block text-sm text-[#D70015]">{uploadError}</span>}
      </div>

      <Field label="How did you hear about us? (optional)" error={errors.referral?.message}>
        <select className={fieldBase} defaultValue="" {...register("referral")}>
          <option value="">Prefer not to say</option>
          {REFERRALS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#683CE7]" {...register("consent")} />
        <span className="text-[#6E6E73]">
          I&rsquo;m happy for Premium Markup to store these details and reply to my enquiry. See our{" "}
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
        disabled={isSubmitting || uploading}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1D1D1F] px-7 font-semibold text-white transition-colors hover:bg-[#683CE7] disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send project brief"}
      </motion.button>
      <p className="text-xs text-[#6E6E73]">We reply within one working day. No spam, ever.</p>
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
