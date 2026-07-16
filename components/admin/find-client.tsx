"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, Check } from "lucide-react";
import * as actions from "@/lib/lead-actions";

const TARGETS = ["name", "company", "email", "phone", "website", "niche"] as const;
type Target = (typeof TARGETS)[number];

// Minimal RFC-ish CSV parser (handles quotes + commas).
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const clean = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = clean.split("\n").filter((l) => l.length > 0);
  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  if (!lines.length) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function autoMatch(headers: string[]): Record<Target, string> {
  const map = {} as Record<Target, string>;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const aliases: Record<Target, string[]> = {
    name: ["name", "fullname", "contact", "businessname", "company"],
    company: ["company", "business", "organisation", "organization"],
    email: ["email", "emailaddress", "mail"],
    phone: ["phone", "phonenumber", "tel", "mobile", "number"],
    website: ["website", "url", "site", "web", "domain"],
    niche: ["niche", "category", "industry", "sector", "type"],
  };
  for (const t of TARGETS) {
    const found = headers.find((h) => aliases[t].includes(norm(h)));
    map[t] = found || "";
  }
  return map;
}

export function FindClient() {
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [map, setMap] = useState<Record<Target, string>>({} as Record<Target, string>);
  const [result, setResult] = useState<{ added: number; dupes: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false);

  function onFile(file: File) {
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const { headers, rows } = parseCSV(String(reader.result || ""));
      setHeaders(headers);
      setRows(rows);
      setMap(autoMatch(headers));
    };
    reader.readAsText(file);
  }

  async function doImport() {
    if (!map.name) return;
    setImporting(true);
    const idx = (t: Target) => headers.indexOf(map[t]);
    const records = rows
      .map((r) => {
        const rec: Record<string, string> = {};
        for (const t of TARGETS) {
          const i = idx(t);
          if (i >= 0 && r[i]) rec[t] = r[i];
        }
        return rec;
      })
      .filter((rec) => rec.name);
    const res = await actions.importLeads(records);
    setResult(res);
    setImporting(false);
    setHeaders([]);
    setRows([]);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <h1 className="text-2xl">Find leads</h1>
      <p className="mt-1 text-sm text-muted">Add prospects one at a time, or import a list.</p>

      {/* Quick add */}
      <section className="mt-6 rounded-[6px] border border-line bg-surface p-5">
        <p className="font-medium">Quick add</p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setAdding(true);
            const fd = new FormData(e.currentTarget);
            await actions.createLead(Object.fromEntries(fd.entries()) as Record<string, string>);
            (e.target as HTMLFormElement).reset();
            setAdding(false);
            router.refresh();
          }}
        >
          {[
            { name: "name", label: "Name / business *", required: true, full: false },
            { name: "company", label: "Company", full: false },
            { name: "email", label: "Email", type: "email", full: false },
            { name: "website", label: "Website", full: false },
            { name: "niche", label: "Niche", full: false },
          ].map((f) => (
            <label key={f.name} className={f.full ? "sm:col-span-2" : ""}>
              <span className="mono text-xs text-muted">{f.label}</span>
              <input name={f.name} type={f.type || "text"} required={f.required} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
            </label>
          ))}
          <label className="sm:col-span-2">
            <span className="mono text-xs text-muted">Notes</span>
            <input name="notes" className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
          </label>
          <button type="submit" disabled={adding} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60 sm:w-40">
            {adding && <Loader2 className="h-4 w-4 animate-spin" />} Add prospect
          </button>
        </form>
      </section>

      {/* CSV import */}
      <section className="mt-6 rounded-[6px] border border-line bg-surface p-5">
        <p className="font-medium">Import a CSV</p>
        <p className="mt-1 text-sm text-muted">Any columns — you map them below. Duplicates (by email or website) are skipped automatically.</p>

        {headers.length === 0 ? (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed border-line bg-paper py-10 text-center hover:border-cobalt">
            <UploadCloud className="h-7 w-7 text-muted" aria-hidden="true" />
            <span className="text-sm">Click to choose a .csv file</span>
            <input type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
        ) : (
          <div className="mt-4">
            <p className="mono text-xs text-muted">{rows.length} rows detected. Map your columns:</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {TARGETS.map((t) => (
                <label key={t} className="flex items-center gap-3">
                  <span className="mono w-20 shrink-0 text-xs capitalize text-muted">{t}{t === "name" && " *"}</span>
                  <select
                    value={map[t] || ""}
                    onChange={(e) => setMap((m) => ({ ...m, [t]: e.target.value }))}
                    className="flex-1 min-h-10 rounded-[6px] border border-line bg-surface px-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={doImport} disabled={!map.name || importing} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">
                {importing && <Loader2 className="h-4 w-4 animate-spin" />} Import {rows.length} rows
              </button>
              <button onClick={() => { setHeaders([]); setRows([]); }} className="min-h-10 rounded-[6px] border border-line px-4 text-sm text-muted hover:text-ink">Cancel</button>
            </div>
          </div>
        )}

        {result && (
          <p className="mt-4 flex items-center gap-2 rounded-[6px] border border-[color:#bfe6cf] bg-[color:#eef8f1] px-3 py-2 text-sm text-[color:#1f7a4d]">
            <Check className="h-4 w-4" /> Imported {result.added} new lead{result.added !== 1 ? "s" : ""}
            {result.dupes ? ` · skipped ${result.dupes} duplicate${result.dupes !== 1 ? "s" : ""}` : ""}.
          </p>
        )}
      </section>
    </div>
  );
}
