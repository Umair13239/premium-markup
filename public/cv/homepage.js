/* Umair Abbas — Design in Motion. Scroll + interaction engine. */
(function () {
  // Set before anything else so the browser never restores a mid-page scroll
  // position on refresh (which would break the pinned hero intro).
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Smooth scroll + GSAP wiring ---------- */
  let lenis = null;
  function boot() {
    gsap.registerPlugin(ScrollTrigger);

    // Always begin at the top. Otherwise a refresh restores the old scroll
    // position *inside* the pinned hero, which scrubs the intro forward and
    // hides the floating project cards before the user has scrolled.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    if (!reduce && !isTouch && window.Lenis) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
      window.__lenis = lenis;
      lenis.scrollTo(0, { immediate: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    cursor();
    nav();
    scenesBg();
    heroScene();
    manifesto();
    projects();
    aboutTimeline();
    expertise();
    reveals();
    counters();
    contact();

    // Force the page to the very top on load, defeating both browser scroll
    // restoration and ScrollTrigger's own saved position — otherwise a refresh
    // lands mid-page and the pinned hero intro never plays.
    if (ScrollTrigger.clearScrollMemory) ScrollTrigger.clearScrollMemory();
    ScrollTrigger.refresh();
    const resetTop = () => { window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); };
    resetTop();
    requestAnimationFrame(resetTop);
    // 'load' fires after the browser's own scroll restoration, and a short
    // settle handles engines (and Lenis) that re-apply a saved position late.
    addEventListener('load', () => { resetTop(); setTimeout(() => { resetTop(); ScrollTrigger.refresh(); }, 80); });
  }

  /* ---------- Custom cursor + magnetic ---------- */
  function cursor() {
    if (isTouch) return;
    const dot = $('#cur-dot'), ring = $('#cur-ring');
    if (!dot) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    const grow = () => ring.classList.add('is-grow'), shrink = () => ring.classList.remove('is-grow');
    $$('a, button, .magnetic, [data-cursor="grow"]').forEach((el) => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.28}px, ${y * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- Nav ---------- */
  function nav() {
    const bar = $('#nav');
    ScrollTrigger.create({ start: 60, end: 'max',
      onUpdate: (s) => bar.classList.toggle('is-solid', s.progress > 0 || s.scroll() > 60) });
    ScrollTrigger.create({ trigger: '#contact', start: 'top 60%', end: 'bottom bottom',
      onToggle: (s) => bar.classList.toggle('is-hidden', s.isActive) });

    // Menu links -> smooth scroll
    $$('[data-goto]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const t = $(a.getAttribute('data-goto'));
      if (!t) return;
      const y = t.getBoundingClientRect().top + (lenis ? lenis.scroll : scrollY);
      if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: 'smooth' });
      $('#menu').classList.remove('is-open'); $('#burger').classList.remove('is-open');
    }));
    const burger = $('#burger'), menu = $('#menu');
    burger.addEventListener('click', () => { const o = menu.classList.toggle('is-open'); burger.classList.toggle('is-open', o); });
  }

  /* ---------- Per-scene atmosphere (bg + ink) ---------- */
  function scenesBg() {
    const root = document.documentElement;
    $$('[data-bg]').forEach((sec) => {
      const bg = sec.getAttribute('data-bg');
      const ink = sec.getAttribute('data-ink') || '#f4f1ea';
      const acc = sec.getAttribute('data-acc') || '#e8a33d';
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 45%',
        onToggle: (s) => { if (s.isActive) {
          gsap.to(root, { '--bg': bg, '--ink': ink, '--acc': acc, duration: 0.7, ease: 'power2.out',
            onUpdate: () => { document.body.style.background = getComputedStyle(root).getPropertyValue('--bg'); } });
          root.style.setProperty('--bg', bg); root.style.setProperty('--ink', ink); root.style.setProperty('--acc', acc);
          document.body.style.background = bg; document.body.style.color = ink;
          root.classList.toggle('paper', sec.hasAttribute('data-paper'));
        } } });
    });
  }

  /* ---------- Hero 3D scene ---------- */
  function heroScene() {
    const stage = $('#hero'), camera = $('#hero-cam');
    if (!stage) return;

    // Mouse camera tilt
    if (!isTouch && !reduce) {
      let tx = 0, ty = 0, cxr = 0, cyr = 0;
      stage.addEventListener('mousemove', (e) => {
        const r = stage.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5);
        ty = ((e.clientY - r.top) / r.height - 0.5);
      });
      (function loop() {
        cxr += (tx - cxr) * 0.06; cyr += (ty - cyr) * 0.06;
        camera.style.setProperty('--rx', (cyr * -6).toFixed(2) + 'deg');
        camera.style.setProperty('--ry', (cxr * 9).toFixed(2) + 'deg');
        $$('.plane', camera).forEach((p) => {
          const d = parseFloat(p.dataset.depth || 0);
          p.style.setProperty('--px', (cxr * d * -34).toFixed(1) + 'px');
          p.style.setProperty('--py', (cyr * d * -26).toFixed(1) + 'px');
        });
        requestAnimationFrame(loop);
      })();
    }

    // Intro timeline
    if (!reduce) {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from('.plane', { opacity: 0, scale: 0.82, z: -260, duration: 1.15, stagger: 0.09, ease: 'power3.out' })
        .from('#hero .line span', { yPercent: 120, duration: 1, stagger: 0.11, ease: 'power4.out' }, '-=0.8')
        .from('.hero-ghost', { opacity: 0, duration: 1.4, ease: 'power2.out' }, '-=1.1')
        .from('.hero-meta > *', { opacity: 0, y: 22, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, '-=0.7')
        .from('.hero-cta > *, .hero-scroll', { opacity: 0, y: 18, duration: 0.6, stagger: 0.08 }, '-=0.5');
    }

    // Scroll: camera dives through the scene, planes separate & fade
    if (!reduce) {
      const st = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=110%', scrub: 1, pin: true, anticipatePin: 1 } });
      // Use .to() (not .fromTo) so each element animates *from its actual
      // resting state*. A fromTo re-seeds a different baseline on the first
      // scroll, which snapped the whole 3D scene on the very first pixel.
      // The camera dive (z) + the veil fading in create the transition. Planes
      // must NOT tween z OR opacity here: the intro owns plane depth AND opacity,
      // and a second tween on either made the scene snap/vanish on scroll or
      // refresh. Here they only drift with the camera; the veil hides them.
      st.to('#hero-cam', { z: 620, ease: 'power1.in', force3D: true }, 0)
        .to('.plane', { y: (i, t) => -40 * (parseFloat(t.dataset.depth || 0.4) + 0.3), ease: 'power1.in', stagger: 0.02 }, 0)
        .to('.hero-copy', { opacity: 0, y: -40, ease: 'power1.in' }, 0)
        .to('.hero-ghost', { scale: 1.5, opacity: 0, ease: 'power1.in' }, 0)
        .fromTo('#hero-veil', { opacity: 0 }, { opacity: 1, ease: 'power2.in' }, 0.25);
    }
  }

  /* ---------- Manifesto marquee ---------- */
  function manifesto() {
    if (reduce) return;
    $$('.marquee-track').forEach((tr) => {
      const dir = tr.dataset.dir === 'rev' ? 1 : -1;
      gsap.to(tr, { xPercent: 50 * dir, ease: 'none', scrollTrigger: { trigger: tr.closest('.marquee'), start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    $$('.man-line').forEach((l) => {
      gsap.from(l, { xPercent: (i) => (l.dataset.from === 'r' ? 12 : -12), opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: l, start: 'top 92%', end: 'top 40%', scrub: 1 } });
    });
  }

  /* ---------- Project scenes ---------- */
  function projects() {
    $$('.project').forEach((sec) => {
      const layers = $$('.p-layer', sec);
      layers.forEach((l) => {
        const depth = parseFloat(l.dataset.depth || 0);
        gsap.fromTo(l, { yPercent: depth * 16, rotate: (parseFloat(l.dataset.rot || 0)) * 1.6 },
          { yPercent: depth * -16, rotate: 0, ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
      // headline reveal
      const head = $('.p-head', sec);
      if (head) gsap.from($$('.line span', head), { yPercent: 115, duration: 1, stagger: 0.08, ease: 'power4.out',
        scrollTrigger: { trigger: head, start: 'top 82%' } });
      // number counter parallax
      const idx = $('.p-index', sec);
      if (idx) gsap.fromTo(idx, { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    // SCA booklet fan
    const fan = $('#sca-fan');
    if (fan && !reduce) {
      gsap.fromTo($$('.fan-page', fan),
        { rotate: 0, x: 0, y: 0, opacity: 0 },
        { rotate: (i) => (i - 1.5) * 11, x: (i) => (i - 1.5) * 120, y: (i) => Math.abs(i - 1.5) * 18, opacity: 1,
          ease: 'power2.out', stagger: 0.05,
          scrollTrigger: { trigger: '#sca-fan', start: 'top 78%', end: 'top 30%', scrub: 1 } });
    }

    // Tyde assemble: logo elements converge then site rises
    const tyde = $('#tyde-scene');
    if (tyde && !reduce) {
      gsap.timeline({ scrollTrigger: { trigger: tyde, start: 'top 70%', end: 'bottom bottom', scrub: 1 } })
        .from('.tyde-chip', { x: (i) => (i % 2 ? 200 : -200), y: (i) => (i < 2 ? -120 : 120), opacity: 0, rotate: (i) => (i % 2 ? 20 : -20), stagger: 0.06, ease: 'power2.out' })
        .from('.tyde-site', { yPercent: 24, opacity: 0, ease: 'power2.out' }, '-=0.3');
    }

    // Wall scatter -> grid
    const wall = $('#wall-grid');
    if (wall && !reduce) {
      gsap.from($$('.wall-cell', wall), {
        x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-160, 160),
        rotate: () => gsap.utils.random(-24, 24), scale: 0.7, opacity: 0, ease: 'power3.out',
        duration: 1.1, stagger: { each: 0.04, from: 'random' },
        scrollTrigger: { trigger: wall, start: 'top 75%', end: 'top 25%', scrub: 1 } });
    }
  }

  /* ---------- About timeline ---------- */
  function aboutTimeline() {
    const rail = $('#about-rail');
    if (rail) gsap.fromTo('#rail-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: rail, start: 'top 60%', end: 'bottom 70%', scrub: 1 } });
    $$('.tl-item').forEach((it) => gsap.from(it, { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: it, start: 'top 82%' } }));
  }

  /* ---------- Expertise interactive index ---------- */
  function expertise() {
    const rows = $$('.xp-row'), stageImg = $('#xp-visual-img'), stageCap = $('#xp-visual-cap'), num = $('#xp-visual-num');
    if (!rows.length) return;
    const set = (row) => {
      rows.forEach((r) => r.classList.toggle('is-active', r === row));
      const src = row.dataset.img; if (src && stageImg) { stageImg.style.opacity = 0; setTimeout(() => { stageImg.src = src; stageImg.style.opacity = 1; }, 140); }
      if (stageCap) stageCap.textContent = row.dataset.cap || '';
      if (num) num.textContent = row.dataset.num || '';
    };
    rows.forEach((r) => { r.addEventListener('mouseenter', () => set(r)); r.addEventListener('click', () => set(r)); });
    set(rows[0]);
  }

  /* ---------- Generic reveals ---------- */
  function reveals() {
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { opacity: 0, y: 34, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    $$('.split-up').forEach((el) => {
      gsap.from($$('.line span', el), { yPercent: 115, duration: 1, stagger: 0.08, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 84%' } });
    });
  }

  /* ---------- Counters ---------- */
  function counters() {
    $$('[data-count]').forEach((el) => {
      const to = parseFloat(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' },
        onUpdate: () => { el.firstChild.textContent = Math.round(obj.v); } });
    });
  }

  /* ---------- Contact form -> /api/contact (real) ---------- */
  // This used to fake "Message sent ✓" and throw the enquiry away. It now posts
  // to the same endpoint as the main site, so it lands in /admin/leads.
  function contact() {
    const f = $('#contact-form'); if (!f) return;
    const status = $('#cf-status');
    const setStatus = (msg, cls) => {
      if (!status) return;
      status.textContent = msg || '';
      status.className = 'cf-status' + (cls ? ' ' + cls : '');
    };
    const val = (sel) => { const el = f.querySelector(sel); return (el && el.value || '').trim(); };

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('#send-btn');
      const consentEl = f.querySelector('[name="consent"]');
      const payload = {
        name: val('[name="name"]'),
        email: val('[name="email"]'),
        message: val('[name="message"]'),
        consent: !!(consentEl && consentEl.checked),
        website: val('[name="website"]'), // honeypot
        // Sensible defaults — this short CV form doesn't ask for these.
        budget: 'Not sure yet',
        projectType: 'Other',
        referral: 'Portfolio / CV page',
      };

      if (!payload.name || payload.name.length < 2) return setStatus('Please add your name.', 'err');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return setStatus('Please enter a valid email address.', 'err');
      if (payload.message.length < 10) return setStatus('A sentence or two about the project helps.', 'err');
      if (!payload.consent) return setStatus('Please tick the box so I can reply to you.', 'err');

      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…'; setStatus('');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Something went wrong — please try again.');
        btn.textContent = 'Message sent ✓'; btn.classList.add('is-sent');
        setStatus("Thanks — I'll get back to you shortly.", 'ok');
        f.reset();
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('is-sent'); btn.disabled = false; }, 2600);
      } catch (err) {
        btn.disabled = false; btn.textContent = orig;
        setStatus((err && err.message) || 'Could not send — please email me directly.', 'err');
      }
    });
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
})();
