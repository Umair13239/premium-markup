/* Umair Abbas — Work Explorer. Category → project → asset-type browser. */
(function () {
  const D = window.PORTFOLIO_DATA;
  if (!D) return;
  const $ = (s, c = document) => c.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const catLabel = (id) => (D.categories.find((c) => c.id === id) || {}).label || id;
  // A "logo cover" is shown whole (contained) on a brand-tinted panel instead
  // of being cropped. Explicit p.coverFit wins; otherwise auto-detect a
  // logo-led project (logos, but no website / posts / thumbnails to lead with).
  const coverIsLogo = (p) => {
    if (p.coverFit === 'contain') return true;
    if (p.coverFit === 'cover') return false;
    return !p.website && !(p.posts && p.posts.length) && !(p.thumbs && p.thumbs.length) && !!(p.logos && p.logos.length);
  };
  const buckets = (p) => {
    const out = [];
    if (p.website) out.push({ key: 'website', label: 'Website', n: 1 });
    if (p.videos && p.videos.length) out.push({ key: 'videos', label: 'Videos', n: p.videos.length });
    const g = [['posts', 'Posts'], ['thumbs', 'Thumbnails'], ['logos', 'Logos'], ['flyers', 'Flyers'], ['certs', 'Certificates'], ['covers', 'Book Covers']];
    g.forEach(([k, lbl]) => { if (p[k] && p[k].length) out.push({ key: k, label: lbl, n: p[k].length }); });
    return out;
  };

  /* ---------- category bar ---------- */
  let activeCat = 'all';
  function renderCats() {
    const wrap = $('#wx-cats'); if (!wrap) return;
    wrap.innerHTML = '';
    const mk = (id, label) => {
      const count = id === 'all' ? D.projects.length : D.projects.filter((p) => p.category === id).length;
      if (id !== 'all' && count === 0) return;
      const b = el('button', 'wx-cat' + (id === activeCat ? ' is-active' : ''), esc(label) + '<span class="c">' + count + '</span>');
      b.addEventListener('click', () => { activeCat = id; renderCats(); renderGrid(); });
      wrap.appendChild(b);
    };
    mk('all', 'All Work');
    D.categories.forEach((c) => mk(c.id, c.label));
  }

  /* ---------- project grid ---------- */
  function renderGrid() {
    const grid = $('#wx-grid'); if (!grid) return;
    grid.innerHTML = '';
    const list = D.projects.filter((p) => activeCat === 'all' || p.category === activeCat);
    if (!list.length) { grid.appendChild(el('div', 'wx-empty', 'Nothing here yet.')); return; }
    list.forEach((p) => {
      const card = el('div', 'wx-card');
      card.style.setProperty('--acc', p.accent || '#e8a33d');
      const cover = p.cover
        ? '<div class="cover' + (coverIsLogo(p) ? ' logo' : '') + '"><img src="' + esc(p.cover) + '" alt="' + esc(p.name) + '" loading="lazy"></div>'
        : '<div class="cover empty">No cover yet</div>';
      const types = buckets(p).map((b) => '<span>' + esc(b.label) + '</span>').join('') || '<span>Coming soon</span>';
      card.innerHTML =
        cover +
        '<div class="cbadge">' + esc(catLabel(p.category)) + '</div>' +
        '<div class="cinfo"><div><h3>' + esc(p.name) + '</h3><div class="role">' + esc(p.role || '') + '</div></div>' +
        '<div class="go">↗</div></div>' +
        '<div class="ctypes">' + types + '</div>';
      card.addEventListener('click', () => openModal(p));
      grid.appendChild(card);
    });
  }

  /* ---------- modal ---------- */
  const modal = $('#wx-modal');
  let openP = null, activeTab = null;

  function openModal(p) {
    openP = p;
    modal.style.setProperty('--acc', p.accent || '#e8a33d'); // brand-tint the tabs
    $('#wx-mcat').textContent = catLabel(p.category);
    $('#wx-mtitle').textContent = p.name;
    $('#wx-mrole').textContent = p.role || '';
    const bs = buckets(p);
    activeTab = bs.length ? bs[0].key : null;
    renderTabs(bs);
    renderBody();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    const panel = $('.wx-panel'); if (panel) panel.scrollTop = 0;
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
    openP = null;
  }

  function renderTabs(bs) {
    const wrap = $('#wx-tabs'); wrap.innerHTML = '';
    if (!bs.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';
    bs.forEach((b) => {
      const t = el('button', 'wx-tab' + (b.key === activeTab ? ' is-active' : ''),
        esc(b.label) + (b.key !== 'website' ? '<span class="n">' + b.n + '</span>' : ''));
      t.addEventListener('click', () => { activeTab = b.key; renderTabs(bs); renderBody(); });
      wrap.appendChild(t);
    });
  }

  function galleryTiles(items, variant) {
    const gcls = variant === 'square' || variant === 'logo' ? ' square' : variant === 'wide' ? ' wide' : '';
    return '<div class="wx-gallery' + gcls + '">' +
      items.map((it) =>
        '<div class="wx-tile ' + variant + (it.fill ? ' is-fill' : '') + '"><div class="im"><img src="' + esc(it.src) + '" alt="' + esc(it.title || '') + '" loading="lazy">' +
        '<div class="view" data-preview="' + esc(it.src) + '" data-cap="' + esc(it.title || '') + '"><b>◉ Preview</b></div></div>' +
        (it.title ? '<div class="cap">' + esc(it.title) + '</div>' : '') + '</div>'
      ).join('') + '</div>';
  }

  /* ---------- lightbox (slides through the current tab's images) ---------- */
  const lb = el('div', 'wx-lightbox');
  lb.setAttribute('data-lenis-prevent', '');
  lb.innerHTML =
    '<button class="lb-close">Close ✕</button>' +
    '<div class="lb-count"></div>' +
    '<button class="lb-nav lb-prev" aria-label="Previous image">‹</button>' +
    '<img alt="">' +
    '<button class="lb-nav lb-next" aria-label="Next image">›</button>' +
    '<div class="lb-cap"></div>' +
    '<div class="lb-zoom">' +
      '<button class="lb-out" aria-label="Zoom out">−</button>' +
      '<span class="lb-pct">100%</span>' +
      '<button class="lb-in" aria-label="Zoom in">+</button>' +
    '</div>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap'),
    lbPrev = lb.querySelector('.lb-prev'), lbNext = lb.querySelector('.lb-next'),
    lbCount = lb.querySelector('.lb-count'),
    lbIn = lb.querySelector('.lb-in'), lbOut = lb.querySelector('.lb-out'), lbPct = lb.querySelector('.lb-pct');
  let lbList = [], lbIdx = 0;

  /* zoom + pan state */
  const MIN = 1, MAX = 5;
  let scale = 1, tx = 0, ty = 0;
  function applyT() {
    lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    lbImg.classList.toggle('zoomed', scale > 1);
    lbPct.textContent = Math.round(scale * 100) + '%';
    lbIn.disabled = scale >= MAX; lbOut.disabled = scale <= MIN;
  }
  function resetZoom() { scale = 1; tx = 0; ty = 0; applyT(); }
  function setZoom(next) {
    next = Math.min(MAX, Math.max(MIN, Math.round(next * 100) / 100));
    if (next === scale) return;
    scale = next;
    if (scale === 1) { tx = 0; ty = 0; }
    applyT();
  }

  function showLb(i) {
    if (!lbList.length) return;
    lbIdx = (i + lbList.length) % lbList.length;
    const it = lbList[lbIdx];
    lbImg.src = it.src; lbCap.textContent = it.cap || '';
    const multi = lbList.length > 1;
    lbPrev.hidden = !multi; lbNext.hidden = !multi;
    lbCount.textContent = multi ? (lbIdx + 1) + ' / ' + lbList.length : '';
    resetZoom();
  }
  function openLightbox(list, idx) {
    lbList = list; showLb(idx);
    lb.classList.add('is-open'); document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { lb.classList.remove('is-open'); lbImg.src = ''; lbList = []; resetZoom(); if (!modal.classList.contains('is-open')) document.body.style.overflow = ''; }
  const lbOpen = () => lb.classList.contains('is-open');
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLb(lbIdx - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLb(lbIdx + 1); });
  lbIn.addEventListener('click', (e) => { e.stopPropagation(); setZoom(scale + 0.5); });
  lbOut.addEventListener('click', (e) => { e.stopPropagation(); setZoom(scale - 0.5); });

  /* wheel to zoom, drag to pan when zoomed, double-click to toggle */
  lb.addEventListener('wheel', (e) => { if (!lbOpen()) return; e.preventDefault(); setZoom(scale + (e.deltaY < 0 ? 0.3 : -0.3)); }, { passive: false });
  lbImg.addEventListener('dblclick', (e) => { e.preventDefault(); setZoom(scale > 1 ? 1 : 2.5); });
  let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
  lbImg.addEventListener('mousedown', (e) => { if (scale <= 1) return; e.preventDefault(); dragging = true; moved = false; sx = e.clientX; sy = e.clientY; ox = tx; oy = ty; lbImg.style.transition = 'none'; });
  addEventListener('mousemove', (e) => { if (!dragging) return; tx = ox + (e.clientX - sx); ty = oy + (e.clientY - sy); if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 3) moved = true; applyT(); });
  addEventListener('mouseup', () => { if (dragging) { dragging = false; lbImg.style.transition = ''; } });

  lb.addEventListener('click', (e) => { if (e.target === lb && scale === 1 && !moved) closeLightbox(); moved = false; });
  addEventListener('keydown', (e) => {
    if (!lbOpen()) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showLb(lbIdx - 1);
    else if (e.key === 'ArrowRight') showLb(lbIdx + 1);
    else if (e.key === '+' || e.key === '=') setZoom(scale + 0.5);
    else if (e.key === '-') setZoom(scale - 0.5);
  });

  function renderBody() {
    const body = $('#wx-body'); const p = openP; if (!body || !p) return;
    if (!activeTab) {
      body.innerHTML = '<div class="wx-drop"><b>Nothing added yet</b>Drop this client\'s website link, posts, logos, flyers or certificates into <code>projects-data.js</code> and they\'ll appear here.</div>';
      return;
    }
    if (activeTab === 'website') {
      const w = p.website || {};
      const hasUrl = !!w.url;
      const bar =
        '<div class="bar"><i></i><i></i><i></i><span class="u">' + esc(hasUrl ? w.url : 'Live link coming soon') + '</span>' +
        (hasUrl ? '<a href="' + esc(w.url) + '" target="_blank" rel="noopener">Open live ↗</a>' : '') + '</div>';
      let frame;
      if (hasUrl) {
        frame = '<div class="frame"><iframe src="' + esc(w.url) + '" loading="lazy" title="' + esc(p.name) + '"></iframe>' +
          (w.shot ? '<div class="fallback" data-fb style="display:none"><img src="' + esc(w.shot) + '" alt=""><div>This site blocks live embedding.</div><a class="btn primary" href="' + esc(w.url) + '" target="_blank" rel="noopener">Open live site ↗</a></div>' : '') +
          '</div>';
      } else {
        frame = '<div class="frame"><div class="fallback">' +
          (w.shot ? '<img src="' + esc(w.shot) + '" alt="">' : '') +
          '<div>Live link coming soon — add it in <code>projects-data.js</code>.</div></div></div>';
      }
      body.innerHTML = '<div class="wx-site">' + bar + frame + '</div>';
      // Scale the 1440px-wide desktop iframe down to fit the frame, so the
      // client's desktop layout renders (not the mobile breakpoint).
      const fr = body.querySelector('.frame'), ifr0 = body.querySelector('iframe');
      if (fr && ifr0) {
        const fit = () => {
          const s = fr.clientWidth / 1440;
          if (!s) return;
          ifr0.style.height = (fr.clientHeight / s) + 'px';
          ifr0.style.transform = 'scale(' + s + ')';
        };
        requestAnimationFrame(fit);
        if (window.ResizeObserver) new ResizeObserver(fit).observe(fr);
      }
      // if the iframe fails to load in a couple seconds, reveal the screenshot fallback
      if (hasUrl && w.shot) {
        const ifr = body.querySelector('iframe'), fb = body.querySelector('[data-fb]');
        let loaded = false;
        ifr.addEventListener('load', () => { loaded = true; });
        setTimeout(() => { if (!loaded && fb) fb.style.display = 'flex'; }, 2600);
      }
      return;
    }
    if (activeTab === 'videos') {
      const vids = p.videos || [];
      body.innerHTML = '<div class="wx-vids">' + vids.map((v) =>
        '<div class="wx-vid"><video src="' + esc(v.src) + '" controls preload="metadata" playsinline></video>' +
        (v.title ? '<div class="cap">' + esc(v.title) + '</div>' : '') + '</div>'
      ).join('') + '</div>';
      return;
    }
    const variant = activeTab === 'posts' ? 'square' : activeTab === 'thumbs' ? 'wide' : activeTab === 'logos' ? 'logo' : activeTab === 'flyers' ? 'flyer' : activeTab === 'covers' ? 'flyer' : 'square';
    const items = p[activeTab] || [];
    body.innerHTML = items.length ? galleryTiles(items, variant)
      : '<div class="wx-drop"><b>No ' + esc(activeTab) + ' yet</b>Add them in <code>projects-data.js</code>.</div>';
  }

  $('#wx-close').addEventListener('click', closeModal);
  $('#wx-body').addEventListener('click', (e) => {
    const v = e.target.closest('[data-preview]');
    if (!v) return;
    const all = [...$('#wx-body').querySelectorAll('[data-preview]')];
    const list = all.map((n) => ({ src: n.getAttribute('data-preview'), cap: n.getAttribute('data-cap') }));
    openLightbox(list, all.indexOf(v));
  });
  modal.querySelectorAll('[data-wx-close]').forEach((n) => n.addEventListener('click', closeModal));
  // Escape closes the lightbox first (if open); only then the project modal.
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lbOpen() && modal.classList.contains('is-open')) closeModal(); });

  function boot() { renderCats(); renderGrid(); }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
})();
