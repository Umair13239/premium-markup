// Homepage v2 markup. Ported from docs/style-page.html; behaviour lives in home-fx.ts.
import Image from "next/image";
import { siteConfig } from "@/site.config";

const PORTAL = siteConfig.leadsPortalUrl;
const SAY_TEXT = "Most freelancers spend the week hunting for clients. With Leads Portal you spend it pitching businesses that already need you, with the proof ready before you say hello.";
const SAY_HL = new Set(["pitching", "already", "need", "you,", "proof"]);
const SAY = SAY_TEXT.split(" ").map((w, i) => (
  <span key={i} className={SAY_HL.has(w) ? "v" : undefined}>{w}{" "}</span>
));

export function HomeMarkup({ businesses }: { businesses: number }) {
  // Live from the Leads Portal (rounded down). Never hardcode this number.
  const long = Math.floor(businesses / 1000) * 1000;
  const longTxt = long.toLocaleString("en-US") + "+";
  const kTxt = Math.floor(businesses / 1000);
  return (
    <>

<section className="ptop" id="ptop" data-live>
  <canvas id="gl"></canvas>
  <div className="tcopy">
    <div className="eyebrow">Leads Portal</div>
    <h1 className="h-xl">Find clients.<br /><span style={{ color: "var(--brand)" }}>Win them faster.</span></h1>
    <p className="lede">{longTxt} local businesses, checked for WhatsApp. One click builds the demo work you pitch: a website, an SEO audit, a UI design and more.</p>
    <div className="row"><a className="pbtn brand" href={PORTAL}>Start free</a><a className="plink" href="https://www.youtube.com/watch?v=zBpJ8hAKqtU" target="_blank" rel="noopener">Watch the 4-minute tour</a></div>
  </div>
  <div className="tc lg tc1"><small>WhatsApp check</small><b style={{ marginTop: "4px" }}>+966 5•• ••• 214</b><div style={{ marginTop: "8px" }}><i className="dot"></i><span className="ok">On WhatsApp</span></div></div>
  <div className="tc lg tc2"><small>One-click demo work</small><b>Ready to pitch</b><span className="ptag v">Website</span><span className="ptag">SEO audit</span><span className="ptag">UI design</span></div>
  <div className="tc lg tc3"><small>AI receptionist · live</small><b>“Ahlan! How can I help?”</b><div className="wave"><i></i><i style={{ animationDelay: "-.2s" }}></i><i style={{ animationDelay: "-.5s" }}></i><i style={{ animationDelay: "-.1s" }}></i><i style={{ animationDelay: "-.7s" }}></i><i style={{ animationDelay: "-.3s" }}></i><i style={{ animationDelay: "-.6s" }}></i><i style={{ animationDelay: "-.4s" }}></i></div></div>
</section>
<section className="say" id="say"><div className="pin"><p id="sayp">{SAY}</p></div></section>
<section className="prt" id="hero">
  <div className="pin">
    <div className="copy" id="copy">
      <div className="eyebrow">The portal</div>
      <h2 className="h-xl" style={{ fontSize: "clamp(40px,5.6vw,80px)" }}>Everything you need.<br /><span style={{ color: "var(--brand)" }}>On one screen.</span></h2>
    </div>
    <div className="stage3d" id="stage" data-dark><div className="device"><Image src="/home/portal-shot.png" alt="Leads Portal dashboard" width={1920} height={1080} sizes="(max-width: 1060px) 92vw, 980px" /></div></div>
  </div>
</section>
<section className="story" id="story" data-dark>
  <div className="pin">
    <div>
      <div className="eyebrow" style={{ color: "var(--brand-l)" }}>How it works</div>
      <h2 style={{ marginTop: "12px" }}>The <span className="lead-w">LEAD</span> method.<br /><span style={{ color: "var(--brand-l)" }}>One new client.</span></h2>
      <div className="stepsw"><i className="bar" id="bar"></i><ol className="steps" id="steps">
        <li className="on"><h3><span>01</span><em>L</em>ocate</h3><p>Pick a city and a category. {longTxt} businesses with phones, emails, ratings and socials.</p></li>
        <li><h3><span>02</span><em>E</em>valuate</h3><p>Every number verified on WhatsApp, every detail checked, before you reach out.</p></li>
        <li><h3><span>03</span><em>A</em>ssemble</h3><p>One click builds the proof for whatever you sell: a demo website, an SEO audit, a UI design.</p></li>
        <li><h3><span>04</span><em>D</em>eliver</h3><p>One tap opens WhatsApp with the message and the demo ready. Track every reply.</p></li>
      </ol></div>
    </div>
    <div className="scene" id="scene">
      <div className="floor" id="floor"></div>
      <div className="slab lg dk" data-s="60" data-b="1"><div className="k">L · Locate</div>
        <div className="ln"><i className="pin-ic"></i><b>Beauty salon</b><em>★ 4.8</em></div><div className="ln"><i className="pin-ic"></i><b>Barber studio</b><em>★ 4.6</em></div><div className="ln"><i className="pin-ic"></i><b>Nail lounge</b><em>★ 4.9</em></div></div>
      <div className="slab lg dk" data-s="60" data-b="1"><div className="k">E · Evaluate</div>
        <div className="ln"><b>+966 5•• ••• 214</b><span className="ok">✓ WhatsApp</span></div><div className="ln"><b>+966 5•• ••• 870</b><span className="ok">✓ WhatsApp</span></div><div className="ln"><b>+966 1•• ••• 033</b><em>Landline</em></div></div>
      <div className="slab lg dk" data-s="60" data-b="1"><div className="k">A · Assemble</div><div className="chips"><span className="v">Website</span><span>SEO audit</span><span>UI design</span></div><div className="site"><div className="im"></div><i></i><i className="cta"></i></div></div>
      <div className="slab lg dk" data-s="60" data-b="1"><div className="k">D · Deliver</div>
        <div className="bub me">Salam! I made a free demo website for your salon: <u>demo.link/salon</u><small>10:42</small></div><div className="bub">Wow, this looks great. Price? </div></div>
    </div>
  </div>
</section>
<section className="stats" id="stats">
  <div><b data-n={kTxt} data-s="K+">0</b><span>local businesses</span></div>
  <div><b data-n="260" data-s="">0</b><span>demo sites built</span></div>
  <div><b data-n="90" data-s="s">0</b><span>to build a demo</span></div>
</section>
<section className="shots" id="shots">
  <div className="shots-head"><div className="eyebrow">Real screens</div><h2>Everything happens in one portal.</h2></div>
  <div className="shots-grid">
    <figure className="shot full"><video className="shot-video" autoPlay muted loop playsInline preload="metadata" poster="/home/feature-dashboard.webp" aria-label="Leads Portal dashboard, live numbers"><source src="/home/dashboard-loop.webm" type="video/webm" /></video><figcaption><b>One dashboard.</b> Total leads, new this week, phone coverage and WhatsApp reachability, live.</figcaption></figure>
    <figure className="shot"><img src="/home/feature-tiles.webp" alt="Lead stats tiles in the Leads Portal" loading="lazy" width={1142} height={142} /><figcaption><b>Track the numbers</b> that matter: leads collected, phone coverage and WhatsApp reach.</figcaption></figure>
    <figure className="shot big"><img src="/home/feature-collect.webp" alt="Collect leads by category and city in the Leads Portal" loading="lazy" width={1800} height={900} /><figcaption><b>Collect leads</b> by category and city, saved straight to your database.</figcaption></figure>
    <figure className="shot"><img src="/home/feature-whatsapp.webp" alt="WhatsApp check in the Leads Portal: numbers checked, on WhatsApp, not on WhatsApp" loading="lazy" width={1472} height={660} /><figcaption><b>Check WhatsApp</b> numbers in the background.</figcaption></figure>
  </div>
</section>
<section className="who" id="who"><div className="pin"><div className="track" id="track">
  <div className="whead rv"><div className="eyebrow">Who it&apos;s for</div><h2>Built for anyone who<br /><span style={{ color: "var(--brand)" }}>sells to local business.</span></h2></div>
  <div className="wc rv" data-tilt style={{ "--i": 1 } as React.CSSProperties}><small>Web designers</small><h3>Send a live demo site, not a portfolio link.</h3><div className="vis"><div className="site" style={{ width: "78%" }}><div className="im"></div><i></i><i className="cta"></i></div></div></div>
  <div className="wc rv" data-tilt style={{ "--i": 2 } as React.CSSProperties}><small>SEO experts</small><h3>Open with their audit score.</h3><div className="vis"><div className="ring"><b>42</b><span>/100</span></div></div></div>
  <div className="wc rv" data-tilt style={{ "--i": 0 } as React.CSSProperties}><small>UI/UX designers</small><h3>Show their app, redesigned.</h3><div className="vis"><div className="ph"><i></i><i></i><i className="v"></i><i></i></div></div></div>
  <div className="wc rv" data-tilt style={{ "--i": 1 } as React.CSSProperties}><small>Marketers</small><h3>Pitch with their own reviews and ratings.</h3><div className="vis"><div className="stars">★ 4.8<span>312 reviews · 9 unanswered</span></div></div></div>
  <div className="wc dk rv" data-tilt style={{ "--i": 2 } as React.CSSProperties}><small>Everyone</small><h3>An AI receptionist that answers their calls.</h3><div className="vis"><div className="wave big"><i></i><i style={{ animationDelay: "-.2s" }}></i><i style={{ animationDelay: "-.5s" }}></i><i style={{ animationDelay: "-.1s" }}></i><i style={{ animationDelay: "-.7s" }}></i><i style={{ animationDelay: "-.3s" }}></i><i style={{ animationDelay: "-.6s" }}></i><i style={{ animationDelay: "-.4s" }}></i><i style={{ animationDelay: "-.8s" }}></i><i style={{ animationDelay: "-.15s" }}></i><i style={{ animationDelay: "-.35s" }}></i><i style={{ animationDelay: "-.55s" }}></i></div></div></div>
</div></div></section>
<section className="end" data-dark>
  <h2>Your next client is<br /><span style={{ color: "var(--brand-l)" }}>already in the list.</span></h2>
  <p>Web designers, SEO experts, UI/UX designers, marketers. Find them, prepare the proof, send it in one tap.</p>
  <div className="chips"><span>Websites</span><span>SEO audits</span><span>UI/UX designs</span><span>AI receptionist</span><span>More coming</span></div>
  <div className="row" style={{ position: "relative" }}><a className="pbtn brand" href={PORTAL}>Start free</a></div>
</section>
    </>
  );
}
