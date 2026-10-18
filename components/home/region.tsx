"use client";
// Regional pricing. Country comes from the visitor's IP (/api/geo): Pakistan sees the PKR price, every other
// country sees the USD price converted to its own currency. A switch lets them view plain USD.
// Server render = USD, which is what crawlers see.
import { createContext, useContext, useEffect, useState } from "react";
import { currencyOf, priceFor, type Plan } from "@/lib/plans";

type Mode = "local" | "usd";
const Ctx = createContext<{ country: string; mode: Mode; set: (m: Mode) => void }>({ country: "", mode: "usd", set: () => {} });

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState("");
  const [mode, setMode] = useState<Mode>("local");
  useEffect(() => {
    fetch("/api/geo", { cache: "no-store" }).then((r) => r.json()).then((j) => setCountry(String(j.country || ""))).catch(() => {});
  }, []);
  // Currency follows the visitor's country automatically; there is no manual switch.
  const set = (m: Mode) => setMode(m);
  return <Ctx.Provider value={{ country, mode, set }}>{children}</Ctx.Provider>;
}

export function RegionToggle() {
  // Automatic currency: no switch is shown to the visitor.
  return null;
}

export function Price({ plan }: { plan: Plan }) {
  const { country, mode } = useContext(Ctx);
  if (plan.custom) return <b>Custom</b>;
  const p = priceFor(plan, mode === "local" ? country : "");
  return <><b>{p.label}</b><span>{plan.price ? "/ month" : "forever"}</span></>;
}
