"use client";
// Mounts homepage behaviour after hydration; the glass R (three.js) is split into its own chunk.
import { useEffect } from "react";
import { initHomeFx } from "./home-fx";

export function HomeFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pm2");
    if (!root) return;
    const stop = initHomeFx(root);
    let stopR: (() => void) | undefined, dead = false;
    const sec = root.querySelector<HTMLElement>("#ptop"), cv = root.querySelector<HTMLCanvasElement>("#gl");
    const gl = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();
    if (sec && !gl) sec.classList.add("nogl");
    const load = () => { if (sec && cv && gl && !dead) import("./glass-r").then((m) => { if (!dead) stopR = m.initGlassR(sec, cv); }).catch(() => sec.classList.add("nogl")); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(load, { timeout: 2500 }); else setTimeout(load, 1200);
    return () => { dead = true; stop(); stopR?.(); };
  }, []);
  return null;
}
