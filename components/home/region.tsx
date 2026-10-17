"use client";
// Regional pricing: Pakistan pays in PKR (lower), everyone else in USD. Guessed from the browser
// time zone (instant, no flash), switchable by hand, remembered. Server render = USD, which is what crawlers see.
import { createContext, useContext, useEffect, useState } from "react";
import type { Plan } from "@/lib/plans";

type Region = "pk" | "intl";
const Ctx = createContext<{ region: Region; set: (r: Region) => void }>({ region: "intl", set: () => {} });

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<Region>("intl");
  useEffect(() => {
    let r: Region = "intl";
    try { if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Karachi") r = "pk"; } catch {}
    try { const v = localStorage.getItem("pm-region"); if (v === "pk" || v === "intl") r = v; } catch {}
    setRegion(r);
  }, []);
  const set = (r: Region) => { setRegion(r); try { localStorage.setItem("pm-region", r); } catch {} };
  return <Ctx.Provider value={{ region, set }}>{children}</Ctx.Provider>;
}

export function RegionToggle() {
  const { region, set } = useContext(Ctx);
  return (
    <div className="rgsw" role="group" aria-label="Pricing region">
      <button type="button" className={region === "pk" ? "on" : ""} aria-pressed={region === "pk"} onClick={() => set("pk")}>Pakistan · PKR</button>
      <button type="button" className={region === "intl" ? "on" : ""} aria-pressed={region === "intl"} onClick={() => set("intl")}>International · USD</button>
    </div>
  );
}

export function Price({ plan }: { plan: Plan }) {
  const { region } = useContext(Ctx);
  if (plan.custom) return <b>Custom</b>;
  if (!plan.price) return <><b>{region === "pk" ? "Rs 0" : "$0"}</b><span>forever</span></>;
  return region === "pk" && plan.pkr
    ? <><b>Rs {plan.pkr.toLocaleString("en-US")}</b><span>/ month</span></>
    : <><b>${plan.price}</b><span>/ month</span></>;
}
