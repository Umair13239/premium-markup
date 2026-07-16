/* ===== Leads Manager — app logic ===== */
(function () {
  'use strict';

  /* ---------- dataset (seed + user imports), enriched & deduped ---------- */
  var SEED = (window.LEADS || []).map(function (d) { d._seed = true; return d; });
  var IMPORT_KEY = 'leadsManager.imported.v1';
  var IMPORTED = [];
  var LEADS = [];

  function loadImported() {
    try { var a = JSON.parse(localStorage.getItem(IMPORT_KEY)); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function persistImported() {
    try { localStorage.setItem(IMPORT_KEY, JSON.stringify(IMPORTED)); return true; }
    catch (e) { return false; }
  }

  /* ---------- API mode helpers ---------- */
  function detectApi() {
    if (location.protocol === 'file:') return Promise.resolve(null); // opened as a file → local mode
    return fetch('/api/health', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return (j && j.ok) ? '/api' : null; })
      .catch(function () { return null; });
  }
  function hydrateFromServer(leads) {
    META = {}; NOTES = {};
    LEADS = leads.map(function (d, i) {
      d._seed = d.source === 'seed';
      d.rating = (typeof d.rating === 'number') ? d.rating : (d.rating == null || d.rating === '' ? null : Number(d.rating));
      d.reviews = d.reviews || 0;
      d._i = i;
      d._search = searchStr(d);
      var m = {};
      if (d.starred) m.star = true;
      if (d.status) m.status = d.status;
      if (d.wa) m.wa = d.wa;
      if (d.wa_checkedAt) m.wa_checkedAt = d.wa_checkedAt;
      if (d.pitched) m.pitched = true;
      if (d.pitched_at) m.pitched_at = d.pitched_at;
      if (d.tags && d.tags.length) m.tags = d.tags.slice();
      if (Object.keys(m).length) META[d.id] = m;
      NOTES[d.id] = (d.notes || []).slice();
      return d;
    });
  }
  function reloadFromServer() {
    return fetch(API + '/leads').then(function (r) { return r.json(); }).then(function (j) { hydrateFromServer(j.leads || []); });
  }

  /* ---------- US state / city / category enrichment (mirrors build_data.py) ---------- */
  var STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia' };
  var NAME2AB = {}; Object.keys(STATES).forEach(function (k) { NAME2AB[STATES[k].toLowerCase()] = k; });

  function getState(addr) {
    if (!addr) return '';
    var m = addr.match(/,\s*([A-Z]{2})\s+\d{5}/); if (m && STATES[m[1]]) return m[1];
    m = addr.match(/,\s*([A-Z]{2})\b/); if (m && STATES[m[1]]) return m[1];
    var low = addr.toLowerCase();
    for (var name in NAME2AB) { if (low.indexOf(name) !== -1) return NAME2AB[name]; }
    return '';
  }
  function getCity(addr, st) {
    if (!addr) return '';
    if (st) {
      var m = addr.match(new RegExp(',\\s*([^,]+),\\s*' + st + '\\s+\\d{5}'));
      if (m) return m[1].trim();
      m = addr.match(new RegExp(',\\s*([^,]+),\\s*' + st + '\\b'));
      if (m) return m[1].trim();
    }
    var parts = addr.split(',').map(function (s) { return s.trim(); });
    return parts.length >= 2 ? parts[parts.length - 2] : '';
  }
  var INV = ['private investigator', 'investigation', 'digital forensic', 'forensic', 'skip tracing', 'skip trace', 'surveillance', 'background check', 'detective', 'data recovery', 'process server'];
  var SEC = ['security guard', 'security service', 'security company', 'security system', 'loss prevention', 'fire watch', 'computer security', 'fire protection', 'guard service', 'alarm', 'bodyguard', 'executive protection', 'patrol'];
  var FIRE = ['firearms', 'shooting range', 'gun shop', 'concealed carry', 'gun club', 'ammunition', 'firearm', 'rifle'];
  var LEGAL = ['attorney', 'legal', 'law firm', 'criminal justice', 'personal injury', 'lawyer', 'bail', 'court'];
  function anyIn(hay, arr) { for (var i = 0; i < arr.length; i++) if (hay.indexOf(arr[i]) !== -1) return true; return false; }
  function classify(rec) {
    var mc = (rec.main_category || '').toLowerCase();
    var q = (rec.query || '').toLowerCase();
    var cats = (rec.categories || '').toLowerCase();
    var sets = [[INV, 'Investigation'], [SEC, 'Security'], [FIRE, 'Firearms & Training'], [LEGAL, 'Legal & Process']];
    var i;
    for (i = 0; i < sets.length; i++) if (anyIn(mc, sets[i][0])) return sets[i][1];
    for (i = 0; i < sets.length; i++) if (anyIn(q, sets[i][0])) return sets[i][1];
    var blob = mc + ' ' + cats + ' ' + q;
    for (i = 0; i < sets.length; i++) if (anyIn(blob, sets[i][0])) return sets[i][1];
    return 'Other';
  }
  function titleCase(s) { return s.replace(/\w\S*/g, function (t) { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); }); }
  function getService(q) {
    if (!q) return '';
    var m = q.match(/^(.+?)\s+in\s+/i);
    return titleCase((m ? m[1] : q).trim());
  }
  function toNum(x) { if (typeof x === 'number') return isNaN(x) ? null : x; if (!x) return null; var n = parseFloat(String(x).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; }
  function toInt(x) { if (typeof x === 'number') return Math.round(x); if (!x) return 0; var n = parseInt(String(x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; }

  function searchStr(d) {
    return [d.name, d.city, d.state_name, d.main_category, d.group, d.service, d.phone, d.address, d.owner, (d.tags || []).join(' ')].join(' ').toLowerCase();
  }
  function enrich(d) {
    if (!d.state) d.state = getState(d.address || '');
    d.state_name = STATES[d.state] || (d.state_name && d.state_name !== 'Unknown' ? d.state_name : 'Unknown');
    if (!d.city) d.city = getCity(d.address || '', d.state);
    if (!d.group) d.group = classify(d);
    if (!d.service) d.service = getService(d.query || '');
    d.rating = toNum(d.rating);
    d.reviews = toInt(d.reviews);
    d._search = searchStr(d);
    return d;
  }

  /* ---------- dedupe ---------- */
  function normTxt(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function phoneDigits(s) { return String(s || '').replace(/\D/g, ''); }
  function normWeb(s) { return normTxt(String(s || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '')); }
  // a lead can match a duplicate on ANY of these keys
  function leadKeys(d) {
    var keys = [];
    var id = d.id || d.place_id || '';
    if (id && !/^lead-/.test(id) && !/^imp:/.test(id) && id.length > 6) keys.push('id:' + id);
    var n = normTxt(d.name);
    if (n) {
      var p = phoneDigits(d.phone), a = normTxt(d.address), w = normWeb(d.website);
      if (p.length >= 7) keys.push('np:' + n + '|' + p.slice(-10));
      if (a) keys.push('na:' + n + '|' + a);
      if (w) keys.push('nw:' + n + '|' + w);
      if (p.length < 7 && !a && !w) keys.push('n:' + n); // sparse rows: name-only fallback
    }
    return keys;
  }
  function hashStr(s) { var h = 5381, i = s.length; while (i) h = (h * 33) ^ s.charCodeAt(--i); return (h >>> 0).toString(36); }

  /* rebuild merged dataset (seed first, then imports); dedupe on any matching key. returns dupe count */
  function rebuildDataset() {
    var seen = {}, out = [], dupes = 0, i, j;
    var all = SEED.concat(IMPORTED);
    for (i = 0; i < all.length; i++) {
      var d = all[i];
      if (OVERRIDES[d.id]) Object.assign(d, OVERRIDES[d.id]);
      enrich(d);
      var keys = leadKeys(d), dup = false;
      for (j = 0; j < keys.length; j++) { if (seen[keys[j]]) { dup = true; break; } }
      if (dup) { dupes++; continue; }
      for (j = 0; j < keys.length; j++) seen[keys[j]] = true;
      d._i = out.length;
      out.push(d);
    }
    LEADS = out;
    return dupes;
  }

  var CAT_COLORS = {
    'Security': 'var(--c-security)',
    'Investigation': 'var(--c-investigation)',
    'Firearms & Training': 'var(--c-firearms)',
    'Legal & Process': 'var(--c-legal)',
    'Other': 'var(--c-other)'
  };
  var CAT_HEX = {
    'Security': '#2563eb', 'Investigation': '#8b5cf6', 'Firearms & Training': '#f97316',
    'Legal & Process': '#06b6d4', 'Other': '#64748b'
  };
  var STATUSES = [
    { id: 'new', label: 'New', color: '#94a3b8' },
    { id: 'contacted', label: 'Contacted', color: '#3b82f6' },
    { id: 'interested', label: 'Interested', color: '#10b981' },
    { id: 'negotiating', label: 'Negotiating', color: '#f59e0b' },
    { id: 'closed', label: 'Closed / Won', color: '#a78bfa' },
    { id: 'rejected', label: 'Rejected', color: '#ef4444' }
  ];
  var STATUS_MAP = {}; STATUSES.forEach(function (s) { STATUS_MAP[s.id] = s; });

  /* ---------- persistence: database API when available, else localStorage ---------- */
  var API = null;            // '/api' when the server is running
  var AI = { enabled: false, model: '' };  // Claude pitch writer (server-side key)
  var META_KEY = 'leadsManager.meta.v1';
  var NOTES_KEY = 'leadsManager.notes.v1';
  var OVR_KEY = 'leadsManager.overrides.v1';
  var META = {};             // id -> {star,status,wa,wa_checkedAt,tags:[]}
  var NOTES = {};            // id -> [{id,body,at}]
  var OVERRIDES = {};        // id -> {phone,website,...}  (local-mode field edits)
  var noteSeq = 0;

  function metaOf(id) { return META[id] || {}; }
  function notesOf(id) { return NOTES[id] || []; }

  function loadLocalStores() {
    try { META = JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { META = {}; }
    try { NOTES = JSON.parse(localStorage.getItem(NOTES_KEY)) || {}; } catch (e) { NOTES = {}; }
    try { OVERRIDES = JSON.parse(localStorage.getItem(OVR_KEY)) || {}; } catch (e) { OVERRIDES = {}; }
    var changed = false;
    Object.keys(META).forEach(function (id) {              // migrate old single note -> timeline
      var m = META[id];
      if (m && m.note && String(m.note).trim()) {
        NOTES[id] = NOTES[id] || [];
        NOTES[id].push({ id: 'ln' + (noteSeq++), body: m.note, at: Date.now() });
        delete m.note; changed = true;
      }
    });
    if (changed) { saveLocalMeta(); saveLocalNotes(); }
  }
  function saveLocalMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) {} }
  function saveLocalNotes() { try { localStorage.setItem(NOTES_KEY, JSON.stringify(NOTES)); } catch (e) {} }
  function saveLocalOverrides() { try { localStorage.setItem(OVR_KEY, JSON.stringify(OVERRIDES)); } catch (e) {} }

  function setMeta(id, patch) {
    META[id] = Object.assign({}, META[id], patch);
    var m = META[id];
    if (m.tags && !m.tags.length) delete m.tags;
    if (!m.star && !m.status && !m.wa && !m.pitched && (!m.tags || !m.tags.length)) delete META[id];
    if (API) apiPatch(id, patch); else saveLocalMeta();
  }
  function apiPatch(id, patch) {
    var out = {};
    if ('star' in patch) out.starred = !!patch.star;
    ['status', 'wa', 'wa_checkedAt', 'pitched', 'pitched_at', 'tags', 'phone', 'website', 'name', 'address', 'owner', 'main_category', 'hours'].forEach(function (k) { if (k in patch) out[k] = patch[k]; });
    return fetch(API + '/leads/' + encodeURIComponent(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out) }).catch(function () {});
  }
  function addNoteFor(id, body) {
    body = String(body || '').trim(); if (!body) return;
    NOTES[id] = NOTES[id] || [];
    var note = { id: 'tmp' + (noteSeq++), body: body, at: Date.now() };
    NOTES[id].push(note);
    if (API) {
      fetch(API + '/leads/' + encodeURIComponent(id) + '/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: body }) })
        .then(function (r) { return r.json(); }).then(function (n) { if (n && n.id) note.id = n.id; }).catch(function () {});
    } else saveLocalNotes();
  }
  function deleteNoteFor(id, noteId) {
    NOTES[id] = (NOTES[id] || []).filter(function (n) { return n.id !== noteId; });
    if (API) fetch(API + '/notes/' + encodeURIComponent(noteId), { method: 'DELETE' }).catch(function () {});
    else saveLocalNotes();
  }
  function updateLeadField(id, field, value) {
    var lead = LEADS.filter(function (l) { return l.id === id; })[0];
    if (lead) { lead[field] = value; lead._search = searchStr(lead); }
    if (API) { var o = {}; o[field] = value; apiPatch(id, o); }
    else { OVERRIDES[id] = Object.assign({}, OVERRIDES[id]); OVERRIDES[id][field] = value; saveLocalOverrides(); }
  }

  /* ---------- state ---------- */
  var state = {
    view: 'dashboard',
    search: '',
    f: { state: '', group: '', city: '', service: '', status: '', rating: '', wa: '', tag: '', website: false, phone: false, marked: false },
    sort: 'name',
    mode: 'grid',
    waView: 'all',
    waSearch: '',
    pitchWaOnly: true,
    pitchView: 'todo',
    pitchSearch: ''
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function initials(n) { return (n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function avatarColor(n) { var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360; return 'hsl(' + h + ',45%,42%)'; }
  function copyText(t) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t); } catch (e) {}
    var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- WhatsApp helpers ---------- */
  var WA_ICON = 'M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.44.79 3.07 1.2 4.74 1.2 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.31-1.95 1.36-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.83-4.2-4.97-4.4-.15-.2-1.19-1.58-1.19-3.01 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.82 2.04.89 2.19.07.15.12.32.02.52-.09.2-.14.32-.28.49l-.42.51c-.14.14-.28.29-.12.57.16.28.72 1.18 1.55 1.91 1.06.95 1.96 1.25 2.24 1.39.28.14.44.12.6-.07.16-.19.69-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.61.76 1.89.9.28.14.46.21.53.32.07.12.07.66-.17 1.34z';
  function waSvg(cls) { return '<svg ' + (cls ? 'class="' + cls + '" ' : '') + 'viewBox="0 0 24 24" fill="currentColor"><path d="' + WA_ICON + '"/></svg>'; }
  function waDigits(p) { var d = phoneDigits(p); if (d.length === 10) d = '1' + d; return d; }
  function waLink(p) { return 'https://wa.me/' + waDigits(p); }
  function waBadge(m) {
    if (m.wa === 'yes') return '<span class="badge wa-yes">' + waSvg() + 'WhatsApp</span>';
    if (m.wa === 'no') return '<span class="badge wa-no">No WhatsApp</span>';
    return '';
  }

  /* ---------- aggregates ---------- */
  function countBy(arr, key) {
    var m = {}; arr.forEach(function (d) { var k = typeof key === 'function' ? key(d) : d[key]; if (k === '' || k == null) k = '—'; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return { k: k, v: m[k] }; }).sort(function (a, b) { return b.v - a.v; });
  }

  /* ===================== FILTERING ===================== */
  function applyFilters() {
    var f = state.f, q = state.search.trim().toLowerCase();
    return LEADS.filter(function (d) {
      var m = metaOf(d.id);
      if (q && d._search.indexOf(q) === -1) return false;
      if (f.state && d.state_name !== f.state) return false;
      if (f.group && d.group !== f.group) return false;
      if (f.city && d.city !== f.city) return false;
      if (f.service && d.service !== f.service) return false;
      if (f.rating && (d.rating == null || d.rating < parseFloat(f.rating))) return false;
      if (f.website && !d.website) return false;
      if (f.phone && !d.phone) return false;
      if (f.marked && !m.star) return false;
      if (f.tag && (m.tags || []).indexOf(f.tag) === -1) return false;
      if (f.wa) {
        if (f.wa === 'yes' && m.wa !== 'yes') return false;
        if (f.wa === 'no' && m.wa !== 'no') return false;
        if (f.wa === 'unchecked' && m.wa) return false;
      }
      if (f.status) {
        if (f.status === 'none') { if (m.status) return false; }
        else if (m.status !== f.status) return false;
      }
      return true;
    });
  }
  function sortLeads(arr) {
    var s = state.sort, a = arr.slice();
    a.sort(function (x, y) {
      if (s === 'rating') return (y.rating || 0) - (x.rating || 0);
      if (s === 'reviews') return (y.reviews || 0) - (x.reviews || 0);
      if (s === 'state') return (x.state_name || '').localeCompare(y.state_name || '') || x.name.localeCompare(y.name);
      if (s === 'city') return (x.city || '').localeCompare(y.city || '') || x.name.localeCompare(y.name);
      return x.name.localeCompare(y.name);
    });
    return a;
  }

  /* ===================== CARD / TABLE RENDER ===================== */
  function starsHtml(r) {
    if (r == null) return '<span class="meta-row"><span class="mi" style="color:var(--fg-3)">No rating</span></span>';
    return '<span class="stars"><svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>' + r.toFixed(1) + '</span>';
  }
  function statusTag(st) {
    if (!st) return '';
    var s = STATUS_MAP[st]; if (!s) return '';
    return '<span class="status-tag st-' + st + '">' + s.label + '</span>';
  }

  function cardHtml(d) {
    var m = metaOf(d.id);
    var hasNote = notesOf(d.id).length;
    var tags = m.tags || [];
    return '<article class="lead-card' + (m.star ? ' marked' : '') + '" data-id="' + esc(d.id) + '">' +
      '<button class="lc-star' + (m.star ? ' on' : '') + '" data-act="star" title="Mark lead">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg></button>' +
      '<div class="lc-top">' +
        '<div class="lc-avatar" style="background:' + avatarColor(d.name) + '">' + esc(initials(d.name)) + '</div>' +
        '<div style="min-width:0;flex:1">' +
          '<div class="lc-name" data-act="open">' + esc(d.name) + '</div>' +
          '<div class="lc-cat">' + esc(d.main_category || d.group) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="badges">' +
        '<span class="badge badge-cat"><span class="dot" style="background:' + CAT_COLORS[d.group] + '"></span>' + esc(d.group) + '</span>' +
        (d.city ? '<span class="badge badge-state">' + esc(d.city) + ', ' + esc(d.state) + '</span>' : (d.state ? '<span class="badge badge-state">' + esc(d.state_name) + '</span>' : '')) +
        (m.status ? statusTag(m.status) : '') +
        waBadge(m) +
        tags.slice(0, 3).map(function (t) { return '<span class="badge tag-badge">#' + esc(t) + '</span>'; }).join('') +
      '</div>' +
      '<div class="meta-row">' +
        starsHtml(d.rating) +
        '<span class="mi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' + (d.reviews || 0) + ' reviews</span>' +
        (d.phone ? '<span class="mi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Phone</span>' : '') +
      '</div>' +
      '<div class="lc-foot">' +
        '<select class="status-select" data-act="status">' + statusOptions(m.status) + '</select>' +
        (d.phone ? '<a class="mini-btn wa' + (m.wa === 'yes' ? ' wa-on' : m.wa === 'no' ? ' wa-off' : '') + '" href="' + waLink(d.phone) + '" target="_blank" rel="noopener" data-stop="1" title="Open in WhatsApp">' + waSvg() + '</a>' : '') +
        (d.website ? '<a class="mini-btn" href="' + esc(d.website) + '" target="_blank" rel="noopener" title="Website" data-stop="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></a>' : '') +
        '<button class="mini-btn' + (hasNote ? ' has-note' : '') + '" data-act="note" title="Notes">' + (hasNote ? '<span class="nd"></span>' : '') + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>' +
      '</div>' +
    '</article>';
  }
  function statusOptions(cur) {
    var h = '<option value="">— set status —</option>';
    STATUSES.forEach(function (s) { h += '<option value="' + s.id + '"' + (cur === s.id ? ' selected' : '') + '>' + s.label + '</option>'; });
    return h;
  }

  function gridHtml(list) {
    if (!list.length) return emptyHtml();
    return '<div class="leads-grid">' + list.map(cardHtml).join('') + '</div>';
  }

  var TABLE_COLS = [
    { k: 'name', label: 'Name' }, { k: 'group', label: 'Category' }, { k: 'city', label: 'City' },
    { k: 'state', label: 'State' }, { k: 'rating', label: 'Rating' }, { k: 'reviews', label: 'Reviews' },
    { k: 'status', label: 'Status' }, { k: 'contact', label: 'Contact' }
  ];
  function tableHtml(list) {
    if (!list.length) return emptyHtml();
    var head = TABLE_COLS.map(function (c) {
      var sorted = state.sort === c.k ? ' sorted' : '';
      return '<th class="' + sorted + '" data-sort="' + c.k + '">' + c.label + ' <span class="ar">↕</span></th>';
    }).join('') + '<th></th>';
    var rows = list.map(function (d) {
      var m = metaOf(d.id);
      return '<tr data-id="' + esc(d.id) + '">' +
        '<td><span class="tname" data-act="open">' + (m.star ? '★ ' : '') + esc(d.name) + '</span></td>' +
        '<td><span class="badge badge-cat"><span class="dot" style="background:' + CAT_COLORS[d.group] + '"></span>' + esc(d.group) + '</span></td>' +
        '<td>' + esc(d.city || '—') + '</td>' +
        '<td class="tnum">' + esc(d.state || '—') + '</td>' +
        '<td class="tnum">' + (d.rating != null ? '★ ' + d.rating.toFixed(1) : '—') + '</td>' +
        '<td class="tnum">' + (d.reviews || 0) + '</td>' +
        '<td>' + (m.status ? statusTag(m.status) : '<span style="color:var(--fg-3)">—</span>') + '</td>' +
        '<td>' + (d.phone ? '<span class="wa-cell' + (m.wa === 'yes' ? ' wa-on' : m.wa === 'no' ? ' wa-off' : '') + '" title="' + (m.wa === 'yes' ? 'Has WhatsApp' : m.wa === 'no' ? 'No WhatsApp' : 'WhatsApp not checked') + '">' + waSvg() + '</span>' + esc(d.phone) : '<span style="color:var(--fg-3)">—</span>') + '</td>' +
        '<td><button class="mini-btn" data-act="open" title="Details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button></td>' +
      '</tr>';
    }).join('');
    return '<div class="table-wrap"><table class="leads-table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function emptyHtml() {
    return '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><h3>No leads match</h3><p>Try adjusting or resetting your filters.</p></div>';
  }

  /* ===================== RENDER LEADS VIEW ===================== */
  function renderLeads() {
    var list = sortLeads(applyFilters());
    var rb = $('#resultBar');
    rb.innerHTML = '<b>' + list.length + '</b> of ' + LEADS.length + ' leads' +
      (activeFilterText() ? ' · <span style="color:var(--fg-2)">' + activeFilterText() + '</span>' : '');
    $('#leadsContainer').innerHTML = state.mode === 'table' ? tableHtml(list) : gridHtml(list);
    if (state.mode === 'grid') animateNothing();
  }
  function activeFilterText() {
    var f = state.f, parts = [];
    if (f.state) parts.push(f.state);
    if (f.group) parts.push(f.group);
    if (f.city) parts.push(f.city);
    if (f.service) parts.push(f.service);
    if (f.rating) parts.push(f.rating + '★+');
    if (f.tag) parts.push('#' + f.tag);
    if (f.wa) parts.push(f.wa === 'yes' ? 'has WhatsApp' : f.wa === 'no' ? 'no WhatsApp' : 'WA unchecked');
    if (f.status) parts.push(f.status === 'none' ? 'untouched' : f.status);
    if (f.website) parts.push('has website');
    if (f.phone) parts.push('has phone');
    if (f.marked) parts.push('marked');
    if (state.search) parts.push('"' + state.search + '"');
    return parts.join(' · ');
  }
  function animateNothing() {}

  /* ===================== SAVED VIEW ===================== */
  function renderSaved() {
    var list = sortLeads(LEADS.filter(function (d) { return metaOf(d.id).star; }));
    $('#savedBar').innerHTML = '<b>' + list.length + '</b> marked lead' + (list.length === 1 ? '' : 's');
    $('#savedContainer').innerHTML = list.length ? gridHtml(list) :
      '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg><h3>No marked leads yet</h3><p>Tap the star on any lead to save it here.</p></div>';
  }

  /* ===================== PIPELINE / STATUS BOARD ===================== */
  function renderPipeline() {
    var tracked = LEADS.filter(function (d) { return metaOf(d.id).status; });
    $('#pipeBar').innerHTML = '<b>' + tracked.length + '</b> lead' + (tracked.length === 1 ? '' : 's') + ' in pipeline';
    if (!tracked.length) {
      $('#pipeContainer').innerHTML = '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><h3>Pipeline is empty</h3><p>Set a status on leads to track them here.</p></div>';
      return;
    }
    var html = '';
    STATUSES.forEach(function (s) {
      var items = sortLeads(tracked.filter(function (d) { return metaOf(d.id).status === s.id; }));
      if (!items.length) return;
      html += '<div class="panel" style="margin-bottom:16px">' +
        '<div class="panel-head"><div class="panel-title"><span class="status-tag st-' + s.id + '">' + s.label + '</span></div><div class="panel-note">' + items.length + '</div></div>' +
        '<div class="leads-grid">' + items.map(cardHtml).join('') + '</div></div>';
    });
    $('#pipeContainer').innerHTML = html;
  }

  /* ===================== PITCH ENGINE ===================== */
  var PITCH_KEY = 'leadsManager.pitch.v1';
  var DEFAULT_PITCH = {
    yourName: '', company: '',
    offer: 'I help businesses like yours get more clients online — a stronger web presence, better reviews, and more calls.',
    cta: 'Would you be open to a quick chat this week?',
    template: '{greeting}, this is {me}{fromCompany}.\n\n{hook}\n\n{offer}\n\n{cta}'
  };
  var PITCH = loadPitch();
  function loadPitch() { try { return Object.assign({}, DEFAULT_PITCH, JSON.parse(localStorage.getItem(PITCH_KEY)) || {}); } catch (e) { return Object.assign({}, DEFAULT_PITCH); } }
  function savePitch() { try { localStorage.setItem(PITCH_KEY, JSON.stringify(PITCH)); } catch (e) {} }

  function catPhrase(d) {
    return ({ 'Security': 'security company', 'Investigation': 'private investigation firm', 'Firearms & Training': 'firearms training business', 'Legal & Process': 'practice', 'Other': 'business' })[d.group] || 'business';
  }
  function ownerFirst(d) {
    var o = (d.owner || '').replace(/\(owner\)/i, '').trim();
    if (!o) return '';
    var words = o.split(/\s+/);
    if (words.length > 3) return '';                 // long → business name, not a person
    var first = words[0];
    if (!/^[A-Z][a-z]{1,}$/.test(first)) return '';  // must look like a real first name
    var bizFirst = ((d.name || '').split(/\s+/)[0] || '').toLowerCase();
    if (first.toLowerCase() === bizFirst) return ''; // matches the business name → not a person
    var generic = { the: 1, best: 1, elite: 1, pro: 1, first: 1, all: 1, national: 1, american: 1, security: 1, global: 1 };
    if (generic[first.toLowerCase()]) return '';
    return first;
  }
  function pitchHook(d) {
    var name = d.name, city = d.city || d.state_name || 'your area', cat = catPhrase(d);
    var rating = d.rating != null ? d.rating.toFixed(1) : null, reviews = d.reviews || 0;
    if (!d.website) return 'I came across ' + name + ' in ' + city + ' and noticed you don’t have a website yet — a lot of people searching for a ' + cat + ' in ' + city + ' may not be finding you.';
    if (reviews < 10) return 'I came across ' + name + ' in ' + city + ' — you’ve got ' + (rating ? 'a ' + rating + '★ rating' : 'good reviews') + ' but only ' + reviews + ' review' + (reviews === 1 ? '' : 's') + '. A few more would really help you stand out from other ' + cat + 's nearby.';
    if (rating && parseFloat(rating) < 4) return 'I came across ' + name + ' in ' + city + ' and noticed your rating is around ' + rating + '★. I help ' + cat + 's turn their online reputation around and win back trust.';
    return 'I came across ' + name + ' in ' + city + ' — ' + (rating ? rating + '★ with ' + reviews + ' reviews, ' : '') + 'you’re clearly doing great. I help ' + cat + 's get in front of even more local clients.';
  }
  function buildPitch(d) {
    var greetName = ownerFirst(d) || 'there';
    var msg = (PITCH.template || DEFAULT_PITCH.template)
      .replace(/{greeting}/g, 'Hi ' + greetName)
      .replace(/{me}/g, PITCH.yourName || 'me')
      .replace(/{fromCompany}/g, PITCH.company ? ' from ' + PITCH.company : '')
      .replace(/{company}/g, PITCH.company || '')
      .replace(/{hook}/g, pitchHook(d))
      .replace(/{name}/g, d.name)
      .replace(/{city}/g, d.city || d.state_name || 'your area')
      .replace(/{category}/g, catPhrase(d))
      .replace(/{rating}/g, d.rating != null ? d.rating.toFixed(1) : '')
      .replace(/{reviews}/g, d.reviews || 0)
      .replace(/{offer}/g, PITCH.offer || '')
      .replace(/{cta}/g, PITCH.cta || '');
    return msg.replace(/\n{3,}/g, '\n\n').trim();
  }
  function waPitchLink(d, msg) { return waLink(d.phone) + '?text=' + encodeURIComponent(msg == null ? buildPitch(d) : msg); }
  function sparkleSvg() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.7 1.9L21.5 17.5l-1.8.6L19 20l-.7-1.9L16.5 17.5l1.8-.6z"/></svg>'; }
  function aiWritePitch(id, ta, sendLink, btn) {
    var d = LEADS.filter(function (l) { return l.id === id; })[0]; if (!d) return;
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = sparkleSvg() + 'Writing…'; }
    fetch(API + '/ai/pitch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, settings: PITCH }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.pitch) {
          ta.value = j.pitch;
          if (sendLink) sendLink.href = waLink(d.phone) + '?text=' + encodeURIComponent(j.pitch);
          toast('AI wrote a pitch ✨');
        } else {
          toast(j && j.error === 'no_api_key' ? 'Add your Anthropic API key to config.json first' : 'AI error: ' + ((j && j.error) || 'failed'));
        }
      })
      .catch(function () { toast('AI request failed'); })
      .then(function () { if (btn) { btn.disabled = false; btn.innerHTML = orig; } });
  }
  function markPitched(id, val) {
    setMeta(id, val ? { pitched: true, pitched_at: Date.now() } : { pitched: undefined, pitched_at: undefined });
    updateCounts();
  }

  /* ===================== WHATSAPP VIEW ===================== */
  function waStatusOf(id) { var w = metaOf(id).wa; return w === 'yes' ? 'yes' : w === 'no' ? 'no' : 'unchecked'; }
  function whatsappList() {
    var withPhone = LEADS.filter(function (d) { return d.phone; });
    var q = state.waSearch.trim().toLowerCase();
    return sortLeads(withPhone.filter(function (d) {
      if (state.waView !== 'all' && waStatusOf(d.id) !== state.waView) return false;
      if (q && d._search.indexOf(q) === -1) return false;
      return true;
    }));
  }
  function pitchList() {
    var q = (state.pitchSearch || '').trim().toLowerCase();
    return sortLeads(LEADS.filter(function (d) {
      if (!d.phone) return false;
      if (state.pitchWaOnly && metaOf(d.id).wa !== 'yes') return false;
      if (state.pitchView === 'pitched' && !metaOf(d.id).pitched) return false;
      if (state.pitchView === 'todo' && metaOf(d.id).pitched) return false;
      if (q && d._search.indexOf(q) === -1) return false;
      return true;
    }));
  }
  function renderWhatsapp() {
    var withPhone = LEADS.filter(function (d) { return d.phone; });
    var yes = 0, no = 0;
    withPhone.forEach(function (d) { var w = waStatusOf(d.id); if (w === 'yes') yes++; else if (w === 'no') no++; });
    var checked = yes + no, unchecked = withPhone.length - checked;
    var pct = withPhone.length ? Math.round(checked / withPhone.length * 100) : 0;

    $('#waRing').style.setProperty('--pct', pct + '%');
    $('#waRing').innerHTML = '<span>' + pct + '%</span>';
    $('#waHeroSub').textContent = checked + ' of ' + withPhone.length + ' numbers checked' + (unchecked ? ' · ' + unchecked + ' to go' : ' · all done');
    $('#waBarFill').style.width = pct + '%';
    $('#waStats').innerHTML =
      istat(withPhone.length, 'Numbers to check') +
      '<div class="istat" style="border-color:rgba(37,211,102,.4)"><div class="iv tnum" style="color:var(--wa)">' + yes + '</div><div class="il">✅ On WhatsApp</div></div>' +
      '<div class="istat"><div class="iv tnum" style="color:var(--danger)">' + no + '</div><div class="il">❌ Not available</div></div>' +
      istat(unchecked, 'Not checked yet') +
      istat(pct + '%', 'Progress');

    // segmented counts
    var segCounts = { all: withPhone.length, yes: yes, no: no, unchecked: unchecked };
    $$('#waSeg button').forEach(function (b) {
      var k = b.getAttribute('data-waview');
      b.classList.toggle('active', k === state.waView);
    });

    var list = whatsappList();
    $('#waResultBar').innerHTML = '<b>' + list.length + '</b> shown';

    if (!list.length) {
      $('#waListContainer').innerHTML = '<div class="empty"><svg viewBox="0 0 24 24" fill="currentColor"><path d="' + WA_ICON + '"/></svg><h3>Nothing here</h3><p>No leads match this filter.</p></div>';
      return;
    }
    var rows = list.map(function (d) {
      var w = waStatusOf(d.id);
      var badge = w === 'yes' ? '<span class="wa-badge-cell yes">' + waSvg() + 'Available</span>'
        : w === 'no' ? '<span class="wa-badge-cell no">Not available</span>'
          : '<span class="wa-badge-cell none">— not checked</span>';
      return '<tr data-id="' + esc(d.id) + '">' +
        '<td><span class="tname" data-act="open">' + esc(d.name) + '</span><div style="font-size:11.5px;color:var(--fg-3)">' + esc(d.group) + (d.city ? ' · ' + esc(d.city) + ', ' + esc(d.state) : '') + '</div></td>' +
        '<td class="tnum">' + esc(d.phone) + '</td>' +
        '<td>' + badge + '</td>' +
        '<td><div class="wa-actions">' +
          (w === 'yes' ? '<a class="mini-btn wa wa-on" href="' + waPitchLink(d) + '" target="_blank" rel="noopener" data-stop="1" data-pitchsent="' + esc(d.id) + '" title="Pitch on WhatsApp (message pre-filled)">' + waSvg() + '</a>'
            : '<a class="mini-btn wa" href="' + waLink(d.phone) + '" target="_blank" rel="noopener" data-stop="1" title="Open chat">' + waSvg() + '</a>') +
          '<button class="wa-mark yes' + (w === 'yes' ? ' on' : '') + '" data-waset="yes" title="Mark available">✓</button>' +
          '<button class="wa-mark no' + (w === 'no' ? ' on' : '') + '" data-waset="no" title="Mark not available">✕</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
    $('#waListContainer').innerHTML = '<div class="table-wrap"><table class="leads-table wa-table"><thead><tr>' +
      '<th>Name</th><th>Phone</th><th>WhatsApp</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ===================== PITCH VIEW ===================== */
  function renderPitch() {
    var configured = PITCH.yourName || PITCH.company;
    $('#pitchCfgName').value = PITCH.yourName || '';
    $('#pitchCfgCompany').value = PITCH.company || '';
    $('#pitchCfgOffer').value = PITCH.offer || '';
    $('#pitchCfgCta').value = PITCH.cta || '';
    $('#pitchSetupHint').style.display = configured ? 'none' : '';

    var waOnlyN = LEADS.filter(function (d) { return d.phone && metaOf(d.id).wa === 'yes'; }).length;
    var pitchedN = Object.keys(META).filter(function (k) { return META[k].pitched; }).length;
    $('#pitchStats').innerHTML =
      istat(waOnlyN, 'On WhatsApp', true) +
      istat(pitchedN, 'Pitched') +
      istat(Math.max(0, waOnlyN - pitchedN), 'Still to pitch') +
      istat(LEADS.filter(function (d) { return d.phone; }).length, 'With a phone');

    $$('#pitchSeg button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-pv') === state.pitchView); });
    $('#pitchWaOnly').classList.toggle('on', state.pitchWaOnly);

    var list = pitchList();
    $('#pitchResultBar').innerHTML = '<b>' + list.length + '</b> lead' + (list.length === 1 ? '' : 's') + (state.pitchWaOnly ? ' on WhatsApp' : ' with a phone');
    if (!list.length) {
      $('#pitchList').innerHTML = '<div class="empty"><svg viewBox="0 0 24 24" fill="currentColor"><path d="' + WA_ICON + '"/></svg><h3>No leads here</h3><p>' + (state.pitchWaOnly ? 'Run the WhatsApp checker first, or turn off “WhatsApp only”.' : 'Adjust the filter above.') + '</p></div>';
      return;
    }
    list = list.slice(0, 150);
    $('#pitchList').innerHTML = list.map(function (d) {
      var m = metaOf(d.id);
      var msg = buildPitch(d);
      return '<div class="pitch-card' + (m.pitched ? ' pitched' : '') + '" data-id="' + esc(d.id) + '">' +
        '<div class="pitch-head">' +
          '<div class="lc-avatar" style="background:' + avatarColor(d.name) + ';width:38px;height:38px;font-size:14px">' + esc(initials(d.name)) + '</div>' +
          '<div style="flex:1;min-width:0"><div class="pitch-name" data-act="open">' + esc(d.name) + (m.pitched ? ' <span class="pitched-tag">✓ pitched</span>' : '') + '</div>' +
          '<div class="pitch-sub">' + esc(catPhrase(d)) + ' · ' + esc(d.city || d.state_name) + (d.rating != null ? ' · ★' + d.rating.toFixed(1) + ' (' + d.reviews + ')' : '') + (d.website ? '' : ' · <span style="color:var(--warn)">no website</span>') + '</div></div>' +
          waBadge(m) +
        '</div>' +
        '<textarea class="pitch-msg" data-pitchmsg>' + esc(msg) + '</textarea>' +
        '<div class="pitch-actions">' +
          '<a class="btn btn-wa" data-sendpitch href="' + waPitchLink(d, msg) + '" target="_blank" rel="noopener">' + waSvg() + 'Send on WhatsApp</a>' +
          (AI.enabled ? '<button class="btn btn-ai" data-aiwrite>' + sparkleSvg() + 'Write with AI</button>' : '') +
          '<button class="btn" data-copypitch><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</button>' +
          '<button class="btn' + (m.pitched ? ' btn-primary' : '') + '" data-togglepitched>' + (m.pitched ? 'Pitched ✓' : 'Mark pitched') + '</button>' +
          '<div class="spacer"></div>' +
          '<button class="btn btn-ghost" data-regen title="Reset to generated message">↻</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ===================== DASHBOARD ===================== */
  function kpi(icon, val, label, glow, trend) {
    return '<div class="kpi" style="--glow:' + glow + '">' +
      '<div class="kpi-top"><div class="kpi-ico" style="background:' + glow + ';color:#fff">' + icon + '</div></div>' +
      '<div class="kpi-val tnum">' + val + '</div><div class="kpi-label">' + label + '</div>' +
      (trend ? '<div class="kpi-trend">' + trend + '</div>' : '') + '</div>';
  }
  function renderDashboard() {
    var withWeb = LEADS.filter(function (d) { return d.website; }).length;
    var withPhone = LEADS.filter(function (d) { return d.phone; }).length;
    var rated = LEADS.filter(function (d) { return d.rating != null; });
    var avg = rated.reduce(function (a, d) { return a + d.rating; }, 0) / (rated.length || 1);
    var states = countBy(LEADS, 'state_name').filter(function (x) { return x.k !== 'Unknown' && x.k !== '—'; }).length;
    var marked = Object.keys(META).filter(function (k) { return META[k].star; }).length;
    var waYes = Object.keys(META).filter(function (k) { return META[k].wa === 'yes'; }).length;

    var ic = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
    $('#kpiGrid').innerHTML =
      kpi(ic('<path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/><path d="M3 21v-2a6 6 0 0 1 12 0v2"/>'), LEADS.length, 'Total Leads', 'rgba(37,99,235,.9)') +
      kpi(ic('<path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'), states, 'States Covered', 'rgba(16,185,129,.9)') +
      kpi(ic('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'), avg.toFixed(2), 'Avg Rating', 'rgba(245,158,11,.9)', rated.length + ' rated') +
      kpi(ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'), Math.round(withWeb / LEADS.length * 100) + '%', 'Have a Website', 'rgba(139,92,246,.9)', withWeb + ' leads') +
      kpi(ic('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>'), withPhone, 'Have a Phone', 'rgba(6,182,212,.9)') +
      kpi(ic('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'), marked, 'Marked', 'rgba(251,191,36,.9)') +
      kpi(waSvg(), waYes, 'On WhatsApp', 'rgba(37,211,102,.9)', (waYes ? 'verified' : 'run wa-checker'));

    // state bars
    var stData = countBy(LEADS, 'state_name');
    barChart($('#stateBars'), stData, 'var(--primary)', function (k) { state.f.state = k === '—' ? '' : k; gotoView('leads'); syncControls(); });
    // city bars
    var cityData = countBy(LEADS.filter(function (d) { return d.city; }), 'city').slice(0, 10);
    barChart($('#cityBars'), cityData, 'var(--accent)', function (k) { state.f.city = k; gotoView('leads'); syncControls(); });
    // rating bars
    var buckets = [['4.5–5.0', function (r) { return r >= 4.5; }], ['4.0–4.4', function (r) { return r >= 4 && r < 4.5; }], ['3.0–3.9', function (r) { return r >= 3 && r < 4; }], ['< 3.0', function (r) { return r < 3; }]];
    var rData = buckets.map(function (b) { return { k: b[0], v: LEADS.filter(function (d) { return d.rating != null && b[1](d.rating); }).length }; });
    barChart($('#ratingBars'), rData, 'var(--star)', null);
    // service bars
    var svData = countBy(LEADS.filter(function (d) { return d.service; }), 'service').slice(0, 10);
    barChart($('#serviceBars'), svData, 'var(--c-investigation)', function (k) { state.f.service = k; gotoView('leads'); syncControls(); });

    // donut
    renderDonut(countBy(LEADS, 'group'));

    // top rated
    var top = LEADS.filter(function (d) { return d.rating != null && d.reviews >= 50; })
      .sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; }).slice(0, 6);
    $('#topRated').innerHTML = top.map(function (d) {
      return '<div class="kv" style="cursor:pointer" data-open="' + esc(d.id) + '">' +
        '<div class="v" style="flex:1;font-weight:600">' + esc(d.name) + '<div style="font-size:11.5px;color:var(--fg-3);font-weight:400">' + esc(d.group) + ' · ' + esc(d.city || d.state_name) + '</div></div>' +
        '<div class="v" style="flex:0;white-space:nowrap;color:var(--star);font-weight:600">★ ' + d.rating.toFixed(1) + ' <span style="color:var(--fg-3);font-weight:400">(' + d.reviews + ')</span></div></div>';
    }).join('');
    $$('#topRated [data-open]').forEach(function (el) { el.onclick = function () { openDrawer(el.getAttribute('data-open')); }; });

    fillActivity();
  }
  var ACT_LABEL = { status: 'status changed', wa: 'WhatsApp updated', star: 'mark', note: 'note added' };
  function fillActivity() {
    var panel = $('#activityPanel');
    if (!API) { panel.style.display = 'none'; return; }
    panel.style.display = '';
    fetch(API + '/activity').then(function (r) { return r.json(); }).then(function (j) {
      var acts = (j.activity || []).slice(0, 12);
      if (!acts.length) { $('#activityFeed').innerHTML = '<div class="notes-empty">No activity yet — mark leads, set statuses, and add notes to see them here.</div>'; return; }
      $('#activityFeed').innerHTML = acts.map(function (a) {
        return '<div class="kv" style="cursor:pointer" data-open="' + esc(a.lead_id) + '">' +
          '<div class="v" style="flex:1"><b style="font-weight:600">' + esc(a.name || 'Lead') + '</b> <span style="color:var(--fg-3)">— ' + (ACT_LABEL[a.kind] || a.kind) + (a.detail ? ': ' + esc(a.detail) : '') + '</span></div>' +
          '<div class="v" style="flex:0;white-space:nowrap;color:var(--fg-3);font-family:var(--mono);font-size:11.5px">' + fmtTime(a.at) + '</div></div>';
      }).join('');
      $$('#activityFeed [data-open]').forEach(function (el) { el.onclick = function () { openDrawer(el.getAttribute('data-open')); }; });
    }).catch(function () { panel.style.display = 'none'; });
  }

  function barChart(el, data, color, onClick) {
    var max = Math.max.apply(null, data.map(function (d) { return d.v; }).concat([1]));
    el.innerHTML = data.map(function (d) {
      return '<div class="bar-row"' + (onClick ? ' style="cursor:pointer"' : '') + ' data-k="' + esc(d.k) + '">' +
        '<div class="bl" title="' + esc(d.k) + '">' + esc(d.k) + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="background:linear-gradient(90deg,' + color + ',' + color + ');"></div></div>' +
        '<div class="bv tnum">' + d.v + '</div></div>';
    }).join('');
    // animate widths next frame
    var fills = $$('.bar-fill', el);
    requestAnimationFrame(function () {
      data.forEach(function (d, i) { if (fills[i]) fills[i].style.width = (d.v / max * 100) + '%'; });
    });
    if (onClick) $$('.bar-row', el).forEach(function (row) { row.onclick = function () { onClick(row.getAttribute('data-k')); }; });
  }

  function renderDonut(data) {
    var total = data.reduce(function (a, d) { return a + d.v; }, 0) || 1;
    var R = 64, C = 2 * Math.PI * R, off = 0;
    var seg = data.map(function (d) {
      var frac = d.v / total, len = frac * C;
      var s = '<circle r="' + R + '" cx="84" cy="84" fill="none" stroke="' + (CAT_HEX[d.k] || '#64748b') + '" stroke-width="20" ' +
        'stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '"></circle>';
      off += len; return s;
    }).join('');
    $('#catDonut').innerHTML = '<svg viewBox="0 0 168 168">' + seg + '</svg>' +
      '<div class="donut-center"><div class="dc-v">' + total + '</div><div class="dc-l">leads</div></div>';
    $('#catLegend').innerHTML = data.map(function (d) {
      return '<div class="legend-item" style="cursor:pointer" data-k="' + esc(d.k) + '"><span class="sw" style="background:' + (CAT_HEX[d.k] || '#64748b') + '"></span>' +
        '<span class="ln">' + esc(d.k) + '</span><span class="lv">' + d.v + ' · ' + Math.round(d.v / total * 100) + '%</span></div>';
    }).join('');
    $$('#catLegend .legend-item').forEach(function (el) {
      el.onclick = function () { state.f.group = el.getAttribute('data-k'); gotoView('leads'); syncControls(); };
    });
  }

  /* ===================== DETAIL DRAWER ===================== */
  function row(k, v) { return v ? '<div class="kv"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>' : ''; }
  function fmtTime(ts) { try { return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function tagsHtml(tags) {
    if (!tags || !tags.length) return '<span class="tag-empty">No tags yet</span>';
    return tags.map(function (t) { return '<span class="tag-chip">' + esc(t) + '<button class="tag-x" data-tagrm="' + esc(t) + '" title="Remove">×</button></span>'; }).join('');
  }
  function notesTimelineHtml(id) {
    var ns = notesOf(id).slice().sort(function (a, b) { return b.at - a.at; });
    if (!ns.length) return '<div class="notes-empty">No notes yet — add your first below.</div>';
    return ns.map(function (n) {
      return '<div class="note-item"><div class="note-body">' + esc(n.body) + '</div>' +
        '<div class="note-meta"><span>' + fmtTime(n.at) + '</span><button class="note-del" data-notedel="' + esc(n.id) + '">Delete</button></div></div>';
    }).join('');
  }
  function contactViewHtml(d) {
    return row('Phone', d.phone ? '<a href="tel:' + esc(d.phone) + '">' + esc(d.phone) + '</a>' : '') +
      row('Website', d.website ? '<a href="' + esc(d.website) + '" target="_blank" rel="noopener">' + esc(d.website.replace(/^https?:\/\//, '')) + '</a>' : '') +
      row('Address', esc(d.address)) +
      row('Owner', esc(d.owner)) +
      row('Hours', esc(d.hours)) +
      row('Lead source', esc(d.service ? d.service + ' (' + (d.query || '') + ')' : d.query)) +
      row('Google Maps', d.link ? '<a href="' + esc(d.link) + '" target="_blank" rel="noopener">Open in Maps</a>' : '');
  }
  function contactEditHtml(d) {
    var f = function (label, field, val) { return '<label class="edit-field"><span>' + label + '</span><input data-editfield="' + field + '" value="' + esc(val || '') + '"></label>'; };
    return f('Name', 'name', d.name) + f('Phone', 'phone', d.phone) + f('Website', 'website', d.website) + f('Address', 'address', d.address) + f('Owner', 'owner', d.owner) + f('Hours', 'hours', d.hours) +
      '<div class="drawer-actions" style="margin-top:10px"><button class="btn btn-primary" id="dSaveContact">Save changes</button><button class="btn" id="dCancelContact">Cancel</button></div>';
  }
  function openDrawer(id) {
    var d = LEADS.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    var m = metaOf(id);
    var compHtml = '';
    if (d.competitors) {
      var comps = d.competitors.split(/Name:\s*/).filter(Boolean).slice(0, 6).map(function (c) {
        var nm = c.split(/Link:|Reviews:/)[0].trim();
        var rv = (c.match(/Reviews:\s*([\d,]+)/) || [])[1];
        return nm ? '<div style="font-size:13px;padding:5px 0;border-bottom:1px solid var(--border)">' + esc(nm) + (rv ? ' <span style="color:var(--fg-3)">· ' + rv + ' reviews</span>' : '') + '</div>' : '';
      }).join('');
      if (comps) compHtml = '<div class="detail-section"><h4>Competitors</h4>' + comps + '</div>';
    }
    var dr = $('#drawer');
    dr.innerHTML =
      '<div class="drawer-head">' +
        '<div class="lc-avatar" style="background:' + avatarColor(d.name) + ';width:48px;height:48px;font-size:18px">' + esc(initials(d.name)) + '</div>' +
        '<div style="flex:1;min-width:0"><div class="dh-title">' + esc(d.name) + '</div>' +
          '<div class="dh-sub">' + esc(d.main_category || d.group) + (d.city ? ' · ' + esc(d.city) + ', ' + esc(d.state) : '') + '</div></div>' +
        '<button class="drawer-close" data-act="close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '</div>' +
      '<div class="drawer-body">' +
        '<div class="badges" style="margin-bottom:18px">' +
          '<span class="badge badge-cat"><span class="dot" style="background:' + CAT_COLORS[d.group] + '"></span>' + esc(d.group) + '</span>' +
          (d.rating != null ? '<span class="badge badge-state" style="color:var(--star)">★ ' + d.rating.toFixed(1) + ' (' + d.reviews + ')</span>' : '') +
          (d.ads ? '<span class="badge badge-state" style="color:var(--warn)">Running ads</span>' : '') +
          (d.closed_temp ? '<span class="badge badge-state" style="color:var(--danger)">Temp. closed</span>' : '') +
        '</div>' +

        '<div class="detail-section"><h4>Pipeline Status</h4><div class="status-grid" id="dStatus">' +
          STATUSES.map(function (s) { return '<button class="status-opt' + (m.status === s.id ? ' sel' : '') + '" data-st="' + s.id + '" style="' + (m.status === s.id ? 'background:' + s.color + '22;color:' + s.color + ';border-color:' + s.color : '') + '">' + s.label + '</button>'; }).join('') +
        '</div></div>' +

        (d.phone ? '<div class="detail-section"><h4>WhatsApp' + (m.wa_checkedAt ? ' <span style="color:var(--fg-3);text-transform:none;letter-spacing:0;font-weight:400">· auto-checked</span>' : '') + '</h4>' +
          '<div class="wa-status ' + (m.wa === 'yes' ? 'is-yes' : m.wa === 'no' ? 'is-no' : 'is-unknown') + '" id="dWaStatus">' +
            waSvg('wa-big') +
            '<div><div class="wa-state-label">' + (m.wa === 'yes' ? 'Has WhatsApp' : m.wa === 'no' ? 'No WhatsApp' : 'Not checked yet') + '</div>' +
            '<div class="wa-state-sub">' + esc(d.phone) + '</div></div>' +
          '</div>' +
          '<div class="drawer-actions" style="margin-top:12px">' +
            '<a class="btn btn-primary" href="' + waLink(d.phone) + '" target="_blank" rel="noopener">' + waSvg() + 'Open chat</a>' +
          '</div>' +
          '<div class="status-grid" id="dWa" style="margin-top:10px">' +
            '<button class="status-opt' + (m.wa === 'yes' ? ' sel' : '') + '" data-wa="yes"' + (m.wa === 'yes' ? ' style="background:rgba(16,185,129,.15);color:var(--accent);border-color:var(--accent)"' : '') + '>Has WhatsApp</button>' +
            '<button class="status-opt' + (m.wa === 'no' ? ' sel' : '') + '" data-wa="no"' + (m.wa === 'no' ? ' style="background:rgba(239,68,68,.15);color:var(--danger);border-color:var(--danger)"' : '') + '>No WhatsApp</button>' +
            '<button class="status-opt' + (!m.wa ? ' sel' : '') + '" data-wa="">Unknown</button>' +
          '</div>' +
          '<div class="wa-tip">Tip: use the <b>wa-checker</b> tool to auto-check every number at once — see the Import page.</div>' +
        '</div>' : '') +

        (d.phone ? '<div class="detail-section"><h4>WhatsApp Pitch' + (m.pitched ? ' <span style="color:var(--accent);text-transform:none;letter-spacing:0;font-weight:600">· pitched ✓</span>' : '') + '</h4>' +
          '<textarea class="notes-area" id="dPitch" rows="6">' + esc(buildPitch(d)) + '</textarea>' +
          '<div class="drawer-actions" style="margin-top:9px">' +
            '<a class="btn btn-wa" id="dSendPitch" href="' + waPitchLink(d) + '" target="_blank" rel="noopener">' + waSvg() + 'Send on WhatsApp</a>' +
            (AI.enabled ? '<button class="btn btn-ai" id="dAiWrite">' + sparkleSvg() + 'Write with AI</button>' : '') +
            '<button class="btn" id="dCopyPitch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</button>' +
            '<button class="btn' + (m.pitched ? ' btn-primary' : '') + '" id="dMarkPitched">' + (m.pitched ? 'Pitched ✓' : 'Mark pitched') + '</button>' +
          '</div>' +
          '<div class="wa-tip">Auto-written from this lead’s details — edit freely. “Send” opens WhatsApp with the message ready. Set your name &amp; offer on the <b>Pitch</b> page.</div>' +
        '</div>' : '') +

        '<div class="detail-section"><h4>Tags</h4>' +
          '<div class="tag-editor" id="dTags">' + tagsHtml(m.tags || []) + '</div>' +
          '<input id="dTagInput" class="tag-input" placeholder="Add a tag, press Enter…" maxlength="24" autocomplete="off">' +
        '</div>' +

        '<div class="detail-section"><h4>Notes timeline</h4>' +
          '<div class="notes-list" id="dNotes">' + notesTimelineHtml(id) + '</div>' +
          '<div class="note-compose"><textarea class="notes-area" id="dNote" rows="2" placeholder="Write a note…"></textarea>' +
          '<button class="btn btn-primary" id="dAddNote"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Add note</button></div>' +
        '</div>' +

        '<div class="detail-section"><h4>Contact &amp; Details <button class="edit-toggle" id="dEditToggle">Edit</button></h4>' +
          '<div id="dContactView">' + contactViewHtml(d) + '</div>' +
          '<div id="dContactEdit" style="display:none">' + contactEditHtml(d) + '</div>' +
        '</div>' +

        (d.description ? '<div class="detail-section"><h4>About</h4><div class="desc-text">' + esc(d.description) + '</div></div>' : '') +
        (d.keywords ? '<div class="detail-section"><h4>Review Keywords</h4><div class="desc-text">' + esc(d.keywords) + '</div></div>' : '') +
        compHtml +

        '<div class="detail-section"><div class="drawer-actions">' +
          '<button class="btn" id="dStar"><svg viewBox="0 0 24 24" fill="' + (m.star ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>' + (m.star ? 'Marked' : 'Mark Lead') + '</button>' +
          (d.phone ? '<a class="btn" href="tel:' + esc(d.phone) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call</a>' : '') +
          (d.website ? '<a class="btn" href="' + esc(d.website) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>Visit Site</a>' : '') +
        '</div></div>' +
      '</div>';

    // wire drawer events
    $('.drawer-close', dr).onclick = closeDrawer;
    $$('#dStatus .status-opt').forEach(function (b) {
      b.onclick = function () {
        var st = b.getAttribute('data-st');
        var cur = metaOf(id).status;
        setMeta(id, { status: cur === st ? '' : st });
        openDrawer(id); refreshActive(); updateCounts();
        toast(cur === st ? 'Status cleared' : 'Status: ' + STATUS_MAP[st].label);
      };
    });
    // tags
    $('#dTagInput', dr).addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var t = this.value.trim(); if (!t) return;
      var tags = (metaOf(id).tags || []).slice();
      if (tags.indexOf(t) === -1) { tags.push(t); setMeta(id, { tags: tags }); }
      this.value = '';
      $('#dTags', dr).innerHTML = tagsHtml(metaOf(id).tags || []);
      buildControls(); refreshActive();
    });
    $('#dTags', dr).addEventListener('click', function (e) {
      var b = e.target.closest('[data-tagrm]'); if (!b) return;
      var t = b.getAttribute('data-tagrm');
      var tags = (metaOf(id).tags || []).filter(function (x) { return x !== t; });
      setMeta(id, { tags: tags });
      $('#dTags', dr).innerHTML = tagsHtml(tags);
      buildControls(); refreshActive();
    });
    // pitch
    if ($('#dPitch', dr)) {
      var syncPitchLink = function () { $('#dSendPitch', dr).href = waLink(d.phone) + '?text=' + encodeURIComponent($('#dPitch', dr).value); };
      $('#dPitch', dr).addEventListener('input', syncPitchLink);
      $('#dSendPitch', dr).addEventListener('click', function () { if (!metaOf(id).pitched) { markPitched(id, true); refreshActive(); } });
      $('#dCopyPitch', dr).onclick = function () { copyText($('#dPitch', dr).value); toast('Pitch copied'); };
      if ($('#dAiWrite', dr)) $('#dAiWrite', dr).onclick = function () { aiWritePitch(id, $('#dPitch', dr), $('#dSendPitch', dr), this); };
      $('#dMarkPitched', dr).onclick = function () { var was = metaOf(id).pitched; markPitched(id, !was); openDrawer(id); refreshActive(); toast(was ? 'Unmarked' : 'Marked as pitched'); };
    }
    // notes timeline
    $('#dAddNote', dr).onclick = function () {
      var v = $('#dNote', dr).value.trim(); if (!v) return;
      addNoteFor(id, v); $('#dNote', dr).value = '';
      $('#dNotes', dr).innerHTML = notesTimelineHtml(id);
      refreshActive(); toast('Note added');
    };
    $('#dNotes', dr).addEventListener('click', function (e) {
      var b = e.target.closest('[data-notedel]'); if (!b) return;
      deleteNoteFor(id, b.getAttribute('data-notedel'));
      $('#dNotes', dr).innerHTML = notesTimelineHtml(id);
      refreshActive(); toast('Note deleted');
    });
    // editable contact
    $('#dEditToggle', dr).onclick = function () {
      var v = $('#dContactView', dr), ed = $('#dContactEdit', dr);
      var editing = ed.style.display !== 'none';
      v.style.display = editing ? '' : 'none';
      ed.style.display = editing ? 'none' : '';
      this.textContent = editing ? 'Edit' : 'Cancel';
    };
    if ($('#dSaveContact', dr)) $('#dSaveContact', dr).onclick = function () {
      $$('#dContactEdit [data-editfield]', dr).forEach(function (inp) {
        var f = inp.getAttribute('data-editfield'), val = inp.value.trim();
        if ((d[f] || '') !== val) updateLeadField(id, f, val);
      });
      openDrawer(id); refreshActive(); toast('Details saved');
    };
    if ($('#dCancelContact', dr)) $('#dCancelContact', dr).onclick = function () { openDrawer(id); };
    $('#dStar', dr).onclick = function () { toggleStar(id); openDrawer(id); refreshActive(); };
    $$('#dWa .status-opt').forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute('data-wa');
        setMeta(id, { wa: v || undefined, wa_checkedAt: undefined });
        openDrawer(id); refreshActive(); updateCounts();
        toast(v === 'yes' ? 'Marked: has WhatsApp' : v === 'no' ? 'Marked: no WhatsApp' : 'WhatsApp status cleared');
      };
    });

    $('#scrim').classList.add('open');
    dr.classList.add('open'); dr.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true');
    $('#scrim').classList.remove('open');
  }

  /* ===================== ACTIONS ===================== */
  function toggleStar(id) {
    var cur = metaOf(id).star;
    setMeta(id, { star: !cur });
    updateCounts();
    toast(!cur ? 'Lead marked' : 'Removed from marked');
  }
  function refreshActive() {
    if (state.view === 'dashboard') renderDashboard();
    else if (state.view === 'leads') renderLeads();
    else if (state.view === 'saved') renderSaved();
    else if (state.view === 'pipeline') renderPipeline();
    else if (state.view === 'whatsapp') renderWhatsapp();
    else if (state.view === 'pitch') renderPitch();
  }

  /* card/table delegated clicks */
  function wireContainer(container) {
    container.addEventListener('click', function (e) {
      var stop = e.target.closest('[data-stop]');
      var actEl = e.target.closest('[data-act]');
      var card = e.target.closest('[data-id]');
      if (!card) return;
      var id = card.getAttribute('data-id');
      if (stop) return; // links handle themselves
      if (actEl) {
        var act = actEl.getAttribute('data-act');
        if (act === 'star') { e.stopPropagation(); toggleStar(id); refreshActive(); return; }
        if (act === 'note') { e.stopPropagation(); openDrawer(id); setTimeout(function () { var n = $('#dNote'); if (n) n.focus(); }, 350); return; }
        if (act === 'open') { openDrawer(id); return; }
        if (act === 'status') return; // handled by change
      }
    });
    container.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-act="status"]');
      if (!sel) return;
      var card = e.target.closest('[data-id]'); var id = card.getAttribute('data-id');
      setMeta(id, { status: sel.value });
      updateCounts();
      if (state.view === 'pipeline') renderPipeline();
      else { var c = card; c.querySelector('.badges') && refreshActive(); }
      toast(sel.value ? 'Status: ' + STATUS_MAP[sel.value].label : 'Status cleared');
    });
    // table header sort
    container.addEventListener('click', function (e) {
      var th = e.target.closest('th[data-sort]'); if (!th) return;
      var k = th.getAttribute('data-sort');
      if (k === 'status' || k === 'contact') return;
      state.sort = k; $('#sortSel').value = ['name', 'rating', 'reviews', 'state', 'city'].indexOf(k) >= 0 ? k : 'name';
      renderLeads();
    });
  }

  /* ===================== NAV / VIEWS ===================== */
  var TITLES = {
    dashboard: ['Dashboard', 'Overview of all leads'],
    leads: ['All Leads', 'Browse, filter & manage every lead'],
    saved: ['Marked / Saved', 'Your starred leads'],
    pipeline: ['Status Board', 'Leads grouped by pipeline stage'],
    whatsapp: ['WhatsApp Check', 'See which of your leads are on WhatsApp'],
    pitch: ['Pitch on WhatsApp', 'Personalized outreach for every lead'],
    import: ['Import Data', 'Upload Excel / CSV files — auto-parsed & de-duplicated']
  };
  function gotoView(v) {
    state.view = v;
    $$('.view').forEach(function (el) { el.classList.remove('active'); });
    $('#view-' + v).classList.add('active');
    $$('.nav-item[data-view]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === v); });
    var t = TITLES[v] || ['', ''];
    $('#pageTitle').textContent = t[0];
    $('#pageSub').textContent = v === 'dashboard' ? 'Overview of all ' + LEADS.length + ' leads' : t[1];
    if (v === 'dashboard') renderDashboard();
    if (v === 'leads') renderLeads();
    if (v === 'saved') renderSaved();
    if (v === 'pipeline') renderPipeline();
    if (v === 'whatsapp') renderWhatsapp();
    if (v === 'pitch') renderPitch();
    if (v === 'import') renderImport();
    $('#sidebar').classList.remove('open');
    window.scrollTo(0, 0);
  }

  function updateCounts() {
    $('#navCountAll').textContent = LEADS.length;
    $('#navCountSaved').textContent = Object.keys(META).filter(function (k) { return META[k].star; }).length;
    $('#navCountTracked').textContent = Object.keys(META).filter(function (k) { return META[k].status; }).length;
    var imp = LEADS.filter(function (l) { return !l._seed; }).length;
    $('#navCountImported').textContent = imp;
    var waN = Object.keys(META).filter(function (k) { return META[k].wa === 'yes'; }).length;
    $('#navCountWa').textContent = waN;
    var pitchN = Object.keys(META).filter(function (k) { return META[k].pitched; }).length;
    if ($('#navCountPitch')) $('#navCountPitch').textContent = pitchN;
  }

  /* rebuild dataset-dependent UI after data changes */
  function refreshAll() {
    buildControls(); buildCatNav(); updateCounts();
    updateFoot();
    refreshActive();
  }

  function buildCatNav() {
    var groups = countBy(LEADS, 'group');
    $('#catNav').innerHTML = groups.map(function (g) {
      return '<button class="nav-item" data-cat="' + esc(g.k) + '"><span class="dot" style="background:' + (CAT_HEX[g.k] || '#64748b') + '"></span>' + esc(g.k) + '<span class="count">' + g.v + '</span></button>';
    }).join('');
    $$('#catNav [data-cat]').forEach(function (b) {
      b.onclick = function () { clearF(); state.f.group = b.getAttribute('data-cat'); gotoView('leads'); syncControls(); };
    });
  }

  /* ===================== CONTROLS ===================== */
  function fillSelect(id, items, cur) {
    var el = $(id); var first = el.options[0].outerHTML;
    el.innerHTML = first + items.map(function (x) { return '<option value="' + esc(x) + '"' + (cur === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
    el.value = cur || '';
  }
  function buildControls() {
    var states = countBy(LEADS, 'state_name').map(function (x) { return x.k; }).filter(function (x) { return x !== '—'; });
    var groups = countBy(LEADS, 'group').map(function (x) { return x.k; });
    var cities = countBy(LEADS.filter(function (d) { return d.city; }), 'city').map(function (x) { return x.k; });
    var services = countBy(LEADS.filter(function (d) { return d.service; }), 'service').map(function (x) { return x.k; });
    fillSelect('#fState', states, state.f.state);
    fillSelect('#fGroup', groups, state.f.group);
    fillSelect('#fCity', cities, state.f.city);
    fillSelect('#fService', services, state.f.service);
    var tags = allTags();
    if (state.f.tag && tags.indexOf(state.f.tag) === -1) state.f.tag = '';
    fillSelect('#fTag', tags, state.f.tag);
  }
  function syncControls() {
    $('#fState').value = state.f.state; $('#fGroup').value = state.f.group;
    $('#fCity').value = state.f.city; $('#fService').value = state.f.service;
    $('#fStatus').value = state.f.status; $('#fRating').value = state.f.rating;
    $('#fWa').value = state.f.wa; $('#fTag').value = state.f.tag;
    $$('.toggle-pill[data-flag]').forEach(function (b) { b.classList.toggle('on', !!state.f[b.getAttribute('data-flag')]); });
    if (state.view === 'leads') renderLeads();
  }
  function clearF() { state.f = { state: '', group: '', city: '', service: '', status: '', rating: '', wa: '', tag: '', website: false, phone: false, marked: false }; }
  function allTags() {
    var set = {}; Object.keys(META).forEach(function (k) { (META[k].tags || []).forEach(function (t) { set[t] = (set[t] || 0) + 1; }); });
    return Object.keys(set).sort();
  }

  /* ===================== TOAST ===================== */
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' + esc(msg);
    t.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ===================== CSV EXPORT ===================== */
  function leadsToCSV(list) {
    var cols = ['name', 'group', 'service', 'main_category', 'state_name', 'city', 'rating', 'reviews', 'phone', 'whatsapp', 'pitched', 'website', 'address', 'owner', 'status', 'tags', 'notes', 'link'];
    var rows = [cols.join(',')];
    list.forEach(function (d) {
      var m = metaOf(d.id);
      rows.push(cols.map(function (c) {
        var v = c === 'status' ? (m.status || '')
          : c === 'notes' ? notesOf(d.id).map(function (n) { return n.body; }).join(' | ')
          : c === 'tags' ? (m.tags || []).join(' ')
          : c === 'pitched' ? (m.pitched ? 'yes' : '')
          : c === 'whatsapp' ? (m.wa === 'yes' ? 'yes' : m.wa === 'no' ? 'no' : '') : (d[c] == null ? '' : d[c]);
        v = String(v).replace(/"/g, '""');
        return /[",\n]/.test(v) ? '"' + v + '"' : v;
      }).join(','));
    });
    return '﻿' + rows.join('\n');
  }
  // the leads currently shown on whatever view is active — used by the export button
  function currentViewList() {
    switch (state.view) {
      case 'saved': return sortLeads(LEADS.filter(function (d) { return metaOf(d.id).star; }));
      case 'pipeline': return sortLeads(LEADS.filter(function (d) { return metaOf(d.id).status; }));
      case 'whatsapp': return whatsappList();
      case 'pitch': return pitchList();
      case 'leads': return sortLeads(applyFilters());
      default: return LEADS;
    }
  }
  function downloadText(str, filename, mime) {
    var blob = new Blob([str], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function downloadCSV(str, filename) { downloadText(str, filename, 'text/csv'); }

  /* ---- WhatsApp results exchange ---- */
  function exportWaNumbers() {
    var nums = LEADS.filter(function (d) { return d.phone; }).map(function (d) { return { id: d.id, name: d.name, phone: d.phone }; });
    downloadText(JSON.stringify({ type: 'whatsapp-numbers', exportedAt: Date.now(), count: nums.length, numbers: nums }, null, 1), 'wa-numbers.json', 'application/json');
    toast('Exported ' + nums.length + ' numbers — move wa-numbers.json into the wa-checker folder');
  }
  function normalizeWa(v) {
    if (v === true) return 'yes'; if (v === false) return 'no';
    var s = String(v == null ? '' : v).trim().toLowerCase().replace(/\s+/g, '');
    if (/^(yes|y|1|true|has|haswhatsapp|onwhatsapp|whatsappavailable|registered|valid|active|available|on)$/.test(s)) return 'yes';
    if (/^(no|n|0|false|not|notavailable|whatsappnotavailable|unavailable|nowhatsapp|unregistered|invalid|inactive|off)$/.test(s)) return 'no';
    return '';
  }
  function isWaResults(data) {
    if (!data) return false;
    if (data.type === 'whatsapp-results') return true;
    var arr = Array.isArray(data) ? data : data.results;
    return Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object' &&
      ('wa' in arr[0] || 'hasWhatsapp' in arr[0] || 'whatsapp' in arr[0]) && ('id' in arr[0] || 'phone' in arr[0] || 'number' in arr[0]);
  }
  function applyWaResults(data) {
    var arr = Array.isArray(data) ? data : (data.results || []);
    var byPhone = {}, byId = {};
    LEADS.forEach(function (l) { byId[l.id] = true; if (l.phone) { var k = waDigits(l.phone); if (!byPhone[k]) byPhone[k] = l.id; } });
    var n = 0;
    arr.forEach(function (r) {
      var wa = normalizeWa(r.wa !== undefined ? r.wa : (r.hasWhatsapp !== undefined ? r.hasWhatsapp : r.whatsapp));
      if (wa !== 'yes' && wa !== 'no') return;
      var id = (r.id && byId[r.id]) ? r.id : ((r.phone || r.number) ? byPhone[waDigits(r.phone || r.number)] : null);
      if (!id) return;
      setMeta(id, { wa: wa, wa_checkedAt: r.checkedAt || Date.now() });
      n++;
    });
    return n;
  }
  /* ---- one-time migration: browser (localStorage) data → database ---- */
  function migrateLocalToDb() {
    if (!API) { toast('Start the database server first (npm start), then reopen at localhost:3000'); return; }
    var lmeta = {}, lnotes = {}, lovr = {}, limp = [];
    try { lmeta = JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) {}
    try { lnotes = JSON.parse(localStorage.getItem(NOTES_KEY)) || {}; } catch (e) {}
    try { lovr = JSON.parse(localStorage.getItem(OVR_KEY)) || {}; } catch (e) {}
    try { limp = JSON.parse(localStorage.getItem(IMPORT_KEY)) || []; } catch (e) {}
    Object.keys(lmeta).forEach(function (id) { var m = lmeta[id]; if (m && m.note && String(m.note).trim()) { lnotes[id] = lnotes[id] || []; lnotes[id].push({ body: m.note, at: Date.now() }); delete m.note; } });
    if (!limp.length && !Object.keys(lmeta).length && !Object.keys(lnotes).length && !Object.keys(lovr).length) { toast('No browser-saved data found to import'); return; }
    if (!confirm('Import your browser-saved leads, marks, statuses, tags and notes into the database? Your browser copy will then be cleared to avoid duplicates.')) return;
    var counts = { leads: 0, meta: 0, notes: 0 };
    var chain = Promise.resolve();
    if (limp.length) { limp.forEach(enrich); chain = chain.then(function () { return fetch(API + '/leads/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leads: limp }) }).then(function (r) { return r.json(); }).then(function (j) { counts.leads = j.added || 0; }); }); }
    chain = chain.then(function () {
      var ids = {}; Object.keys(lmeta).forEach(function (id) { ids[id] = 1; }); Object.keys(lovr).forEach(function (id) { ids[id] = 1; });
      return Promise.all(Object.keys(ids).map(function (id) {
        var m = lmeta[id] || {}, ov = lovr[id] || {}, patch = {};
        if (m.star) patch.starred = true;
        if (m.status) patch.status = m.status;
        if (m.wa) patch.wa = m.wa;
        if (m.wa_checkedAt) patch.wa_checkedAt = m.wa_checkedAt;
        if (m.tags && m.tags.length) patch.tags = m.tags;
        ['phone', 'website', 'name', 'address', 'owner', 'hours', 'main_category'].forEach(function (k) { if (ov[k] !== undefined) patch[k] = ov[k]; });
        if (!Object.keys(patch).length) return Promise.resolve();
        counts.meta++;
        return fetch(API + '/leads/' + encodeURIComponent(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }).catch(function () {});
      }));
    });
    chain = chain.then(function () {
      var jobs = [];
      Object.keys(lnotes).forEach(function (id) { (lnotes[id] || []).forEach(function (n) { if (n && n.body) { counts.notes++; jobs.push(fetch(API + '/leads/' + encodeURIComponent(id) + '/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: n.body }) }).catch(function () {})); } }); });
      return Promise.all(jobs);
    });
    chain.then(reloadFromServer).then(function () {
      try { localStorage.removeItem(META_KEY); localStorage.removeItem(NOTES_KEY); localStorage.removeItem(OVR_KEY); localStorage.removeItem(IMPORT_KEY); } catch (e) {}
      refreshAll(); renderImport();
      toast('Imported into database: ' + counts.leads + ' leads · ' + counts.meta + ' updates · ' + counts.notes + ' notes');
    }).catch(function () { toast('Migration failed — is the server running?'); });
  }
  function exportCSV() {
    var list = currentViewList();
    downloadCSV(leadsToCSV(list), 'leads-' + state.view + '-' + list.length + '.csv');
    toast('Exported ' + list.length + ' leads (current view) to CSV');
  }

  /* ===================== IMPORT (Excel / CSV / HTML / JSON) ===================== */
  var DEFS = {
    place_id: ['place id', 'placeid', 'cid', 'google id', 'gmap id'],
    name: ['name', 'business name', 'business', 'company', 'company name', 'title', 'lead name'],
    description: ['description', 'about', 'desc', 'summary', 'overview', 'bio'],
    ads: ['is spending on ads', 'spending on ads', 'ads', 'running ads', 'has ads'],
    reviews: ['reviews', 'review count', 'reviews count', 'number of reviews', 'num reviews', 'total reviews', 'rating count'],
    rating: ['rating', 'stars', 'star', 'score', 'avg rating', 'average rating', 'google rating'],
    competitors: ['competitors', 'competition'],
    website: ['website', 'site', 'url', 'web', 'web url', 'website url', 'domain', 'web address'],
    phone: ['phone', 'phone number', 'telephone', 'tel', 'contact', 'contact number', 'mobile', 'cell', 'phone 1'],
    can_claim: ['can claim', 'claimable'],
    owner: ['owner name', 'owner', 'proprietor'],
    owner_link: ['owner profile link', 'owner link', 'owner profile'],
    image: ['featured image', 'image', 'photo', 'thumbnail', 'img', 'image url'],
    main_category: ['main category', 'category', 'business type', 'type', 'primary category', 'business category'],
    categories: ['categories', 'all categories', 'tags', 'sub categories', 'subcategories'],
    hours: ['workday timing', 'hours', 'timing', 'opening hours', 'business hours', 'working hours'],
    closed_temp: ['is temporarily closed', 'temporarily closed', 'temp closed'],
    closed_on: ['closed on', 'closed days'],
    address: ['address', 'full address', 'location', 'addr', 'street address', 'complete address'],
    keywords: ['review keywords', 'keywords', 'review tags'],
    link: ['link', 'google maps', 'maps', 'map link', 'gmaps', 'maps url', 'google maps url', 'map url', 'place link', 'profile link'],
    query: ['query', 'search', 'keyword', 'search query', 'search term', 'niche'],
    city: ['city', 'town', 'locality'],
    state: ['state', 'region', 'province'],
    state_name: ['state name', 'state full'],
    service: ['service', 'lead source', 'source', 'service type']
  };
  function normHeader(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  var ALIAS = {};
  Object.keys(DEFS).forEach(function (canon) {
    ALIAS[normHeader(canon)] = canon;
    DEFS[canon].forEach(function (a) { ALIAS[normHeader(a)] = canon; });
  });

  function truthy(v) { return /^(true|yes|1|y)$/i.test(String(v == null ? '' : v).trim()); }
  function mapObject(obj) {
    var rec = {};
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var c = ALIAS[normHeader(k)]; if (!c) continue;
      var v = obj[k]; v = (v == null ? '' : String(v)).trim();
      if (rec[c] === undefined || rec[c] === '') rec[c] = v;
    }
    return rec;
  }
  function finalizeRec(rec) {
    if (!rec) return null;
    rec.name = String(rec.name || '').trim();
    if (!rec.name) return null;
    rec.ads = truthy(rec.ads);
    rec.can_claim = truthy(rec.can_claim);
    rec.closed_temp = truthy(rec.closed_temp);
    var pid = rec.place_id || rec.id || '';
    rec.id = (pid && pid.length > 6 && !/^lead-/.test(pid)) ? pid
      : 'imp:' + hashStr(normTxt(rec.name) + '|' + phoneDigits(rec.phone) + '|' + normTxt(rec.address) + '|' + normTxt(rec.city));
    return rec;
  }
  var WA_COLS = { whatsapp: 1, wa: 1, whatsappstatus: 1, haswhatsapp: 1, whatsappavailable: 1 };
  var IDPHONE_COLS = { phone: 1, phonenumber: 1, number: 1, id: 1, placeid: 1, leadid: 1 };
  var LEAD_COLS = { address: 1, fulladdress: 1, maincategory: 1, category: 1, categories: 1, rating: 1, website: 1, reviews: 1, owner: 1, ownername: 1, description: 1 };
  function anyCol(keys, set) { for (var i = 0; i < keys.length; i++) { if (set[normHeader(keys[i])]) return true; } return false; }
  function waColName(keys) { for (var i = 0; i < keys.length; i++) { if (WA_COLS[normHeader(keys[i])]) return keys[i]; } return null; }

  // parse array-of-arrays into {keys, objects} using best header row
  function rowsToObjects(rows) {
    if (!rows || !rows.length) return { keys: [], objects: [] };
    var hi = -1, best = 0, lim = Math.min(8, rows.length), r, j;
    for (r = 0; r < lim; r++) {
      var c = 0; for (j = 0; j < rows[r].length; j++) { var nh = normHeader(rows[r][j]); if (ALIAS[nh] || WA_COLS[nh]) c++; }
      if (c > best) { best = c; hi = r; }
    }
    if (hi < 0 || best < 1) return { keys: [], objects: [] };
    var header = rows[hi], objects = [];
    for (var i = hi + 1; i < rows.length; i++) {
      var row = rows[i]; if (!row) continue;
      var obj = {}, nonEmpty = false;
      for (var k = 0; k < header.length; k++) {
        var key = header[k]; if (key == null || key === '') continue;
        var v = row[k]; v = (v == null ? '' : String(v)).trim();
        if (v !== '') nonEmpty = true;
        if (obj[key] === undefined || obj[key] === '') obj[key] = v;
      }
      if (nonEmpty) objects.push(obj);
    }
    return { keys: header, objects: objects };
  }
  // extract normalized WhatsApp rows [{id,phone,wa}] from plain objects (any header spellings)
  function waRowsFromObjs(objects) {
    return objects.map(function (o) {
      var out = {};
      for (var k in o) {
        if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
        var n = normHeader(k);
        if (WA_COLS[n]) out.wa = o[k];
        else if (n === 'phone' || n === 'phonenumber' || n === 'number') out.phone = o[k];
        else if (n === 'id' || n === 'placeid' || n === 'leadid') out.id = o[k];
      }
      return out;
    }).filter(function (r) { return r.wa !== undefined && (r.phone || r.id); });
  }
  // decide whether a table is WhatsApp results, lead rows, or both → {leads, waRows}
  function interpretRows(rows) {
    var o = rowsToObjects(rows);
    if (!o.keys.length) return { leads: [], waRows: [] };
    var hasWa = anyCol(o.keys, WA_COLS), hasIdPhone = anyCol(o.keys, IDPHONE_COLS), rich = anyCol(o.keys, LEAD_COLS);
    if (hasWa && hasIdPhone && !rich) return { leads: [], waRows: waRowsFromObjs(o.objects) };
    var leads = o.objects.map(function (obj) { return finalizeRec(mapObject(obj)); }).filter(Boolean);
    var waRows = (hasWa && hasIdPhone) ? waRowsFromObjs(o.objects) : [];
    return { leads: leads, waRows: waRows };
  }
  function parseDelimited(text, delim) {
    var rows = [], row = [], field = '', i = 0, inq = false, c;
    text = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    while (i < text.length) {
      c = text[i];
      if (inq) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inq = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { inq = true; i++; continue; }
      if (c === delim) { row.push(field); field = ''; i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  function sniffDelim(text) {
    var line = String(text).split('\n')[0] || '';
    var counts = { ',': (line.match(/,/g) || []).length, '\t': (line.match(/\t/g) || []).length, ';': (line.match(/;/g) || []).length };
    var best = ',', bv = -1;
    Object.keys(counts).forEach(function (d) { if (counts[d] > bv) { bv = counts[d]; best = d; } });
    return best;
  }
  function parseHTMLTables(text) {
    var doc = new DOMParser().parseFromString(text, 'text/html');
    var tables = [].slice.call(doc.querySelectorAll('table'));
    if (!tables.length) return [];
    tables.sort(function (a, b) { return b.querySelectorAll('td,th').length - a.querySelectorAll('td,th').length; });
    var trs = [].slice.call(tables[0].querySelectorAll('tr'));
    return trs.map(function (tr) { return [].slice.call(tr.querySelectorAll('td,th')).map(function (td) { return td.textContent.trim(); }); });
  }
  function parseXLSX(buf) {
    if (typeof XLSX === 'undefined') throw new Error('Excel engine not loaded');
    var wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
    var leads = [], waRows = [];
    wb.SheetNames.forEach(function (sn) {
      var rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: '' });
      var res = interpretRows(rows);
      leads = leads.concat(res.leads); waRows = waRows.concat(res.waRows);
    });
    return { leads: leads, waRows: waRows };
  }
  function parseJSONText(text) {
    var data = JSON.parse(text);
    if (isWaResults(data)) return { leads: [], waRows: (Array.isArray(data) ? data : (data.results || [])) };
    if (!Array.isArray(data)) { data = Array.isArray(data.leads) ? data.leads : Array.isArray(data.data) ? data.data : [data]; }
    var recs = [];
    data.forEach(function (o) { if (o && typeof o === 'object') { var rec = finalizeRec(mapObject(o)); if (rec) recs.push(rec); } });
    return { leads: recs, waRows: [] };
  }
  function readFileRecords(file) {
    return new Promise(function (resolve, reject) {
      var name = file.name.toLowerCase(), fr = new FileReader();
      fr.onerror = function () { reject(new Error('read error')); };
      if (/\.(xlsx|xls)$/.test(name)) {
        fr.onload = function () { try { resolve(parseXLSX(fr.result)); } catch (e) { reject(e); } };
        fr.readAsArrayBuffer(file);
      } else {
        fr.onload = function () {
          try {
            var text = fr.result;
            if (/\.json$/.test(name)) resolve(parseJSONText(text));
            else if (/\.(html?|htm)$/.test(name)) resolve(interpretRows(parseHTMLTables(text)));
            else resolve(interpretRows(parseDelimited(text, /\.tsv$/.test(name) ? '\t' : sniffDelim(text))));
          } catch (e) { reject(e); }
        };
        fr.readAsText(file);
      }
    });
  }
  function stripDerived(l) { var c = {}; for (var k in l) { if (k === '_search' || k === '_i' || k === '_seed') continue; c[k] = l[k]; } return c; }
  function logRow(type, title, sub) {
    var icons = {
      ok: '<path d="M20 6 9 17l-5-5"/>',
      warn: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
      err: '<path d="M18 6 6 18M6 6l12 12"/>'
    };
    var div = document.createElement('div');
    div.className = 'log-row ' + type;
    div.innerHTML = '<svg class="lico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + icons[type] + '</svg>' +
      '<div class="lmsg"><b>' + esc(title) + '</b><div class="sub">' + sub + '</div></div>';
    $('#importLog').appendChild(div);
  }
  function importFiles(fileList, silent) {
    var files = [].slice.call(fileList).filter(Boolean);
    if (!files.length) return Promise.resolve();
    if (!silent) {
      gotoView('import');
      var log = $('#importLog'); log.style.display = ''; log.innerHTML = '';
      logRow('ok', 'Reading ' + files.length + ' file' + (files.length > 1 ? 's' : '') + '…', 'parsing & enriching');
    }
    var allLeads = [], allWa = [];
    return files.reduce(function (chain, file) {
      return chain.then(function () {
        return readFileRecords(file).then(function (res) {
          var leads = (res && res.leads) || [], waRows = (res && res.waRows) || [];
          allLeads = allLeads.concat(leads); allWa = allWa.concat(waRows);
          if (!silent) {
            var msgs = [];
            if (leads.length) msgs.push(leads.length + ' lead' + (leads.length === 1 ? '' : 's') + ' found');
            if (waRows.length) msgs.push(waRows.length + ' WhatsApp result' + (waRows.length === 1 ? '' : 's'));
            if (!msgs.length) msgs.push('nothing recognized in this file');
            logRow((leads.length || waRows.length) ? 'ok' : 'warn', file.name, msgs.join(' · '));
          }
        }).catch(function (e) {
          if (!silent) logRow('err', file.name, 'could not read — ' + (e && e.message ? e.message : 'unknown error'));
        });
      });
    }, Promise.resolve()).then(function () {
      if (API) {
        allLeads.forEach(enrich); // derive state/city/category/service before storing
        var info = { added: 0, dupes: 0 }, waApplied = 0, jobs = [];
        if (allLeads.length) jobs.push(fetch(API + '/leads/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leads: allLeads }) }).then(function (r) { return r.json(); }).then(function (j) { info = j; }));
        if (allWa.length) jobs.push(fetch(API + '/wa/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ results: allWa }) }).then(function (r) { return r.json(); }).then(function (j) { waApplied = j.applied || 0; }));
        return Promise.all(jobs).then(reloadFromServer).then(function () { finishImport(info.added || 0, info.dupes || 0, waApplied, silent, true); });
      }
      var prev = LEADS.length;
      if (allLeads.length) IMPORTED = IMPORTED.concat(allLeads);
      var waApplied = allWa.length ? applyWaResults(allWa) : 0;
      rebuildDataset();
      IMPORTED = LEADS.filter(function (l) { return !l._seed; }).map(stripDerived);
      var added = LEADS.length - prev, dupes = allLeads.length - added; if (dupes < 0) dupes = 0;
      var persisted = persistImported();
      finishImport(added, dupes, waApplied, silent, persisted);
    });
  }
  function finishImport(added, dupes, waApplied, silent, persisted) {
    if (!silent) {
      var parts = [];
      if (added || dupes) parts.push('<b>' + added + '</b> new lead' + (added === 1 ? '' : 's') + ' added · <b>' + dupes + '</b> duplicate' + (dupes === 1 ? '' : 's') + ' removed');
      if (waApplied) parts.push('<b>' + waApplied + '</b> WhatsApp status' + (waApplied === 1 ? '' : 'es') + ' updated');
      if (!parts.length) parts.push('nothing to import');
      logRow((added > 0 || waApplied > 0) ? 'ok' : 'warn', 'Done', parts.join(' · ') + (persisted ? '' : ' · ⚠ too large to save; kept for this session'));
      renderImport();
    }
    refreshAll();
    toast(waApplied && !added ? waApplied + ' WhatsApp statuses updated' : added + ' added · ' + dupes + ' duplicates removed');
  }
  function istat(v, l, accent) { return '<div class="istat' + (accent ? ' accent' : '') + '"><div class="iv tnum">' + v + '</div><div class="il">' + l + '</div></div>'; }
  function renderImport() {
    var importedCount = LEADS.filter(function (l) { return !l._seed; }).length;
    var seedCount = LEADS.length - importedCount;
    $('#importStats').innerHTML =
      istat(LEADS.length, 'Total leads') +
      istat(seedCount, 'Built-in') +
      istat(importedCount, 'Imported by you', true) +
      istat(statesCount(), 'States') +
      istat(countBy(LEADS, 'group').length, 'Categories');
  }
  function statesCount() { return countBy(LEADS, 'state_name').filter(function (x) { return x.k !== 'Unknown' && x.k !== '—'; }).length; }

  /* ===================== INIT / EVENTS ===================== */
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }

  function updateFoot() {
    var badge = API
      ? '<span class="db-badge on" title="Connected to local database">● Database connected</span>'
      : '<span class="db-badge off" title="Running from file — changes saved in this browser only. Run the server for the shared database.">● Local mode</span>';
    $('#footStats').innerHTML = badge + '<div style="margin-top:5px">' + LEADS.length + ' leads · ' + statesCount() + ' states</div>';
  }
  function boot() {
    detectApi().then(function (api) {
      API = api;
      var ready;
      if (API) {
        ready = reloadFromServer()
          .then(function () { return fetch('/api/ai/status').then(function (r) { return r.json(); }).then(function (j) { AI = j || AI; }).catch(function () {}); })
          .catch(function () { API = null; IMPORTED = loadImported(); loadLocalStores(); rebuildDataset(); });
      }
      else { IMPORTED = loadImported(); loadLocalStores(); rebuildDataset(); ready = Promise.resolve(); }
      ready.then(init);
    });
  }
  function init() {
    buildCatNav(); buildControls(); updateCounts();
    updateFoot();
    if (!API && $('#modeBanner')) $('#modeBanner').style.display = 'flex';
    if ($('#modeBannerClose')) $('#modeBannerClose').onclick = function () { $('#modeBanner').style.display = 'none'; };

    // nav
    $$('.nav-item[data-view]').forEach(function (b) { b.onclick = function () { gotoView(b.getAttribute('data-view')); }; });
    $('#menuBtn').onclick = function () { $('#sidebar').classList.toggle('open'); };

    // filters
    $('#fState').onchange = function () { state.f.state = this.value; renderLeads(); };
    $('#fGroup').onchange = function () { state.f.group = this.value; renderLeads(); };
    $('#fCity').onchange = function () { state.f.city = this.value; renderLeads(); };
    $('#fService').onchange = function () { state.f.service = this.value; renderLeads(); };
    $('#fStatus').onchange = function () { state.f.status = this.value; renderLeads(); };
    $('#fRating').onchange = function () { state.f.rating = this.value; renderLeads(); };
    $('#fWa').onchange = function () { state.f.wa = this.value; renderLeads(); };
    $('#fTag').onchange = function () { state.f.tag = this.value; renderLeads(); };
    $$('.toggle-pill[data-flag]').forEach(function (b) {
      b.onclick = function () { var f = b.getAttribute('data-flag'); state.f[f] = !state.f[f]; b.classList.toggle('on', state.f[f]); renderLeads(); };
    });
    $('#sortSel').onchange = function () { state.sort = this.value; renderLeads(); };
    $$('#viewSeg button').forEach(function (b) {
      b.onclick = function () { state.mode = b.getAttribute('data-mode'); $$('#viewSeg button').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); renderLeads(); };
    });
    $('#clearFilters').onclick = function () { clearF(); state.search = ''; $('#globalSearch').value = ''; syncControls(); renderLeads(); };

    // search (global) — affects leads view, jumps there if on dashboard
    $('#globalSearch').addEventListener('input', debounce(function () {
      state.search = this.value;
      if (state.view !== 'leads' && this.value) gotoView('leads');
      else if (state.view === 'leads') renderLeads();
    }, 180));

    $('#exportBtn').onclick = exportCSV;
    $('#importBtn').onclick = function () { gotoView('import'); };

    // ---- import / dropzone wiring ----
    var dz = $('#dropzone'), fi = $('#fileInput');
    dz.onclick = function () { fi.click(); };
    dz.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); } };
    fi.onchange = function () { if (fi.files && fi.files.length) importFiles(fi.files); fi.value = ''; };
    ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); e.stopPropagation(); dz.classList.add('drag'); }); });
    ['dragleave', 'dragend'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); e.stopPropagation(); dz.classList.remove('drag'); }); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault(); e.stopPropagation(); dz.classList.remove('drag');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) importFiles(e.dataTransfer.files);
    });
    // allow dropping anywhere to import (prevents browser navigating away)
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('drop', function (e) {
      if (e.target.closest && e.target.closest('#dropzone')) return;
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) importFiles(e.dataTransfer.files);
    });
    $('#exportAllBtn').onclick = function () { downloadCSV(leadsToCSV(LEADS), 'leads-all-' + LEADS.length + '.csv'); toast('Exported all ' + LEADS.length + ' leads'); };
    $('#exportNumbersBtn').onclick = exportWaNumbers;
    if ($('#migrateBtn')) $('#migrateBtn').onclick = migrateLocalToDb;

    // ---- WhatsApp view wiring ----
    $$('#waSeg button').forEach(function (b) {
      b.onclick = function () { state.waView = b.getAttribute('data-waview'); renderWhatsapp(); };
    });
    $('#waSearch').addEventListener('input', debounce(function () { state.waSearch = this.value; renderWhatsapp(); }, 160));
    $('#waExportBtn').onclick = exportWaNumbers;
    $('#waSyncBtn').onclick = function () {
      if (!API) { toast('Start the server first — then results auto-load from wa-checker'); return; }
      var btn = this; btn.disabled = true;
      fetch(API + '/wa/reload', { method: 'POST' }).then(function (r) { return r.json(); })
        .then(function (j) { return reloadFromServer().then(function () { refreshAll(); toast((j.applied || 0) + ' WhatsApp results loaded from wa-checker'); }); })
        .catch(function () { toast('Could not load wa-checker results'); })
        .then(function () { btn.disabled = false; });
    };
    var waFi = $('#waFileInput');
    $('#waLoadBtn').onclick = function () { waFi.click(); };
    waFi.onchange = function () { if (waFi.files && waFi.files.length) importFiles(waFi.files, true); waFi.value = ''; };
    $('#waListContainer').addEventListener('click', function (e) {
      var row = e.target.closest('[data-id]'); if (!row) return;
      var id = row.getAttribute('data-id');
      if (e.target.closest('[data-stop]')) return;
      var setBtn = e.target.closest('[data-waset]');
      if (setBtn) {
        var v = setBtn.getAttribute('data-waset');
        var cur = metaOf(id).wa;
        setMeta(id, cur === v ? { wa: undefined, wa_checkedAt: undefined } : { wa: v, wa_checkedAt: undefined });
        renderWhatsapp(); updateCounts();
        toast(cur === v ? 'Cleared' : v === 'yes' ? 'Marked: WhatsApp available' : 'Marked: not available');
        return;
      }
      var pitchLink = e.target.closest('[data-pitchsent]');
      if (pitchLink) { if (!metaOf(id).pitched) { markPitched(id, true); setTimeout(function () { renderWhatsapp(); }, 50); } return; }
      if (e.target.closest('[data-act="open"]')) openDrawer(id);
    });

    // ---- Pitch view wiring ----
    $('#pitchCfgSave').onclick = function () {
      PITCH.yourName = $('#pitchCfgName').value.trim();
      PITCH.company = $('#pitchCfgCompany').value.trim();
      PITCH.offer = $('#pitchCfgOffer').value.trim() || DEFAULT_PITCH.offer;
      PITCH.cta = $('#pitchCfgCta').value.trim() || DEFAULT_PITCH.cta;
      savePitch(); renderPitch();
      $('#pitchSettings').open = false;
      toast('Pitch settings saved');
    };
    $$('#pitchSeg button').forEach(function (b) { b.onclick = function () { state.pitchView = b.getAttribute('data-pv'); renderPitch(); }; });
    $('#pitchWaOnly').onclick = function () { state.pitchWaOnly = !state.pitchWaOnly; renderPitch(); };
    $('#pitchSearch').addEventListener('input', debounce(function () { state.pitchSearch = this.value; renderPitch(); }, 160));
    $('#pitchList').addEventListener('input', function (e) {
      var ta = e.target.closest('[data-pitchmsg]'); if (!ta) return;
      var card = e.target.closest('[data-id]'); var d = LEADS.filter(function (l) { return l.id === card.getAttribute('data-id'); })[0];
      if (d) card.querySelector('[data-sendpitch]').href = waLink(d.phone) + '?text=' + encodeURIComponent(ta.value);
    });
    $('#pitchList').addEventListener('click', function (e) {
      var card = e.target.closest('[data-id]'); if (!card) return;
      var id = card.getAttribute('data-id');
      var ta = card.querySelector('[data-pitchmsg]');
      if (e.target.closest('[data-act="open"]')) { openDrawer(id); return; }
      if (e.target.closest('[data-sendpitch]')) { if (!metaOf(id).pitched) { markPitched(id, true); setTimeout(renderPitch, 60); } return; }
      if (e.target.closest('[data-aiwrite]')) { aiWritePitch(id, ta, card.querySelector('[data-sendpitch]'), e.target.closest('[data-aiwrite]')); return; }
      if (e.target.closest('[data-copypitch]')) { copyText(ta.value); toast('Pitch copied'); return; }
      if (e.target.closest('[data-togglepitched]')) { var was = metaOf(id).pitched; markPitched(id, !was); renderPitch(); toast(was ? 'Unmarked' : 'Marked as pitched'); return; }
      if (e.target.closest('[data-regen]')) { var d = LEADS.filter(function (l) { return l.id === id; })[0]; if (d) { ta.value = buildPitch(d); card.querySelector('[data-sendpitch]').href = waPitchLink(d, ta.value); } return; }
    });

    $('#dedupeBtn').onclick = function () {
      if (API) { reloadFromServer().then(function () { refreshAll(); renderImport(); }); toast('Database is kept de-duplicated automatically'); return; }
      var before = LEADS.length; rebuildDataset();
      IMPORTED = LEADS.filter(function (l) { return !l._seed; }).map(stripDerived); persistImported();
      refreshAll(); renderImport();
      var removed = before - LEADS.length;
      toast(removed > 0 ? removed + ' duplicate' + (removed === 1 ? '' : 's') + ' removed' : 'No duplicates found — all clean');
    };
    $('#clearImportBtn').onclick = function () {
      var importedCount = LEADS.filter(function (l) { return !l._seed; }).length;
      if (!importedCount) { toast('No imported leads to remove'); return; }
      if (!confirm('Remove all ' + importedCount + ' imported leads? Built-in leads stay. This cannot be undone.')) return;
      if (API) {
        fetch(API + '/leads/imported', { method: 'DELETE' }).then(function () { return reloadFromServer(); }).then(function () { refreshAll(); renderImport(); $('#importLog').style.display = 'none'; toast('Imported leads removed'); });
        return;
      }
      IMPORTED = []; persistImported(); rebuildDataset(); refreshAll(); renderImport();
      $('#importLog').style.display = 'none';
      toast('Imported leads removed');
    };

    $('#scrim').onclick = closeDrawer;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === '/' && document.activeElement !== $('#globalSearch')) { e.preventDefault(); $('#globalSearch').focus(); }
    });

    wireContainer($('#leadsContainer'));
    wireContainer($('#savedContainer'));
    wireContainer($('#pipeContainer'));

    gotoView('dashboard');
    setTimeout(function () { $('#loadScreen').classList.add('hide'); }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
