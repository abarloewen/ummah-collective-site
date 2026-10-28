/* Logsco OS · single-page demo app. Hash routing, in-memory state, optional localStorage.
   All data comes from data.js and is fictional. */
(function () {
  "use strict";
  const L = window.LOGSCO, C = window.Charts;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const TODAY = new Date(L.today);
  const DAY = 864e5;
  const LOADED = Date.now();
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- icons ---------------- */
  const P = {
    overview: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    pipeline: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    staff: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    invoice: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    analytics: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    trendUp: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    trendDown: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    kanban: '<path d="M6 5v11M12 5v6M18 5v14"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    sortv: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
  };
  const ic = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

  /* ---------------- format ---------------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rm = (n) => "RM " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rm0 = rm; /* one currency style everywhere: RM 12,500.00 (abbreviated RM 5.56M only in KPI tiles and chart axes) */
  const rmc = (n) => n >= 1e6 ? "RM " + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M" : n >= 1e3 ? "RM " + (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "k" : "RM " + Math.round(n);
  const num = (n) => Math.round(n).toLocaleString("en-MY");
  const compact = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? Math.round(n / 1e3) + "k" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(Math.round(n));
  /* keep invoice numbers and domains on one line when text wraps */
  const nowrapIds = (html) => html.replace(/\b[\w.]+(?:-[\w.]+)+\b/g, (m) => `<span class="nw">${m}</span>`);
  const pct = (n, d = 1) => (isFinite(n) ? n : 0).toFixed(d) + "%";
  const dt = (iso) => new Date(iso);
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fdate = (iso) => { const d = dt(iso); return d.getDate() + " " + MON[d.getMonth()]; };
  const fdateY = (iso) => { const d = dt(iso); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); };
  const fday = (iso) => dt(iso).toLocaleDateString("en-GB", { weekday: "short" });
  const daysFrom = (iso) => Math.round((new Date(dt(iso).setHours(0, 0, 0, 0)) - TODAY) / DAY);
  function rel(iso) {
    const d = daysFrom(iso);
    if (d === 0) return "Today"; if (d === -1) return "Yesterday"; if (d === 1) return "Tomorrow";
    return d < 0 ? (-d < 14 ? -d + " days ago" : fdate(iso)) : (d < 14 ? "in " + d + " days" : fdate(iso));
  }
  function relH(daysFloat) {
    const m = Math.round(-daysFloat * 24 * 60);
    if (m < 60) return m + " min ago"; const h = Math.round(m / 60); if (h < 24) return h + " h ago"; const d = Math.round(h / 24); return d === 1 ? "Yesterday" : d + " days ago";
  }
  const HUES = [152, 168, 190, 32, 96, 212, 262, 330, 18, 128, 48, 280];
  const hue = (s) => HUES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
  const initials = (n) => { const w = String(n).replace(/[^A-Za-z' ]/g, " ").split(/\s+/).filter((x) => x && !/^(sdn|bhd|dan|&)$/i.test(x)); return w.length > 1 ? (w[0][0] + w[1][0]).toUpperCase() : (w[0] || "?").replace("'", "").slice(0, 2).toUpperCase(); };
  const av = (name, cls = "") => `<span class="avatar ${cls}" style="--h:${hue(name)}" title="${esc(name)}">${esc(initials(name))}</span>`;
  const lq = (name) => `<span class="logo-sq" style="--h:${hue(name)}" aria-hidden="true">${esc(initials(name))}</span>`;
  const divTag = (d) => `<span class="div-tag d-${d}">${d === "all" ? "Group" : esc(L.DIVS[d].short)}</span>`;
  const STAGE_C = { Lead: "var(--ink-3)", Qualified: "var(--s1)", "Site visit": "var(--s3)", Proposal: "var(--s4)", Negotiation: "var(--s2)", Won: "var(--good)", Lost: "var(--crit)" };
  const stageTag = (s) => `<span class="tag stg"><i style="background:${STAGE_C[s]}"></i>${esc(s)}</span>`;
  const DIVC = { agri: "var(--c-agri)", bev: "var(--c-bev)", estates: "var(--c-estates)" };
  const CO = Object.fromEntries(L.COMPANIES.map((c) => [c.id, c]));
  const ST = Object.fromEntries(L.STAFF.map((s) => [s.id, s]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = (p) => p + Math.random().toString(36).slice(2, 7);

  /* ---------------- state ---------------- */
  const KEY = "logsco-os-v2", UIKEY = "logsco-os-ui"; /* v2: data model changed, older saved state is ignored */
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: demo still works in memory */ } }
  const saved = read(KEY) || {};
  const S = {
    deals: saved.deals || clone(L.DEALS),
    invoices: saved.invoices || clone(L.INVOICES),
    leave: saved.leave || clone(L.LEAVE),
    tasks: saved.tasks || clone(L.TASKS),
    integrations: saved.integrations || clone(L.INTEGRATIONS),
    staffStatus: saved.staffStatus || Object.fromEntries(L.STAFF.map((s) => [s.id, s.status])),
    sequences: saved.sequences || clone(L.SEQUENCES),
    ads: saved.ads || clone(L.ADS),
    siteTasks: saved.siteTasks || Object.fromEntries(L.SITES.map((s) => [s.id, s.tasks.map((t) => t[1])])),
    notes: saved.notes || {},
    users: saved.users || clone(L.USERS),
    notifRead: saved.notifRead || false,
    tickets: saved.tickets || clone(L.TICKETS).map((t) => Object.assign(t, { deadline: LOADED - t.opened * 6e4 + t.sla * 36e5, issue: t.issue.replace(/\{opened-(\d+)\}/, (_, m) => { const d = new Date(LOADED - (t.opened + +m) * 6e4); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }) })),
    parts: saved.parts || clone(L.PARTS), commissioning: saved.commissioning || clone(L.COMMISSIONING), tours: saved.tours || clone(L.TOURS).sort((a, b) => a.date.localeCompare(b.date)), shop: saved.shop || clone(L.SHOP),
    socialSched: saved.socialSched || []
  };
  const UI = Object.assign({ theme: null, collapsed: false, division: "all", pipeView: "board", range: 30, site: "all", invFilter: "all", svcTab: "tickets" }, read(UIKEY) || {});
  function save() { write(KEY, { deals: S.deals, invoices: S.invoices, leave: S.leave, tasks: S.tasks, integrations: S.integrations, staffStatus: S.staffStatus, sequences: S.sequences, ads: S.ads, siteTasks: S.siteTasks, notes: S.notes, users: S.users, notifRead: S.notifRead, tickets: S.tickets, parts: S.parts, commissioning: S.commissioning, tours: S.tours, shop: S.shop, socialSched: S.socialSched }); }
  function saveUI() { write(UIKEY, UI); }

  /* derived */
  /* money is rounded to sen at every step, so line amounts, subtotal, SST and total always add up on paper */
  const sen = (n) => Math.round((+n || 0) * 100 + Number.EPSILON) / 100;
  const lineAmt = (l) => sen((+l.qty || 0) * (+l.price || 0));
  const invSub = (inv) => sen(inv.lines.reduce((s, l) => s + lineAmt(l), 0));
  const invTax = (inv) => sen(invSub(inv) * (+inv.sst || 0) / 100);
  const invTotal = (inv) => sen(invSub(inv) + invTax(inv));
  const qtyFmt = (n) => (+n || 0).toLocaleString("en-MY", { maximumFractionDigits: 2 });
  const invStatus = (inv) => inv.status === "sent" && daysFrom(inv.due) < 0 ? "overdue" : inv.status;
  const coDiv = (id) => (CO[id] ? CO[id].div : "agri");
  const inDiv = (d) => UI.division === "all" || d === UI.division;
  const openDeals = () => S.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  /* won in the last N days (by the day the deal was marked won) */
  const WON_DAYS = 90;
  const isWonRecent = (d, days = WON_DAYS) => d.stage === "Won" && daysFrom(d.close) >= -days && daysFrom(d.close) <= 0;
  /* lifetime value = contracts before the CRM + every deal won since */
  const ltvOf = (c) => (c.ltv || 0) + S.deals.filter((d) => d.co === c.id && d.stage === "Won").reduce((s, d) => s + d.value, 0);
  /* yyyy-mm-dd in local time (toISOString would shift the date east of UTC, e.g. Malaysia) */
  const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  let DRAG_ON = false;
  document.addEventListener("touchmove", (e) => { if (DRAG_ON) e.preventDefault(); }, { passive: false });

  /* ---------------- ui primitives ---------------- */
  const layerHost = $("#layer"), toasts = $("#toasts"), live = $("#live");
  function announce(t) { live.textContent = ""; setTimeout(() => (live.textContent = t), 30); }
  function toast(msg, opt = {}) {
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span class="ic">${ic(opt.icon || "check")}</span><p>${msg}</p>${opt.action ? `<button type="button">${esc(opt.action.label)}</button>` : ""}`;
    toasts.appendChild(t);
    const kill = () => { t.classList.add("out"); setTimeout(() => t.remove(), 220); };
    if (opt.action) t.querySelector("button").addEventListener("click", () => { opt.action.fn(); kill(); });
    setTimeout(kill, opt.ms || 4600);
    while (toasts.children.length > 3) toasts.firstChild.remove();
  }
  let layers = [];
  function openLayer(kind, inner, opt = {}) {
    closePops();
    const opener = document.activeElement;
    const ov = document.createElement("div"); ov.className = "overlay";
    const panel = document.createElement("div"); panel.className = kind + (opt.cls ? " " + opt.cls : "");
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); if (opt.label) panel.setAttribute("aria-label", opt.label);
    panel.innerHTML = inner; layerHost.append(ov, panel);
    const lay = { panel, ov, close, kind };
    ov.addEventListener("click", close);
    panel.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    layers.push(lay); root.classList.add("lock");
    setTimeout(() => { const f = panel.querySelector("[autofocus]") || panel.querySelector("input,select,textarea,button:not([data-close]),[href]") || panel.querySelector("button"); if (f) f.focus({ preventScroll: true }); }, 40);
    function close() {
      if (lay.closed) return; lay.closed = true;
      panel.classList.add("out"); ov.classList.add("out"); C.hideTip();
      setTimeout(() => { panel.remove(); ov.remove(); }, REDUCED ? 0 : 190);
      layers = layers.filter((x) => x !== lay);
      if (!layers.length && !side.classList.contains("open")) root.classList.remove("lock");
      if (opt.onClose) opt.onClose();
      if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
    }
    return lay;
  }
  const closeAll = () => layers.slice().forEach((l) => l.close());
  function drawerShell(o) {
    return `<div class="drawer-h">${o.lead || ""}<div class="grow"><h2>${o.title}</h2>${o.sub ? `<p>${o.sub}</p>` : ""}</div><button class="icon-btn" data-close aria-label="Close">${ic("x")}</button></div><div class="drawer-b">${o.body}</div>${o.foot ? `<div class="drawer-f">${o.foot}</div>` : ""}`;
  }
  document.addEventListener("keydown", (e) => {
    if (layers.length) {
      const top = layers[layers.length - 1];
      if (e.key === "Escape") { e.preventDefault(); top.close(); return; }
      if (e.key === "Tab") {
        const f = $$('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])', top.panel).filter((x) => x.offsetParent !== null);
        if (!f.length) return; const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });

  /* empty state */
  const empty = (icon, title, text) => `<div class="empty"><span class="ic">${ic(icon)}</span><b>${title}</b><p>${text}</p></div>`;

  /* ---------------- theme & shell ---------------- */
  const root = document.documentElement;
  function isDark() { return UI.theme ? UI.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function setTheme(t) {
    UI.theme = t; if (t) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme"); saveUI(); syncThemeBtn();
    $('meta[name="theme-color"]').setAttribute("content", isDark() ? "#070e0a" : "#123a22");
  }
  function toggleTheme() { setTheme(isDark() ? "light" : "dark"); toast(isDark() ? "Dark mode on" : "Light mode on", { icon: "moon" }); }
  function syncThemeBtn() { $("#themeBtn").setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode"); }
  function setCollapsed(v) { UI.collapsed = v; root.classList.toggle("side-collapsed", v); $("#collapse").setAttribute("aria-pressed", String(v)); $("#collapse").setAttribute("aria-label", v ? "Expand sidebar" : "Collapse sidebar"); $("#collapse .lbl").textContent = v ? "Expand" : "Collapse"; saveUI(); }

  const ROUTES = [
    { id: "overview", title: "Overview", icon: "overview", g: "Workspace" },
    { id: "pipeline", title: "Pipeline", icon: "pipeline", g: "Workspace", badge: () => openDeals().length },
    { id: "contacts", title: "Contacts & companies", short: "Contacts", icon: "building", g: "Workspace" },
    { id: "staff", title: "Staff", icon: "staff", g: "Workspace", badge: () => S.leave.filter((l) => l.status === "pending").length },
    { id: "service", title: "Service & spare parts", short: "Service", icon: "wrench", g: "Operations", badge: () => S.tickets.filter((t) => t.status !== "Resolved").length, hot: () => S.tickets.some((t) => t.pri === "P1" && t.status !== "Resolved") },
    { id: "invoicing", title: "Invoicing", icon: "invoice", g: "Operations", badge: () => S.invoices.filter((i) => invStatus(i) === "overdue").length, hot: () => true },
    { id: "estates", title: "Estates & café", icon: "leaf", g: "Operations" },
    { id: "campaigns", title: "Campaigns", icon: "megaphone", g: "Growth" },
    { id: "websites", title: "Websites", icon: "globe", g: "Growth" },
    { id: "analytics", title: "Analytics", icon: "analytics", g: "Growth" },
    { id: "settings", title: "Settings", icon: "settings", g: "Admin" }
  ];
  function renderNav() {
    const groups = {};
    ROUTES.forEach((r) => (groups[r.g] = groups[r.g] || []).push(r));
    $("#nav").innerHTML = Object.entries(groups).map(([g, rs]) => `<div class="nav-group"><div class="nav-h">${g}</div>${rs.map((r) => {
      const b = r.badge ? r.badge() : 0;
      return `<a class="nav-item" href="#/${r.id}" data-r="${r.id}" title="${esc(r.title)}">${ic(r.icon)}<span class="lbl">${esc(r.title)}</span>${b ? `<span class="badge-n ${r.hot && r.hot() ? "hot" : ""}">${b}</span>` : ""}</a>`;
    }).join("")}</div>`).join("");
    $("#bnav").innerHTML = ["overview", "pipeline", "contacts", "invoicing"].map((id) => { const r = ROUTES.find((x) => x.id === id); return `<a href="#/${id}" data-r="${id}">${ic(r.icon)}<span>${esc(r.short || r.title)}</span></a>`; }).join("") + `<button type="button" id="bnavMore" aria-label="Open full menu">${ic("menu")}<span>More</span></button>`;
    $("#bnavMore").addEventListener("click", openSide);
    markNav();
  }
  function markNav() { $$("[data-r]").forEach((a) => a.dataset.r === current ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")); }
  const side = $("#side"), scrim = $("#scrim");
  /* mobile menu behaves like a modal: background inert, page scroll locked, focus returns to the opener */
  let sideOpener = null;
  const bg = () => [$(".main-col"), $("#bnav"), $(".strip")];
  function openSide() {
    sideOpener = document.activeElement; closePops();
    side.classList.add("open"); scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("on")); $("#menuBtn").setAttribute("aria-expanded", "true");
    side.setAttribute("role", "dialog"); side.setAttribute("aria-modal", "true"); bg().forEach((x) => x && (x.inert = true)); root.classList.add("lock");
    setTimeout(() => { const a = $(".nav-item[aria-current]", side) || $(".nav-item", side); a && a.focus(); }, 60);
  }
  function closeSide(refocus = true) {
    if (!side.classList.contains("open")) return; side.classList.remove("open"); scrim.classList.remove("on"); setTimeout(() => (scrim.hidden = true), 200); $("#menuBtn").setAttribute("aria-expanded", "false");
    side.removeAttribute("role"); side.removeAttribute("aria-modal"); bg().forEach((x) => x && (x.inert = false)); if (!layers.length) root.classList.remove("lock");
    if (refocus && sideOpener && document.contains(sideOpener) && sideOpener.offsetParent !== null) sideOpener.focus({ preventScroll: true }); sideOpener = null;
  }
  side.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !side.classList.contains("open")) return;
    const f = $$("a[href],button:not([disabled])", side).filter((x) => x.offsetParent !== null); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* popovers */
  function closePops() { $$(".popover").forEach((p) => (p.hidden = true)); $$("#bellBtn,#userBtn").forEach((b) => b.setAttribute("aria-expanded", "false")); }
  function togglePop(btn, pop) { const open = pop.hidden; closePops(); if (open) { pop.style.top = window.innerWidth <= 860 ? Math.round(btn.getBoundingClientRect().bottom + 8) + "px" : ""; pop.hidden = false; btn.setAttribute("aria-expanded", "true"); const f = pop.querySelector("button,a"); f && f.focus(); } }
  const NOTIFS = [
    { icon: "alert", text: "<b>SR-2291</b> P1 SLA at risk at Sinar Tropika Fruits", t: -0.01, go: "service" },
    { icon: "globe", text: "New enquiry on logs-agri.com from <b>Orkid Highland Farms</b>", t: -0.02, go: "contacts" },
    { icon: "invoice", text: "<b>LAT-INV-26-0143</b> is overdue · RM 95,400.00", t: -0.2, go: "invoicing" },
    { icon: "calendar", text: "<b>Danial Rosli</b> requested 3 days annual leave", t: -0.4, go: "staff" },
    { icon: "bolt", text: "Batch 001 waitlist passed <b>2,400</b> sign-ups", t: -1, go: "campaigns", read: true }
  ];
  function renderNotifs() {
    const unread = S.notifRead ? 0 : NOTIFS.filter((n) => !n.read).length;
    $("#bellCount").hidden = !unread; $("#bellCount").textContent = unread;
    $("#bellBtn").setAttribute("aria-label", "Notifications" + (unread ? ", " + unread + " unread" : ""));
    $("#notif").innerHTML = `<div class="notif-h"><b id="notifH">Notifications</b><button type="button" class="link" id="markRead" ${unread ? "" : "disabled"}>${unread ? "Mark all read" : "All read"}</button></div><div class="notif-list">${NOTIFS.map((n) => `<button type="button" class="notif-item ${!S.notifRead && !n.read ? "unread" : ""}" data-go="${n.go}"><span class="ic">${ic(n.icon)}</span><div><p>${!S.notifRead && !n.read ? '<span class="sr-only">Unread: </span>' : ""}${n.text}</p><small>${relH(n.t)}</small></div></button>`).join("")}</div>`;
    /* update in place so focus and the open popover survive */
    $("#markRead").addEventListener("click", (e) => { e.stopPropagation(); S.notifRead = true; save(); $$("#notif .notif-item.unread").forEach((x) => { x.classList.remove("unread"); const u = x.querySelector(".sr-only"); if (u) u.remove(); }); $("#bellCount").hidden = true; $("#bellBtn").setAttribute("aria-label", "Notifications"); const b = $("#markRead"); b.textContent = "All read"; b.disabled = true; const f = $("#notif .notif-item"); if (f) f.focus(); announce("All notifications marked as read"); });
    $$("#notif [data-go]").forEach((b) => b.addEventListener("click", () => { closePops(); go(b.dataset.go); }));
  }

  /* ---------------- router ---------------- */
  let current = null, timers = [], afterRender = null;
  const main = $("#main");
  function go(id, then) { afterRender = then || null; if (location.hash === "#/" + id) route(true); else location.hash = "#/" + id; }
  function clearTimers() { timers.forEach(clearInterval); timers = []; }
  function skeleton(id) {
    /* same outline as the page that is loading: 6 KPI tiles on the overview, 4 stat tiles elsewhere */
    const tile = '<div class="card %C"><div class="sk sk-line" style="width:60%"></div><div class="sk" style="height:24px;width:70%;margin-top:10px"></div><div class="sk sk-line" style="width:40%"></div></div>';
    const tiles = id === "overview" ? `<div class="kpis">${tile.replace("%C", "kpi").repeat(6)}</div>` : ["pipeline", "contacts", "websites", "settings"].includes(id) ? "" : `<div class="stat-row">${tile.replace("%C", "stat").repeat(4)}</div>`;
    return `<div class="page-head" aria-hidden="true"><div><div class="sk sk-h"></div><div class="sk sk-line" style="width:320px;max-width:70vw"></div></div></div><p class="sr-only">Loading…</p>
    ${tiles}
    <div class="grid g-main"><div class="card"><div class="card-b"><div class="sk sk-line" style="width:30%"></div><div class="sk" style="height:220px;margin-top:14px"></div></div></div><div class="card"><div class="card-b"><div class="sk sk-line" style="width:40%"></div>${'<div class="sk sk-line"></div>'.repeat(7)}</div></div></div>`;
  }
  function route(force) {
    const id = (location.hash.replace(/^#\/?/, "").split("/")[0]) || "overview";
    const r = ROUTES.find((x) => x.id === id) || ROUTES[0];
    if (r.id !== id) history.replaceState(null, "", "#/" + r.id);
    if (r.id === current && !force) return;
    const first = current === null;
    current = r.id; clearTimers(); closeSide(false); closePops(); closeAll(); C.hideTip();
    markNav(); $("#crumbTitle").innerHTML = r.short ? `<span class="c-long">${esc(r.title)}</span><span class="c-short">${esc(r.short)}</span>` : esc(r.title); document.title = r.title + " · Logsco OS · Demo";
    main.innerHTML = skeleton(r.id); main.setAttribute("aria-busy", "true"); main.classList.remove("enter");
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (current !== r.id) return;
      main.innerHTML = ""; VIEWS[r.id](main); main.removeAttribute("aria-busy");
      void main.offsetWidth; main.classList.add("enter");
      if (!first) main.focus({ preventScroll: true });
      if (afterRender) { const f = afterRender; afterRender = null; f(); }
    }, first ? 220 : REDUCED ? 60 : 220);
  }
  function refreshBadges() { renderNav(); }
  /* re-render the current page in place after data changed elsewhere (drawer, palette, modal) */
  function refreshView() {
    if (!current || current === "pipeline" || current === "invoicing" || !main.firstElementChild || main.querySelector(".sk")) return;
    const y = window.scrollY; clearTimers(); main.innerHTML = ""; VIEWS[current](main); window.scrollTo(0, y);
  }

  /* table helper: sortable */
  function sortRows(rows, key, dir, get) { const g = get[key]; return rows.slice().sort((a, b) => { const x = g(a), y = g(b); return (x > y ? 1 : x < y ? -1 : 0) * (dir === "asc" ? 1 : -1); }); }
  const th = (label, key, sort, cls = "") => `<th class="${cls}" ${sort.key === key ? `aria-sort="${sort.dir === "asc" ? "ascending" : "descending"}"` : ""}><button type="button" data-sort="${key}">${label}${ic(sort.key === key ? "arrowUp" : "sortv")}</button></th>`;

  /* ================= VIEWS ================= */
  const VIEWS = {};

  /* ---------- Overview ---------- */
  VIEWS.overview = function (el) {
    const divs = UI.division === "all" ? L.DIV_ORDER : [UI.division];
    const deals = S.deals.filter((d) => inDiv(d.div));
    const pipe = deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").reduce((s, d) => s + d.value, 0);
    const won = deals.filter((d) => isWonRecent(d)).reduce((s, d) => s + d.value, 0);
    const openInv = S.invoices.filter((i) => inDiv(coDiv(i.co)) && ["sent", "overdue"].includes(invStatus(i)));
    const openInvSum = openInv.reduce((s, i) => s + invTotal(i), 0), overdueN = openInv.filter((i) => invStatus(i) === "overdue").length;
    /* leads = the same CRM lead sources as the chart below; meetings = the outbound sequences on Campaigns */
    const ex = divs.reduce((a, d) => { const k = L.KPI_PREV[d]; a.leads += Object.values(L.LEAD_SOURCES[d]).reduce((x, y) => x + y, 0); a.lp += k.leads; a.m += S.sequences.filter((q) => q.div === d).reduce((x, q) => x + q.meetings, 0); a.mp += k.meetings; return a; }, { leads: 0, lp: 0, m: 0, mp: 0 });
    const tix = divs.includes("agri") ? S.tickets.filter((t) => t.status !== "Resolved") : [];
    const p1 = tix.filter((t) => t.pri === "P1").length;
    const hour = new Date().getHours();
    const greet = hour < 5 ? "Hello" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const delta = (a, b) => { const d = b ? ((a - b) / b) * 100 : 0; return `<span class="delta ${d > 0.5 ? "up" : d < -0.5 ? "down" : "flat"}">${ic(d >= 0 ? "trendUp" : "trendDown", "sm")}${pct(Math.abs(d), 0)} <small>vs last month</small></span>`; };
    const sp = (base, seed) => { const out = []; let v = base * 0.7; for (let i = 0; i < 12; i++) { v = v * (0.94 + ((Math.sin(seed * 9 + i * 1.7) + 1) / 2) * 0.16); out.push(v); } out.push(base); return out; };
    const kpis = [
      { l: "Pipeline value", i: "pipeline", v: rmc(pipe), title: rm(pipe), d: delta(pipe, pipe / 1.12), s: sp(pipe, 1), go: "pipeline" },
      { l: "Won · 90 days", i: "target", v: rmc(won), title: rm(won), d: delta(won, won / 1.31), s: sp(won, 2), go: "pipeline" },
      { l: "Open invoices", i: "invoice", v: rmc(openInvSum), title: rm(openInvSum), d: `<span class="delta ${overdueN ? "down" : "flat"}">${overdueN} overdue</span>`, s: sp(openInvSum, 3), go: "invoicing" },
      { l: "New leads · 30 days", i: "globe", v: num(ex.leads), d: delta(ex.leads, ex.lp), s: sp(ex.leads, 4), go: "contacts" },
      { l: "Meetings booked", i: "send", v: num(ex.m), d: delta(ex.m, ex.mp), s: sp(ex.m, 5), go: "campaigns" },
      { l: "Open service tickets", i: "ticket", v: tix.length ? num(tix.length) : "0", d: tix.length ? `<span class="delta ${p1 ? "down" : "flat"}">${p1 ? p1 + " P1 open" : "No P1"} </span>` : `<span class="delta flat">AgriTech only</span>`, s: divs.includes("agri") ? [3, 5, 4, 6, 5, 7, 6, 4, 5, 6, 7, 6, tix.length] : new Array(13).fill(0), go: "service" }
    ];
    const sc = UI.division === "all" ? "var(--c-mag)" : DIVC[UI.division];
    const myTasks = S.tasks.filter((t) => inDiv(t.div));
    const todayIdx = (TODAY.getDay() + 6) % 7, monday = new Date(TODAY.getTime() - todayIdx * DAY);
    /* visits still running or starting later this week first, then next week's (same weekly rota) */
    const jobs = L.SCHEDULE.filter((e) => e.type !== "Leave");
    const visits = divs.includes("agri") ? jobs.filter((e) => e.day + e.len - 1 >= todayIdx).map((e) => Object.assign({}, e, { off: Math.max(e.day, todayIdx), on: e.day < todayIdx }))
      .concat(jobs.map((e) => Object.assign({}, e, { off: e.day + 7 }))).map((e) => Object.assign(e, { date: new Date(monday.getTime() + e.off * DAY).toISOString() })).sort((a, b) => a.off - b.off || a.tech.localeCompare(b.tech)).slice(0, 5) : [];
    const acts = L.ACTIVITY.filter((a) => inDiv(a.div));
    el.innerHTML = `
      <div class="page-head">
        <div><div class="eyebrow">${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div><h1>${greet}, Shafi</h1><p>Here is how Logsco is doing ${UI.division === "all" ? "across all three divisions" : "in " + esc(L.DIVS[UI.division].name)}.</p></div>
        <div class="actions"><div class="seg" role="group" aria-label="Division filter" id="divSeg">${[["all", "All"], ["agri", "AgriTech"], ["estates", "Estates"], ["bev", "Beverages"]].map(([k, l]) => `<button type="button" data-div="${k}" aria-pressed="${UI.division === k}">${k !== "all" ? `<i class="dv" style="background:var(--a-${k})"></i>` : ""}${l}</button>`).join("")}</div></div>
      </div>
      <div class="kpis">${kpis.map((k) => `<a class="card kpi" href="#/${k.go}" ${k.title ? `title="${k.title}"` : ""}><span class="kpi-l">${ic(k.i)}${k.l}</span><span class="kpi-v">${k.v}</span><span class="kpi-row">${k.d}${C.spark(k.s, sc, 72, 26)}</span></a>`).join("")}</div>
      <div class="grid g-main">
        <section class="card" aria-labelledby="revH"><div class="card-h"><div><h2 id="revH">Revenue by division</h2><span class="sub">Recognised revenue, last 6 months · total ${rm0(divs.reduce((s, d) => s + L.REVENUE[d].reduce((a, b) => a + b, 0), 0))}</span></div><div class="legend">${divs.map((d) => `<span><i style="background:${DIVC[d]}"></i>${L.DIVS[d].short}</span>`).join("")}</div></div><div class="card-b"><div class="chart-box" id="revChart"></div>${divs.includes("bev") ? `<p class="faint" style="font-size:12px;margin-top:6px">Beverages is pre-launch: sampling and event sales only until Batch 001 ships.</p>` : ""}</div></section>
        <section class="card" aria-labelledby="srcH"><div class="card-h"><div><h2 id="srcH">Leads by source</h2><span class="sub">Last 30 days · ${num(divs.reduce((s, d) => s + Object.values(L.LEAD_SOURCES[d]).reduce((a, b) => a + b, 0), 0))} leads</span></div><a class="link" href="#/analytics">Analytics ${ic("chev", "sm")}</a></div><div class="card-b"><div id="srcChart"></div></div></section>
      </div>
      <div class="grid g-3 mt">
        <section class="card" aria-labelledby="taskH"><div class="card-h"><h2 id="taskH">Today’s tasks</h2><span class="sub" id="taskCount"></span></div><div class="card-b flush"><div class="list" id="taskList"></div></div></section>
        <section class="card" aria-labelledby="visH"><div class="card-h"><h2 id="visH">Upcoming technician visits</h2><a class="link" href="#/staff">Schedule ${ic("chev", "sm")}</a></div><div class="card-b flush">${visits.length ? `<div class="list">${visits.map((v) => `<div class="li"><span class="date-tile"><small>${fday(v.date)}</small><b>${dt(v.date).getDate()}</b></span><div class="grow"><div class="t">${esc(CO[v.co].name)}</div><div class="s">${esc(v.text)} · ${esc(ST[v.tech].name)}${v.on ? " · in progress" : ""}</div></div><span class="ev-dot tag">${esc(v.type)}</span></div>`).join("")}</div>` : empty("wrench", "No technician visits", "Field visits are scheduled for AgriTech customers. Switch the filter to All or AgriTech.")}</div></section>
        <section class="card" aria-labelledby="actH"><div class="card-h"><h2 id="actH">Recent activity</h2><span class="sub">Live feed</span></div><div class="feed">${acts.length ? acts.slice(0, 6).map((a) => `<div class="feed-i"><span class="ic">${ic(a.icon === "deal" ? "target" : a.icon)}</span><div><p>${a.text}</p><small>${esc(a.who)} · ${relH(a.t)}</small></div></div>`).join("") : empty("clock", "Nothing yet", "Activity from this division will appear here.")}</div></section>
      </div>`;
    $$("#divSeg button", el).forEach((b) => b.addEventListener("click", () => { UI.division = b.dataset.div; saveUI(); VIEWS.overview(el); announce("Showing " + b.textContent.trim()); $(`#divSeg [data-div="${UI.division}"]`).focus(); }));
    C.bars($("#revChart", el), { labels: L.REVENUE.months, stacked: true, height: 250, label: "Revenue by division, last 6 months", rowHead: "Month", series: divs.map((d) => ({ name: L.DIVS[d].short, color: DIVC[d], values: L.REVENUE[d] })), format: rm, axis: rmc });
    const src = {}; divs.forEach((d) => Object.entries(L.LEAD_SOURCES[d]).forEach(([k, v]) => (src[k] = (src[k] || 0) + v)));
    C.hbars($("#srcChart", el), { items: Object.entries(src).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })), color: sc, format: (v) => num(v), unit: "Leads", label: "Leads by source, last 30 days", rowHead: "Source", rowH: 34, labelWidth: 118, valueWidth: 36 });
    function drawTasks() {
      const list = $("#taskList", el); const done = myTasks.filter((t) => t.done).length;
      $("#taskCount", el).textContent = `${done} of ${myTasks.length} done`;
      list.innerHTML = myTasks.length ? myTasks.map((t) => `<div class="li task" role="checkbox" tabindex="0" aria-checked="${t.done}" data-id="${t.id}"><span class="check">${ic("check")}</span><div class="grow"><div class="t">${nowrapIds(esc(t.text))}</div><div class="s">${divTag(t.div)}</div></div><span class="when">${esc(t.due)}</span></div>`).join("") : empty("check", "All clear", "No tasks for this division today.");
      $$(".task", list).forEach((row) => { const flip = () => { const t = S.tasks.find((x) => x.id === row.dataset.id); t.done = !t.done; save(); drawTasks(); $(`.task[data-id="${t.id}"]`, el).focus(); if (t.done) toast("Task done · " + esc(t.text)); }; row.addEventListener("click", flip); row.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } }); });
    }
    drawTasks();
  };

  /* ---------- Pipeline ---------- */
  const pf = { q: "", owner: "all", div: "all", sort: { key: "value", dir: "desc" } };
  VIEWS.pipeline = function (el) {
    const owners = [...new Set(S.deals.map((d) => d.owner))];
    el.innerHTML = `
      <div class="page-head"><div><h1>Pipeline</h1><p id="pipeSum"></p></div>
        <div class="actions"><div class="seg" role="group" aria-label="View"><button type="button" data-v="board" aria-pressed="${UI.pipeView === "board"}">${ic("kanban")}Board</button><button type="button" data-v="table" aria-pressed="${UI.pipeView === "table"}">${ic("table")}Table</button></div><button class="btn btn-p" id="newDeal">${ic("plus")}New deal</button></div></div>
      <div class="toolbar">
        <label class="search"><span class="sr-only">Search deals</span>${ic("search")}<input class="input" id="pq" type="search" placeholder="Search deals or companies" value="${esc(pf.q)}"></label>
        <label class="sr-only" for="po">Owner</label><select class="select" id="po"><option value="all">All owners</option>${owners.map((o) => `<option ${pf.owner === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>
        <label class="sr-only" for="pd">Division</label><select class="select" id="pd"><option value="all">All divisions</option>${L.DIV_ORDER.map((d) => `<option value="${d}" ${pf.div === d ? "selected" : ""}>${L.DIVS[d].short}</option>`).join("")}</select>
        <span class="grow"></span><span class="board-hint" id="hint">${ic("grip", "sm")}<span class="hint-mouse">Drag cards between stages · or focus a card and press Shift + ← →</span><span class="hint-touch">Long-press a card to drag it to another stage</span></span>
      </div>
      <div id="pipeBody"></div>`;
    const body = $("#pipeBody", el);
    const filtered = () => S.deals.filter((d) => (pf.owner === "all" || d.owner === pf.owner) && (pf.div === "all" || d.div === pf.div) && (!pf.q || (d.title + " " + CO[d.co].name).toLowerCase().includes(pf.q.toLowerCase())));
    function summary() {
      const f = filtered(), open = f.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
      const v = open.reduce((s, d) => s + d.value, 0), w = open.reduce((s, d) => s + d.value * L.PROB[d.stage] / 100, 0), won = f.filter((d) => isWonRecent(d)).reduce((s, d) => s + d.value, 0);
      $("#pipeSum", el).innerHTML = `<b class="tnum">${rm(v)}</b> open across ${open.length} deal${open.length === 1 ? "" : "s"} · weighted <b class="tnum">${rm(w)}</b> · won in the last ${WON_DAYS} days <b class="tnum">${rm(won)}</b>`;
    }
    function draw(focusId) {
      summary(); const f = filtered();
      $("#hint", el).style.display = UI.pipeView === "board" ? "" : "none";
      if (UI.pipeView === "table") return drawTable(f);
      const prev = $(".board", body); const sl = prev ? prev.scrollLeft : 0;
      body.innerHTML = `<div class="board-wrap"><div class="board" id="board" aria-label="Deals by stage">${L.STAGES.map((s) => {
        const ds = f.filter((d) => d.stage === s); const tot = ds.reduce((a, d) => a + d.value, 0);
        return `<section class="col" data-stage="${s}" aria-label="${s}, ${ds.length} deals"><div class="col-h"><div class="col-t"><i class="st" style="--sc:${STAGE_C[s]}"></i>${s}<span class="n">${ds.length}</span></div><div class="col-sum">${rm0(tot)} ${s !== "Won" && s !== "Lost" ? `<small>· ${L.PROB[s]}% prob.</small>` : ""}</div></div><div class="col-b">${ds.length ? ds.sort((a, b) => b.value - a.value).map(card).join("") : `<div class="col-empty">${f.length ? "Drop a deal here" : "No deals match"}</div>`}</div></section>`;
      }).join("")}</div></div>`;
      const board = $("#board", body); board.scrollLeft = sl;
      if (focusId) { const c = $(`.deal[data-id="${focusId}"]`, body); if (c) { c.classList.add("drop-in"); c.focus({ preventScroll: true }); c.scrollIntoView({ block: "nearest", inline: "nearest", behavior: REDUCED ? "auto" : "smooth" }); } }
      wireBoard(board);
    }
    const card = (d) => `<article class="deal" tabindex="0" data-id="${d.id}" aria-label="${esc(d.title)}, ${esc(CO[d.co].name)}, ${rm(d.value)}, stage ${d.stage}. Press Enter to open, Shift and arrow keys to move.">
      <div class="deal-top"><span class="deal-co">${esc(CO[d.co].name)}</span></div>
      <div class="deal-t">${esc(d.title)}</div>
      <div class="deal-top"><span class="deal-v">${rm(d.value)}</span>${divTag(d.div)}</div>
      <div class="deal-f"><span class="deal-next">${ic("flag")}<span>${esc(d.next)}</span></span>${av(d.owner)}</div></article>`;
    function drawTable(f) {
      const get = { title: (d) => d.title, co: (d) => CO[d.co].name, stage: (d) => L.STAGES.indexOf(d.stage), value: (d) => d.value, owner: (d) => d.owner, close: (d) => d.close };
      const rows = sortRows(f, pf.sort.key, pf.sort.dir, get);
      body.innerHTML = `<div class="card"><div class="tbl-wrap"><table class="tbl cards"><thead><tr>${th("Deal", "title", pf.sort)}${th("Stage", "stage", pf.sort)}${th("Value", "value", pf.sort, "r")}${th("Owner", "owner", pf.sort, "hide-m")}<th class="hide-l">Division</th>${th("Close date", "close", pf.sort)}<th class="hide-l">Next step</th></tr></thead><tbody>${rows.length ? rows.map((d) => `<tr class="click" tabindex="0" data-id="${d.id}"><td class="first" data-l="Deal"><div class="co">${lq(CO[d.co].name)}<div><b>${esc(d.title)}</b><small>${esc(CO[d.co].name)}</small></div></div></td><td data-l="Stage">${stageTag(d.stage)}</td><td class="r strong" data-l="Value">${rm(d.value)}</td><td data-l="Owner" class="hide-m"><span class="co">${av(d.owner)}<span>${esc(d.owner)}</span></span></td><td data-l="Division" class="hide-l">${divTag(d.div)}</td><td data-l="Close">${fdateY(d.close)}</td><td data-l="Next" class="muted wrap hide-l">${esc(d.next)}</td></tr>`).join("") : `<tr><td colspan="7">${empty("search", "No deals match", "Try a different search or clear the filters.")}</td></tr>`}</tbody></table></div><div class="tfoot"><span>${rows.length} deals</span><span class="tnum">Total ${rm(rows.reduce((s, d) => s + d.value, 0))}</span></div></div>`;
      $$("[data-sort]", body).forEach((b) => b.addEventListener("click", () => { const k = b.dataset.sort; pf.sort = { key: k, dir: pf.sort.key === k && pf.sort.dir === "desc" ? "asc" : "desc" }; drawTable(filtered()); $(`[data-sort="${k}"]`, body).focus(); }));
      $$("tr.click", body).forEach((tr) => { tr.addEventListener("click", () => openDeal(tr.dataset.id, draw)); tr.addEventListener("keydown", (e) => { if (e.key === "Enter") openDeal(tr.dataset.id, draw); }); });
    }
    function moveDeal(id, stage, undoable = true) {
      const d = S.deals.find((x) => x.id === id); if (!d || d.stage === stage) return;
      const undo = applyStage(d, stage);
      save(); draw(id); refreshBadges();
      announce(`${d.title} moved to ${stage}`);
      toast(`Moved <b>${esc(d.title)}</b> to ${esc(stage)}${stage === "Won" ? " · " + rm(d.value) + " added to won" : ""}`, { icon: stage === "Won" ? "target" : "check", action: undoable ? { label: "Undo", fn: () => { undo(); save(); if (current === "pipeline") draw(id); refreshBadges(); announce("Move undone"); } } : null });
    }
    S._moveDeal = moveDeal;
    function wireBoard(board) {
      $$(".deal", board).forEach((c) => {
        c.addEventListener("click", () => { if (justDragged) return; openDeal(c.dataset.id, draw); });
        c.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDeal(c.dataset.id, draw); }
          if (e.shiftKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); const d = S.deals.find((x) => x.id === c.dataset.id); const i = L.STAGES.indexOf(d.stage) + (e.key === "ArrowRight" ? 1 : -1); if (i >= 0 && i < L.STAGES.length) moveDeal(d.id, L.STAGES[i]); }
        });
      });
      board.addEventListener("pointerdown", startDrag);
    }
    /* pointer-based drag and drop (mouse: move 5px to start; touch/pen: long-press) */
    let justDragged = false, dragState = null;
    function startDrag(e) {
      const c = e.target.closest(".deal"); if (!c || e.button > 0) return;
      const st = { c, id: c.dataset.id, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, touch: e.pointerType !== "mouse", timer: null, ghost: null, over: null };
      dragState = st;
      if (st.touch) st.timer = setTimeout(() => begin(st), 320);
      window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); window.addEventListener("pointercancel", onCancel);
    }
    function begin(st) {
      st.on = true; const r = st.c.getBoundingClientRect();
      st.dx = st.x - r.left; st.dy = st.y - r.top;
      st.ghost = st.c.cloneNode(true); st.ghost.classList.add("ghost"); st.ghost.removeAttribute("tabindex"); st.ghost.style.width = r.width + "px";
      document.body.appendChild(st.ghost); st.c.classList.add("dragging"); DRAG_ON = true; position(st);
      const board = $("#board"); if (board) board.classList.add("is-dragging");
      /* keep auto-scrolling while the pointer rests near an edge (board sideways, page up/down) */
      const loop = () => {
        if (dragState !== st || !st.on) return;
        const bd = $("#board"); if (bd) { const br = bd.getBoundingClientRect(); const e = 64; const dx = st.x > br.right - e ? (st.x - (br.right - e)) / e : st.x < br.left + e ? -((br.left + e) - st.x) / e : 0; if (dx) { bd.scrollLeft += Math.round(dx * 18); position(st, true); } }
        const vh = window.innerHeight, ve = 72, bottomBar = window.innerWidth <= 860 ? 70 : 0; const dy = st.y > vh - bottomBar - ve ? 1 : st.y < ve + 60 ? -1 : 0; if (dy) { window.scrollBy(0, dy * 10); position(st, true); }
        st.raf = requestAnimationFrame(loop);
      };
      st.raf = requestAnimationFrame(loop);
      if (navigator.vibrate && st.touch) try { navigator.vibrate(12); } catch (e) { /* ignore */ }
    }
    function position(st) {
      st.ghost.style.left = st.x - st.dx + "px"; st.ghost.style.top = st.y - st.dy + "px";
      const under = document.elementFromPoint(st.x, st.y); let col = under && under.closest(".col");
      if (!col) { /* in a gutter or between columns: use the nearest visible column at this height */
        const bd = $("#board"), br = bd && bd.getBoundingClientRect();
        if (br && st.y >= br.top && st.y <= br.bottom) { let best = null, bd0 = 1e9; $$(".col", bd).forEach((c) => { const r = c.getBoundingClientRect(); if (r.right < br.left || r.left > br.right) return; const dist = st.x < r.left ? r.left - st.x : st.x > r.right ? st.x - r.right : 0; if (dist < bd0) { bd0 = dist; best = c; } }); if (bd0 < 40) col = best; }
      }
      if (st.over && st.over !== col) st.over.classList.remove("over");
      if (col) col.classList.add("over"); st.over = col;
    }
    function onMove(e) {
      const st = dragState; if (!st) return; st.x = e.clientX; st.y = e.clientY;
      if (!st.on) { const dist = Math.hypot(st.x - st.x0, st.y - st.y0); if (st.touch) { if (dist > 8) onCancel(); return; } if (dist > 5) begin(st); else return; }
      e.preventDefault(); position(st);
    }
    function end() { const st = dragState; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); window.removeEventListener("pointercancel", onCancel); if (!st) return; clearTimeout(st.timer); cancelAnimationFrame(st.raf); const bd = $("#board"); if (bd) bd.classList.remove("is-dragging"); if (st.ghost) st.ghost.remove(); st.c.classList.remove("dragging"); if (st.over) st.over.classList.remove("over"); dragState = null; DRAG_ON = false; return st; }
    function onUp() { const st = end(); if (st && st.on) { justDragged = true; setTimeout(() => (justDragged = false), 50); if (st.over) moveDeal(st.id, st.over.dataset.stage); } }
    function onCancel() { end(); }

    $$("[data-v]", el).forEach((b) => b.addEventListener("click", () => { UI.pipeView = b.dataset.v; saveUI(); $$("[data-v]", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); }));
    $("#pq", el).addEventListener("input", (e) => { pf.q = e.target.value; draw(); });
    $("#po", el).addEventListener("change", (e) => { pf.owner = e.target.value; draw(); });
    $("#pd", el).addEventListener("change", (e) => { pf.div = e.target.value; draw(); });
    $("#newDeal", el).addEventListener("click", () => newDealModal(() => draw()));
    S._redrawPipe = draw;
    draw();
  };

  /* change a deal's stage; closing it (won / lost) dates it today. Returns an undo function. */
  function applyStage(d, stage) {
    const from = d.stage, close = d.close;
    d.stage = stage; d.timeline.push({ t: new Date().toISOString(), kind: "stage", text: stage === "Won" ? "Marked as won" : stage === "Lost" ? "Marked as lost" : `Moved from ${from} to ${stage}` });
    if ((stage === "Won" || stage === "Lost") && from !== stage) d.close = TODAY.toISOString();
    return () => { d.stage = from; d.close = close; d.timeline.pop(); };
  }
  function openDeal(id, redraw) {
    const d = S.deals.find((x) => x.id === id); if (!d) return; const co = CO[d.co];
    const kindIcon = { create: "plus", call: "phone", email: "mail", stage: "arrowR", note: "note" };
    const tl = () => d.timeline.slice().reverse().map((t, i) => `<div class="tl-i ${i === 0 && t.fresh ? "new" : ""}"><span class="ic">${ic(kindIcon[t.kind] || "note")}</span><div><p>${esc(t.text)}</p><small>${fdateY(t.t)} · ${rel(t.t)}</small></div></div>`).join("");
    const lay = openLayer("drawer", drawerShell({
      lead: lq(co.name), title: esc(d.title), sub: `${esc(co.name)} · ${esc(co.state)}`,
      body: `<dl class="kv"><div><dt>Value</dt><dd class="tnum">${rm(d.value)}</dd></div><div><dt>Weighted</dt><dd class="tnum" id="dw">${rm(d.value * L.PROB[d.stage] / 100)}</dd></div>
        <div><dt><label for="dst">Stage</label></dt><dd><select class="select" id="dst" style="width:100%">${L.STAGES.map((s) => `<option ${s === d.stage ? "selected" : ""}>${s}</option>`).join("")}</select></dd></div><div><dt>Probability</dt><dd id="dp">${L.PROB[d.stage]}%</dd></div>
        <div><dt>Owner</dt><dd><span class="co" style="display:flex;gap:8px;align-items:center">${av(d.owner)}${esc(d.owner)}</span></dd></div><div><dt id="dclose-l">${d.stage === "Won" ? "Won on" : d.stage === "Lost" ? "Lost on" : "Expected close"}</dt><dd id="dclose">${fdateY(d.close)}</dd></div>
        <div><dt>Division</dt><dd>${divTag(d.div)}</dd></div><div><dt>Contact</dt><dd>${esc(co.contact)} · ${esc(co.title)}</dd></div></dl>
        <div class="card" style="padding:12px 14px;display:flex;gap:10px;align-items:flex-start">${ic("flag")}<div><b style="font-size:13px">Next step</b><p class="muted" style="font-size:13.5px">${esc(d.next)}</p></div></div>
        <div class="sec-h">Timeline</div><div class="note-box"><label class="sr-only" for="dnote">Add a note</label><input class="input" id="dnote" placeholder="Log a call, note or next step…"><button class="btn btn-s" id="dadd">Add</button></div><div class="tl mt" id="dtl">${tl()}</div>`,
      foot: `<button class="btn btn-g" data-close>Close</button><button class="btn btn-s" id="dinv">${ic("invoice")}Create invoice</button>${d.stage !== "Won" ? `<button class="btn btn-p" id="dwon">${ic("target")}Mark as won</button>` : ""}`
    }), { label: "Deal details" });
    const p = lay.panel;
    const setStage = (s) => { if (S._moveDeal && current === "pipeline") S._moveDeal(d.id, s); else { const undo = applyStage(d, s); save(); refreshBadges(); refreshView(); toast(`Moved <b>${esc(d.title)}</b> to ${esc(s)}`, { action: { label: "Undo", fn: () => { undo(); save(); refreshBadges(); refreshView(); } } }); } if (!document.contains(p)) return; $("#dp", p).textContent = L.PROB[s] + "%"; $("#dw", p).textContent = rm(d.value * L.PROB[s] / 100); $("#dtl", p).innerHTML = tl(); $("#dclose", p).textContent = fdateY(d.close); $("#dclose-l", p).textContent = d.stage === "Won" ? "Won on" : d.stage === "Lost" ? "Lost on" : "Expected close"; };
    $("#dst", p).addEventListener("change", (e) => setStage(e.target.value));
    const add = () => { const v = $("#dnote", p).value.trim(); if (!v) return; d.timeline.push({ t: new Date().toISOString(), kind: "note", text: v, fresh: true }); save(); $("#dnote", p).value = ""; $("#dtl", p).innerHTML = tl(); toast("Note added to timeline", { icon: "note" }); };
    $("#dadd", p).addEventListener("click", add); $("#dnote", p).addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    $("#dinv", p).addEventListener("click", () => { lay.close(); setTimeout(() => newInvoiceModal({ co: d.co, lines: [{ desc: d.title + ", deposit (30%)", qty: 1, price: Math.round(d.value * 0.3) }] }), 200); });
    const w = $("#dwon", p); if (w) w.addEventListener("click", () => { lay.close(); setStage("Won"); });
  }

  function newDealModal(done) {
    const lay = openLayer("modal", drawerShell({
      title: "New deal", sub: "Adds a card to the Lead column.",
      body: `<div class="form-grid" style="grid-template-columns:1fr 1fr"><div class="field" style="grid-column:1/-1"><label for="nd-t">Deal / product</label><input class="input" id="nd-t" placeholder="e.g. Pineapple grading line 7 MT/hr" autofocus></div>
        <div class="field"><label for="nd-c">Company</label><select class="select" id="nd-c">${L.COMPANIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>
        <div class="field"><label for="nd-v">Value (RM)</label><input class="input" id="nd-v" type="number" min="0" step="100" value="250000"></div>
        <div class="field"><label for="nd-o">Owner</label><select class="select" id="nd-o">${["Shafi", "Nurul Aina", "Azlan", "K'Mar"].map((o) => `<option>${esc(o)}</option>`).join("")}</select></div>
        <div class="field"><label for="nd-n">Next step</label><input class="input" id="nd-n" value="Discovery call"></div></div>`,
      foot: `<button class="btn btn-g" data-close>Cancel</button><button class="btn btn-p" id="nd-save">${ic("plus")}Create deal</button>`
    }), { cls: "sm", label: "New deal" });
    const p = lay.panel;
    $("#nd-save", p).addEventListener("click", () => {
      const t = $("#nd-t", p).value.trim(); if (!t) { $("#nd-t", p).focus(); $("#nd-t", p).style.borderColor = "var(--crit)"; return; }
      const co = $("#nd-c", p).value; const d = { id: uid("d"), co, title: t, value: +$("#nd-v", p).value || 0, stage: "Lead", owner: $("#nd-o", p).value, div: CO[co].div, next: $("#nd-n", p).value, close: new Date(TODAY.getTime() + 60 * DAY).toISOString(), created: new Date().toISOString(), timeline: [{ t: new Date().toISOString(), kind: "create", text: "Deal created in Logsco OS" }] };
      S.deals.push(d); save(); lay.close(); refreshBadges(); toast(`Deal <b>${esc(t)}</b> created`); if (done) done(d); else go("pipeline");
    });
  }

  /* ---------- Contacts ---------- */
  const cf = { q: "", type: "all", state: "all", owner: "all", sort: { key: "last", dir: "desc" } };
  VIEWS.contacts = function (el) {
    const types = [...new Set(L.COMPANIES.map((c) => c.type))].sort(), states = [...new Set(L.COMPANIES.map((c) => c.state))].sort(), owners = [...new Set(L.COMPANIES.map((c) => c.owner))];
    el.innerHTML = `<div class="page-head"><div><h1>Contacts & companies</h1><p>${L.COMPANIES.length} companies across estates, plantations, CPPCs, agencies, retailers and distributors.</p></div><div class="actions"><button class="btn btn-s" id="cExport">${ic("file")}Export CSV</button><button class="btn btn-p" id="cNew">${ic("plus")}Add company</button></div></div>
      <div class="toolbar"><label class="search"><span class="sr-only">Search contacts</span>${ic("search")}<input class="input" id="cq" type="search" placeholder="Search company, contact or email" value="${esc(cf.q)}"></label>
        <label class="sr-only" for="ct">Type</label><select class="select" id="ct"><option value="all">All types</option>${types.map((t) => `<option ${cf.type === t ? "selected" : ""}>${t}</option>`).join("")}</select>
        <label class="sr-only" for="cs">State</label><select class="select" id="cs"><option value="all">All states</option>${states.map((t) => `<option ${cf.state === t ? "selected" : ""}>${t}</option>`).join("")}</select>
        <label class="sr-only" for="cow">Owner</label><select class="select" id="cow"><option value="all">All owners</option>${owners.map((t) => `<option ${cf.owner === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
        <button class="btn btn-g btn-sm" id="cClear">Clear</button></div>
      <div class="card" id="cBody"></div>`;
    const get = { name: (c) => c.name, contact: (c) => c.contact, type: (c) => c.type, state: (c) => c.state, owner: (c) => c.owner, last: (c) => c.last, ltv: (c) => ltvOf(c) };
    function draw() {
      const q = cf.q.toLowerCase();
      const rows = sortRows(L.COMPANIES.filter((c) => (cf.type === "all" || c.type === cf.type) && (cf.state === "all" || c.state === cf.state) && (cf.owner === "all" || c.owner === cf.owner) && (!q || (c.name + c.contact + c.email).toLowerCase().includes(q))), cf.sort.key, cf.sort.dir, get);
      $("#cBody", el).innerHTML = `<div class="tbl-wrap"><table class="tbl cards"><thead><tr>${th("Company", "name", cf.sort)}${th("Contact", "contact", cf.sort)}${th("Type", "type", cf.sort, "hide-l")}${th("State", "state", cf.sort, "hide-l")}${th("Owner", "owner", cf.sort, "hide-m")}${th("Last activity", "last", cf.sort)}${th("Lifetime value", "ltv", cf.sort, "r")}</tr></thead><tbody>${rows.length ? rows.map((c) => `<tr class="click" tabindex="0" data-id="${c.id}"><td class="first" data-l="Company"><div class="co">${lq(c.name)}<div><b>${esc(c.name)}</b><small>${divTag(c.div)}</small></div></div></td><td data-l="Contact"><div style="text-align:inherit"><b style="font-weight:600">${esc(c.contact)}</b><div class="faint" style="font-size:12px">${esc(c.title)}</div></div></td><td data-l="Type" class="hide-l"><span class="tag">${esc(c.type)}</span></td><td data-l="State" class="hide-l">${esc(c.state)}</td><td data-l="Owner" class="hide-m"><span class="co">${av(c.owner)}<span>${esc(c.owner)}</span></span></td><td data-l="Last activity" class="muted">${rel(c.last)}</td><td class="r strong" data-l="Lifetime value">${ltvOf(c) ? rm(ltvOf(c)) : '<span class="faint">—</span><span class="sr-only">none yet</span>'}</td></tr>`).join("") : `<tr><td colspan="7">${empty("search", "No companies match", "Try another search term or clear the filters.")}</td></tr>`}</tbody></table></div><div class="tfoot"><span>${rows.length} of ${L.COMPANIES.length} companies</span><span class="tnum">Lifetime value ${rm(rows.reduce((s, c) => s + ltvOf(c), 0))}</span></div>`;
      $$("[data-sort]", el).forEach((b) => b.addEventListener("click", () => { const k = b.dataset.sort; cf.sort = { key: k, dir: cf.sort.key === k && cf.sort.dir === "desc" ? "asc" : "desc" }; draw(); $(`[data-sort="${k}"]`, el).focus(); }));
      $$("tr.click", el).forEach((tr) => { tr.addEventListener("click", () => openCompany(tr.dataset.id)); tr.addEventListener("keydown", (e) => { if (e.key === "Enter") openCompany(tr.dataset.id); }); });
    }
    $("#cq", el).addEventListener("input", (e) => { cf.q = e.target.value; draw(); });
    [["#ct", "type"], ["#cs", "state"], ["#cow", "owner"]].forEach(([s, k]) => $(s, el).addEventListener("change", (e) => { cf[k] = e.target.value; draw(); }));
    $("#cClear", el).addEventListener("click", () => { Object.assign(cf, { q: "", type: "all", state: "all", owner: "all" }); VIEWS.contacts(el); });
    $("#cExport", el).addEventListener("click", () => toast("CSV export prepared (demo · no file is created)", { icon: "file" }));
    $("#cNew", el).addEventListener("click", () => toast("Add company form opens here in the full build", { icon: "building" }));
    draw();
  };
  function openCompany(id, tab = "notes") {
    const c = CO[id]; if (!c) return;
    if (!S.notes[id]) S.notes[id] = [{ t: c.last, by: c.owner, text: `Spoke with ${c.contact.split(" ")[0]} about ${c.div === "agri" ? "post-harvest capacity for next season" : c.div === "bev" ? "Batch 001 launch volumes and chiller space" : "group bookings for the school holidays"}.` }, { t: new Date(TODAY.getTime() - 20 * DAY).toISOString(), by: c.owner, text: "First contact. Added to CRM from enquiry form." }];
    const deals = S.deals.filter((d) => d.co === id), invs = S.invoices.filter((i) => i.co === id);
    const emails = [["Re: Quotation and layout drawing", -1, "in"], ["Brochure: " + (c.div === "agri" ? "Reemoon grading lines" : c.div === "bev" ? "Pina Boosta stockist pack" : "Estate tour packages"), -6, "out"], ["Introduction from Logsco Agri Technology", -19, "out"]];
    const lay = openLayer("drawer", drawerShell({
      lead: lq(c.name), title: esc(c.name), sub: `${esc(c.type)} · ${esc(c.state)} · Owner ${esc(c.owner)}`,
      body: `<div class="card" style="padding:12px 14px;display:flex;gap:12px;align-items:center;margin-bottom:14px;flex-wrap:wrap">${av(c.contact, "lg")}<div style="flex:1;min-width:160px"><b>${esc(c.contact)}</b><div class="faint" style="font-size:12.5px">${esc(c.title)} · ${esc(c.email)}</div></div><div style="display:flex;gap:6px"><button class="btn btn-s btn-sm" data-demo="Email draft opened (demo)">${ic("mail")}Email</button><button class="btn btn-s btn-sm" data-demo="WhatsApp chat opened (demo)">${ic("chat")}WhatsApp</button><button class="btn btn-s btn-sm" data-demo="Calling ${esc(c.phone)} (demo)">${ic("phone")}Call</button></div></div>
        <dl class="kv"><div><dt>Lifetime value</dt><dd class="tnum">${ltvOf(c) ? rm(ltvOf(c)) : "—"}</dd></div><div><dt>Open deals</dt><dd class="tnum">${deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length} · ${rm0(deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").reduce((s, d) => s + d.value, 0))}</dd></div><div><dt>Phone</dt><dd>${esc(c.phone)}</dd></div><div><dt>Last activity</dt><dd>${rel(c.last)}</dd></div></dl>
        <div class="tabs" role="tablist" aria-label="Company records">${[["notes", "Notes", S.notes[id].length], ["deals", "Deals", deals.length], ["invoices", "Invoices", invs.length], ["emails", "Emails", emails.length]].map(([k, l, n]) => `<button role="tab" type="button" id="ct-${k}" aria-controls="cp" aria-selected="${k === tab}" data-tab="${k}">${l}<span class="n">${n}</span></button>`).join("")}</div><div id="cp" role="tabpanel"></div>`,
      foot: `<button class="btn btn-g" data-close>Close</button><button class="btn btn-s" id="cInv">${ic("invoice")}New invoice</button><button class="btn btn-p" id="cDeal">${ic("plus")}New deal</button>`
    }), { label: "Company details" });
    const p = lay.panel;
    function show(k) {
      tab = k; $$("[data-tab]", p).forEach((b) => { b.setAttribute("aria-selected", String(b.dataset.tab === k)); b.tabIndex = b.dataset.tab === k ? 0 : -1; }); $("#cp", p).setAttribute("aria-labelledby", "ct-" + k);
      const box = $("#cp", p);
      if (k === "notes") {
        box.innerHTML = `<div class="note-box" style="margin:0 0 10px"><label class="sr-only" for="cn">New note</label><input class="input" id="cn" placeholder="Write a note…"><button class="btn btn-s" id="cna">Add note</button></div><div class="tl">${S.notes[id].map((n, i) => `<div class="tl-i ${n.fresh && i === 0 ? "new" : ""}"><span class="ic">${ic("note")}</span><div><p>${esc(n.text)}</p><small>${esc(n.by)} · ${rel(n.t)}</small></div></div>`).join("")}</div>`;
        const add = () => { const v = $("#cn", p).value.trim(); if (!v) return; S.notes[id].unshift({ t: new Date().toISOString(), by: "Shafi", text: v, fresh: true }); save(); show("notes"); $(".tabs [data-tab=notes] .n", p).textContent = S.notes[id].length; toast("Note saved", { icon: "note" }); };
        $("#cna", p).addEventListener("click", add); $("#cn", p).addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
      } else if (k === "deals") {
        box.innerHTML = deals.length ? `<div class="list card">${deals.map((d) => `<button class="li" data-deal="${d.id}"><div class="grow"><div class="t">${esc(d.title)}</div><div class="s">${rel(d.close)} · ${esc(d.owner)}</div></div>${stageTag(d.stage)}<b class="tnum">${rm0(d.value)}</b></button>`).join("")}</div>` : empty("pipeline", "No deals yet", "Create the first deal for this company.");
        $$("[data-deal]", box).forEach((b) => b.addEventListener("click", () => { lay.close(); setTimeout(() => openDeal(b.dataset.deal), 200); }));
      } else if (k === "invoices") {
        box.innerHTML = invs.length ? `<div class="list card">${invs.map((i) => `<button class="li" data-inv="${i.id}"><div class="grow"><div class="t mono">${esc(i.id)}</div><div class="s">Issued ${fdateY(i.issued)} · due ${fdate(i.due)}</div></div>${invPill(i)}<b class="tnum">${rm(invTotal(i))}</b></button>`).join("")}</div>` : empty("invoice", "No invoices", "Invoices for this company will show here.");
        $$("[data-inv]", box).forEach((b) => b.addEventListener("click", () => { lay.close(); setTimeout(() => openInvoice(b.dataset.inv), 200); }));
      } else {
        box.innerHTML = `<div class="list card">${emails.map(([s, d, dir]) => `<div class="li"><span class="ic" style="width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:var(--surface-2)">${ic(dir === "in" ? "mail" : "send", "sm")}</span><div class="grow"><div class="t">${esc(s)}</div><div class="s">${dir === "in" ? "From " + esc(c.contact) : "To " + esc(c.contact)} · synced from Google Workspace</div></div><span class="when">${rel(new Date(TODAY.getTime() + d * DAY).toISOString())}</span></div>`).join("")}</div>`;
      }
    }
    $$("[data-tab]", p).forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
    $(".tabs", p).addEventListener("keydown", (e) => { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; const bs = $$("[data-tab]", p); const i = bs.findIndex((b) => b.dataset.tab === tab); const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); show(n.dataset.tab); });
    $$("[data-demo]", p).forEach((b) => b.addEventListener("click", () => toast(b.dataset.demo, { icon: "send" })));
    $("#cInv", p).addEventListener("click", () => { lay.close(); setTimeout(() => newInvoiceModal({ co: id }), 200); });
    $("#cDeal", p).addEventListener("click", () => { lay.close(); setTimeout(() => { newDealModal(); setTimeout(() => { const s = $("#nd-c"); if (s) s.value = id; }, 60); }, 200); });
    show(tab);
  }

  /* ---------- Staff ---------- */
  const STATUS_L = { office: "In office", site: "On site", leave: "On leave" };
  const STATUS_C = { office: "good", site: "info", leave: "warn" };
  VIEWS.staff = function (el) {
    const todayIdx = (TODAY.getDay() + 6) % 7, monday = new Date(TODAY.getTime() - todayIdx * DAY);
    const days = [0, 1, 2, 3, 4, 5].map((i) => new Date(monday.getTime() + i * DAY));
    function counts() { const c = { office: 0, site: 0, leave: 0 }; Object.values(S.staffStatus).forEach((s) => c[s]++); return c; }
    function head() { const c = counts(); return `<div class="stat-row">${[["In office", c.office, "Masai HQ"], ["On site", c.site, "Customers & estate"], ["On leave", c.leave, "Today"], ["Leave requests", S.leave.filter((l) => l.status === "pending").length, "Waiting for approval"]].map(([l, v, s]) => `<div class="card stat"><small>${l}</small><b>${v}</b><em>${s}</em></div>`).join("")}</div>`; }
    el.innerHTML = `<div class="page-head"><div><h1>Staff</h1><p>${L.STAFF.length} people · Director, sales, finance, operations, three division heads and the technician team.</p></div><div class="actions"><button class="btn btn-s" id="sExport">${ic("calendar")}Sync to Google Calendar</button></div></div>
      <div id="sHead">${head()}</div>
      <section class="card" aria-labelledby="schH"><div class="card-h"><div><h2 id="schH">Technician field schedule</h2><span class="sub">Week of ${fdateY(monday.toISOString())} · installations, commissioning, service and training</span></div><div class="legend">${["Installation", "Commissioning", "Service", "Training", "Leave"].map((t) => `<span><i class="ev ${t}" style="position:static;width:12px;height:12px;padding:0;border-radius:3px"></i>${t}</span>`).join("")}</div></div>
        <div class="card-b" style="overflow-x:auto"><div class="week" role="table" aria-label="Technician schedule this week">
          <div class="week-r" role="row"><div class="week-h" role="columnheader">Technician</div>${days.map((d, i) => `<div class="week-h ${i === todayIdx ? "today" : ""}" role="columnheader" ${i === todayIdx ? 'aria-current="date"' : ""}>${d.toLocaleDateString("en-GB", { weekday: "short" })}<b>${d.getDate()}</b></div>`).join("")}</div>
          ${L.STAFF.filter((s) => s.tech).map((t) => `<div class="week-r" role="row"><div class="week-n" role="rowheader">${av(t.name)}<span>${esc(t.name)}</span></div>${days.map((d, i) => { const ev = L.SCHEDULE.find((e) => e.tech === t.id && e.day === i); return `<div class="week-c ${i === todayIdx ? "today" : ""}" role="cell">${ev ? `<button class="ev ${ev.type}" style="width:calc(${ev.len * 100}% + ${ev.len - 1}px - 10px)" data-ev="${L.SCHEDULE.indexOf(ev)}"><b>${esc(ev.co ? CO[ev.co].name : ev.text)}</b><span>${ev.type === "Leave" ? "Approved · whole week" : esc(ev.type) + (ev.co ? " · " + esc(ev.text) : "")}</span></button>` : ""}</div>`; }).join("")}</div>`).join("")}
        </div></div></section>
      <div class="grid g-main mt">
        <section class="card" aria-labelledby="dirH"><div class="card-h"><h2 id="dirH">Team directory</h2><span class="sub">Change a status to update the board</span></div><div class="card-b"><div class="people">${L.STAFF.map((s) => `<div class="card person"><div class="person-top">${av(s.name, "lg")}<div style="min-width:0"><b>${esc(s.name)}</b><small>${esc(s.role)}</small></div></div><div class="person-row">${divTag(s.div)}<label class="sr-only" for="ss-${s.id}">Status for ${esc(s.name)}</label><select class="select status-sel" id="ss-${s.id}" data-sid="${s.id}">${Object.entries(STATUS_L).map(([k, l]) => `<option value="${k}" ${S.staffStatus[s.id] === k ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>`).join("")}</div></div></section>
        <div class="stack">
          <section class="card" aria-labelledby="lvH"><div class="card-h"><h2 id="lvH">Leave requests</h2><span class="sub" id="lvSub"></span></div><div id="lvList"></div></section>
          <section class="card" aria-labelledby="wlH"><div class="card-h"><h2 id="wlH">Workload this week</h2><span class="sub">Hours booked vs capacity</span></div><div class="card-b flush" style="padding:8px 0 12px">${L.STAFF.filter((s) => s.tech || s.id === "u9" || s.id === "u6" || s.id === "u2").sort((a, b) => b.load - a.load).map((s) => `<div class="load-row"><span>${esc(s.name)}</span><div class="bar lg ${s.load >= 90 ? "crit" : s.load >= 80 ? "warn" : ""}" role="progressbar" aria-valuenow="${s.load}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(s.name)} workload"><i style="width:${s.load}%"></i></div><em>${s.load}%</em></div>`).join("")}<p class="faint note-i" style="font-size:12px;padding:6px 16px 0">${ic("alert", "sm")}<span>90% and above is flagged as over capacity.</span></p></div></section>
        </div>
      </div>`;
    function drawLeave() {
      $("#lvSub", el).textContent = S.leave.filter((l) => l.status === "pending").length + " pending";
      $("#lvList", el).innerHTML = S.leave.map((l) => { const p = ST[l.who]; return `<div class="leave">${av(p.name)}<div class="grow"><div class="t">${esc(p.name)} · ${esc(l.type)}</div><div class="s">${fdate(l.from)}${l.days > 1 ? " – " + fdate(l.to) : ""} · ${l.days} day${l.days > 1 ? "s" : ""} · ${esc(l.reason)}</div></div>${l.status === "pending" ? `<div style="display:flex;gap:6px"><button class="btn btn-d btn-sm" data-lv="${l.id}" data-a="declined">Decline</button><button class="btn btn-ok btn-sm" data-lv="${l.id}" data-a="approved">${ic("check")}Approve</button></div>` : `<span class="pill ${l.status === "approved" ? "good" : "crit"}">${l.status === "approved" ? "Approved" : "Declined"}</span>`}</div>`; }).join("");
      $$("[data-lv]", el).forEach((b) => b.addEventListener("click", () => {
        const l = S.leave.find((x) => x.id === b.dataset.lv); l.status = b.dataset.a; save(); drawLeave(); refreshBadges(); $("#sHead", el).innerHTML = head();
        toast(`${esc(ST[l.who].name)}’s leave ${l.status}`, { icon: l.status === "approved" ? "check" : "x", action: { label: "Undo", fn: () => { l.status = "pending"; save(); drawLeave(); refreshBadges(); $("#sHead", el).innerHTML = head(); } } });
        const nx = $("[data-lv]", el); if (nx) nx.focus();
      }));
    }
    drawLeave();
    $$("[data-sid]", el).forEach((s) => s.addEventListener("change", () => { S.staffStatus[s.dataset.sid] = s.value; save(); $("#sHead", el).innerHTML = head(); toast(`${esc(ST[s.dataset.sid].name)} is now ${STATUS_L[s.value].toLowerCase()}`); }));
    $$("[data-ev]", el).forEach((b) => b.addEventListener("click", () => { const e = L.SCHEDULE[+b.dataset.ev]; const t = ST[e.tech]; const d0 = days[e.day]; openLayer("modal", drawerShell({ title: esc(e.type) + (e.co ? " · " + esc(CO[e.co].name) : ""), sub: esc(e.text), body: `<dl class="kv"><div><dt>Technician</dt><dd>${esc(t.name)}</dd></div><div><dt>When</dt><dd>${d0.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}${e.len > 1 ? " · " + e.len + " days" : ""}</dd></div><div><dt>Customer</dt><dd>${e.co ? esc(CO[e.co].name) : "—"}</dd></div><div><dt>Location</dt><dd>${e.co ? esc(CO[e.co].state) : "—"}</dd></div></dl><p class="muted">Job sheet, photos and customer sign-off are captured on the technician's phone in the full build.</p>`, foot: `<button class="btn btn-g" data-close>Close</button><button class="btn btn-p" data-close>${ic("chat")}Message ${esc(t.name.split(" ")[0])}</button>` }), { cls: "sm", label: "Visit details" }); }));
    $("#sExport", el).addEventListener("click", () => toast("Schedule synced to Google Calendar (demo)", { icon: "calendar" }));
  };

  /* ---------- Service & spare parts ---------- */
  function slaText(t) {
    if (t.status === "Resolved") return `<span class="sla done">${ic("check")}SLA met</span>`;
    const ms = t.deadline - Date.now(); const a = Math.abs(ms); const h = Math.floor(a / 36e5), m = Math.floor((a % 36e5) / 6e4), s = Math.floor((a % 6e4) / 1e3);
    const str = `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    if (ms < 0) return `<span class="sla crit">${ic("alert")}Breached ${str}</span>`;
    return `<span class="sla ${ms < t.sla * 36e5 * 0.3 ? "warn" : "ok"}">${ic("clock")}${str} left</span>`;
  }
  VIEWS.service = function (el) {
    const techs = L.STAFF.filter((s) => s.tech);
    function stats() {
      const open = S.tickets.filter((t) => t.status !== "Resolved");
      const late = S.parts.filter((p) => p.step < 4 && -p.ordered > p.target).length;
      return `<div class="stat-row">${[["Open tickets", open.length, open.filter((t) => t.pri === "P1").length + " P1 · 24/7 hotline"], ["Avg first response", "38 min", "Target under 1 hour"], ["Parts on time", pct(((S.parts.length - late) / S.parts.length) * 100, 0), "3–5 day target"], ["Commissioning", S.commissioning.length + " live", "2-month programmes"]].map(([l, v, s]) => `<div class="card stat"><small>${l}</small><b>${v}</b><em>${s}</em></div>`).join("")}</div>`;
    }
    el.innerHTML = `<div class="page-head"><div><div class="eyebrow">${divTag("agri")}</div><h1>Service & spare parts</h1><p>24/7 support, 3–5 day spare parts and 2-month commissioning for AgriTech customers.</p></div><div class="actions"><button class="btn btn-p" id="tNew">${ic("plus")}New ticket</button></div></div>
      <div id="svStats">${stats()}</div>
      <div class="tabs" role="tablist" aria-label="Service sections">${[["tickets", "Support tickets", "Tickets", S.tickets.filter((t) => t.status !== "Resolved").length], ["parts", "Spare-parts orders", "Parts", S.parts.filter((p) => p.step < 4).length], ["comm", "Commissioning", "Commissioning", S.commissioning.length]].map(([k, l, sh, n]) => `<button type="button" role="tab" id="svt-${k}" aria-controls="svp" aria-selected="${UI.svcTab === k}" tabindex="${UI.svcTab === k ? 0 : -1}" data-t="${k}"><span class="c-long">${l}</span><span class="c-short">${sh}</span><span class="n">${n}</span></button>`).join("")}</div>
      <div id="svp" role="tabpanel"></div>`;
    const box = $("#svp", el);
    function draw() {
      clearTimers();
      const cnt = { tickets: S.tickets.filter((t) => t.status !== "Resolved").length, parts: S.parts.filter((p) => p.step < 4).length, comm: S.commissioning.length };
      $$("[data-t]", el).forEach((b) => { const on = b.dataset.t === UI.svcTab; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; b.querySelector(".n").textContent = cnt[b.dataset.t]; }); box.setAttribute("aria-labelledby", "svt-" + UI.svcTab);
      if (UI.svcTab === "tickets") {
        const rows = S.tickets.slice().sort((a, b) => (a.status === "Resolved") - (b.status === "Resolved") || a.pri.localeCompare(b.pri) || a.deadline - b.deadline);
        box.innerHTML = `<div class="card"><div class="tbl-wrap"><table class="tbl cards cards-l"><thead><tr><th>Priority</th><th>Ticket</th><th>Customer · machine</th><th>Assigned</th><th>Status</th><th>SLA</th></tr></thead><tbody>${rows.map((t) => `<tr data-id="${t.id}"><td data-l="Priority"><span class="pri ${t.pri}" title="${t.pri}: ${t.sla}h response">${t.pri}</span></td><td class="first wrap" data-l="Ticket"><b class="mono">${t.id}</b><div style="font-weight:600">${esc(t.issue)}</div></td><td data-l="Customer"><div><b style="font-weight:600">${esc(CO[t.co].name)}</b><div class="faint" style="font-size:12px">${esc(t.machine)}</div></div></td><td data-l="Assigned"><label class="sr-only" for="ta-${t.id}">Assign ${t.id}</label><select class="select status-sel" id="ta-${t.id}" data-assign="${t.id}"><option value="">Unassigned</option>${techs.map((s) => `<option value="${s.id}" ${t.tech === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></td><td data-l="Status"><label class="sr-only" for="ts-${t.id}">Status ${t.id}</label><select class="select status-sel" id="ts-${t.id}" data-status="${t.id}">${["New", "Assigned", "On site", "Waiting parts", "Resolved"].map((s) => `<option ${t.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></td><td data-l="SLA"><span data-sla="${t.id}">${slaText(t)}</span>${t.status !== "Resolved" ? `<button type="button" class="btn btn-s btn-xs resolve" data-resolve="${t.id}" aria-label="Resolve ${t.id}">${ic("check")}Resolve</button>` : ""}</td></tr>`).join("")}</tbody></table></div><div class="tfoot"><span>SLA: P1 4 h · P2 8 h · P3 24 h · P4 72 h</span><span>Hotline routes to on-call technician after hours</span></div></div>`;
        const tick = () => S.tickets.forEach((t) => { const c = $(`[data-sla="${t.id}"]`, box); if (c) c.innerHTML = slaText(t); });
        timers.push(setInterval(tick, 1000));
        const upd = (t, k, v) => { t[k] = v; save(); if (k === "status" && v === "Resolved") toast(`${t.id} resolved · SLA ${t.deadline > Date.now() ? "met" : "missed"}`); draw(); $("#svStats", el).innerHTML = stats(); refreshBadges(); };
        $$("[data-assign]", box).forEach((s) => s.addEventListener("change", () => { const t = S.tickets.find((x) => x.id === s.dataset.assign); t.tech = s.value || null; if (t.status === "New" && s.value) t.status = "Assigned"; save(); toast(`${t.id} assigned to ${s.value ? esc(ST[s.value].name) : "nobody"}`); draw(); }));
        $$("[data-status]", box).forEach((s) => s.addEventListener("change", () => upd(S.tickets.find((x) => x.id === s.dataset.status), "status", s.value)));
        $$("[data-resolve]", box).forEach((b) => b.addEventListener("click", () => upd(S.tickets.find((x) => x.id === b.dataset.resolve), "status", "Resolved")));
      } else if (UI.svcTab === "parts") {
        box.innerHTML = `<div class="card"><div class="tbl-wrap"><table class="tbl cards"><thead><tr><th>Order</th><th>Customer</th><th>Progress</th><th>Day</th><th>Status</th><th class="r"><span class="sr-only">Actions</span></th></tr></thead><tbody>${S.parts.map((p) => {
          const day = -p.ordered, delivered = p.step >= 4, late = !delivered && day > p.target, risk = !delivered && !late && day >= p.target - 1;
          return `<tr><td class="first wrap" data-l="Order"><b class="mono">${p.id}</b><div style="font-weight:600">${esc(p.part)} × ${p.qty}</div></td><td data-l="Customer">${esc(CO[p.co].name)}</td><td data-l="Progress"><div style="display:grid;gap:5px;min-width:150px"><div class="steps" aria-hidden="true">${L.PART_STEPS.map((_, i) => `<i class="${i <= p.step ? "on" : ""}"></i>`).join("")}</div><small class="faint">${L.PART_STEPS[p.step]}</small></div></td><td data-l="Day" class="tnum">${delivered ? "—" : `Day ${day} of ${p.target}`}</td><td data-l="Status"><span class="pill ${delivered ? "good" : late ? "crit" : risk ? "warn" : "info"}">${delivered ? "Delivered" : late ? "Late" : risk ? "At risk" : "On track"}</span></td><td class="r" data-l="">${!delivered ? `<button class="btn btn-s btn-xs" data-adv="${p.id}">Next step ${ic("chev", "sm")}</button>` : ""}</td></tr>`;
        }).join("")}</tbody></table></div><div class="tfoot"><span>Target: 3–5 working days from order to delivery</span><span>${S.parts.filter((p) => p.step >= 4).length} delivered this week</span></div></div>`;
        $$("[data-adv]", box).forEach((b) => b.addEventListener("click", () => { const p = S.parts.find((x) => x.id === b.dataset.adv); p.step = Math.min(4, p.step + 1); save(); toast(`${p.id}: ${L.PART_STEPS[p.step]}`, { icon: "truck" }); draw(); $("#svStats", el).innerHTML = stats(); }));
      } else {
        box.innerHTML = `<div class="grid g-2">${S.commissioning.map((c) => {
          const wk = Math.min(c.weeks, Math.floor(-c.start / 7) + 1), pr = Math.round((-c.start / (c.weeks * 7)) * 100);
          return `<div class="card proj"><div class="proj-h"><div><b>${esc(c.project)}</b><small>${esc(CO[c.co].name)} · lead ${esc(ST[c.lead].name)}</small></div><span class="tag mono">${c.id}</span></div>
            <div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span class="muted">Week ${wk} of ${c.weeks} · started ${fdate(new Date(TODAY.getTime() + c.start * DAY).toISOString())}</span><b class="tnum">${Math.min(100, pr)}%</b></div><div class="bar lg" role="progressbar" aria-valuenow="${Math.min(100, pr)}" aria-valuemin="0" aria-valuemax="100" aria-label="Programme progress"><i style="width:${Math.min(100, pr)}%"></i></div></div>
            <div class="ms">${c.milestones.map((m, i) => `<div class="${i < c.done ? "on" : i === c.done ? "cur" : ""}"><i></i>${esc(m)}</div>`).join("")}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span class="faint" style="font-size:12.5px">${c.done < c.milestones.length ? "Next: " + esc(c.milestones[c.done]) : "Handed over"}</span>${c.done < c.milestones.length ? `<button class="btn btn-s btn-sm" data-ms="${c.id}">${ic("check")}Mark ${esc(c.milestones[c.done].toLowerCase())} done</button>` : `<span class="pill good">Complete</span>`}</div></div>`;
        }).join("")}</div>`;
        $$("[data-ms]", box).forEach((b) => b.addEventListener("click", () => { const c = S.commissioning.find((x) => x.id === b.dataset.ms); toast(`${esc(c.milestones[c.done])} done · ${esc(CO[c.co].name)}`); c.done++; save(); draw(); }));
      }
    }
    $$("[data-t]", el).forEach((b) => b.addEventListener("click", () => { UI.svcTab = b.dataset.t; saveUI(); draw(); }));
    $(".tabs", el).addEventListener("keydown", (e) => { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; const ks = ["tickets", "parts", "comm"]; const i = (ks.indexOf(UI.svcTab) + (e.key === "ArrowRight" ? 1 : 2)) % 3; UI.svcTab = ks[i]; draw(); $(`[data-t="${ks[i]}"]`, el).focus(); });
    $("#tNew", el).addEventListener("click", () => {
      const lay = openLayer("modal", drawerShell({ title: "New support ticket", sub: "Starts the SLA clock as soon as it is created.", body: `<div class="form-grid" style="grid-template-columns:1fr 1fr"><div class="field"><label for="nt-c">Customer</label><select class="select" id="nt-c">${L.COMPANIES.filter((c) => c.div === "agri").map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div><div class="field"><label for="nt-p">Priority</label><select class="select" id="nt-p"><option value="P1">P1 · line down (4 h)</option><option value="P2" selected>P2 · degraded (8 h)</option><option value="P3">P3 · minor (24 h)</option><option value="P4">P4 · request (72 h)</option></select></div><div class="field" style="grid-column:1/-1"><label for="nt-m">Machine</label><input class="input" id="nt-m" value="Reemoon grading line"></div><div class="field" style="grid-column:1/-1"><label for="nt-i">What is wrong?</label><textarea class="input" id="nt-i" placeholder="Describe the issue" autofocus></textarea></div></div>`, foot: `<button class="btn btn-g" data-close>Cancel</button><button class="btn btn-p" id="nt-save">${ic("ticket")}Create ticket</button>` }), { cls: "sm", label: "New ticket" });
      $("#nt-save", lay.panel).addEventListener("click", () => { const p = lay.panel; const pri = $("#nt-p", p).value, sla = { P1: 4, P2: 8, P3: 24, P4: 72 }[pri]; const t = { id: "SR-" + (Math.max(...S.tickets.map((x) => +x.id.slice(3))) + 1), co: $("#nt-c", p).value, machine: $("#nt-m", p).value, issue: $("#nt-i", p).value.trim() || "New issue reported", pri, sla, status: "New", tech: null, deadline: Date.now() + sla * 36e5 }; S.tickets.unshift(t); save(); lay.close(); UI.svcTab = "tickets"; draw(); $("#svStats", el).innerHTML = stats(); refreshBadges(); toast(`${t.id} created · ${sla} h SLA started`, { icon: "ticket" }); });
    });
    draw();
  };

  /* ---------- Invoicing ---------- */
  const INV_PILL = { draft: ["", "Draft"], sent: ["info", "Sent"], paid: ["good", "Paid"], overdue: ["crit", "Overdue"] };
  const invPill = (i) => { const s = invStatus(i); return `<span class="pill ${INV_PILL[s][0]}">${INV_PILL[s][1]}</span>`; };
  const iq = { q: "", sort: { key: "issued", dir: "desc" } };
  VIEWS.invoicing = function (el) {
    function stats() {
      const out = S.invoices.filter((i) => ["sent", "overdue"].includes(invStatus(i))), od = out.filter((i) => invStatus(i) === "overdue");
      const paid = S.invoices.filter((i) => i.status === "paid" && daysFrom(i.issued) > -60), dr = S.invoices.filter((i) => i.status === "draft");
      return `<div class="stat-row">${[["Outstanding", rm(out.reduce((s, i) => s + invTotal(i), 0)), out.length + " invoices"], ["Overdue", rm(od.reduce((s, i) => s + invTotal(i), 0)), od.length + " invoices · chase today"], ["Paid · last 60 days", rm(paid.reduce((s, i) => s + invTotal(i), 0)), paid.length + " invoices"], ["Drafts", rm(dr.reduce((s, i) => s + invTotal(i), 0)), dr.length + " to review"]].map(([l, v, s]) => `<div class="card stat"><small>${l}</small><b>${v}</b><em>${s}</em></div>`).join("")}</div>`;
    }
    el.innerHTML = `<div class="page-head"><div><h1>Invoicing</h1><p>Quotes to cash in RM. SST rate is configurable; e-Invoice (MyInvois) submission is a planned integration.</p></div><div class="actions"><button class="btn btn-s" id="iExp">${ic("file")}Export</button><button class="btn btn-p" id="iNew">${ic("plus")}New invoice</button></div></div>
      <div id="iStats">${stats()}</div>
      <div class="grid g-main">
        <section class="card" aria-labelledby="agH"><div class="card-h"><div><h2 id="agH">Receivables aging</h2><span class="sub">Unpaid invoices by days past due</span></div></div><div class="card-b"><div id="agChart" class="chart-box"></div></div></section>
        <section class="card" aria-labelledby="eiH"><div class="card-h"><h2 id="eiH">e-Invoice · MyInvois</h2><span class="pill plan nodot">Planned integration</span></div><div class="card-b"><p class="muted" style="font-size:13.5px">When connected, each invoice is submitted to LHDN MyInvois, validated, and gets its QR code before it is sent. Until then the column shows readiness only.</p><div class="list" style="margin-top:12px" id="eiList"></div><a class="link" href="#/settings" style="margin-top:12px">Integration settings ${ic("chev", "sm")}</a></div></section>
      </div>
      <div class="toolbar mt"><div class="seg" role="group" aria-label="Status filter" id="iSeg"></div><span class="grow"></span><label class="search"><span class="sr-only">Search invoices</span>${ic("search")}<input class="input" id="iq" type="search" placeholder="Search number or customer" value="${esc(iq.q)}"></label></div>
      <div class="card" id="iBody"></div>`;
    function aging() {
      const b = [0, 0, 0, 0, 0]; S.invoices.filter((i) => ["sent", "overdue"].includes(invStatus(i))).forEach((i) => { const late = -daysFrom(i.due); b[late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : late <= 90 ? 3 : 4] += invTotal(i); });
      C.bars($("#agChart", el), { labels: ["Not yet due", "1–30 days", "31–60", "61–90", "90+"], height: 220, label: "Receivables aging: unpaid invoices by days past due", rowHead: "Days past due", series: [{ name: "Outstanding", color: "var(--c-mag)", values: b }], format: rm, axis: rmc });
      $("#eiList", el).innerHTML = [["Ready to submit", S.invoices.filter((i) => i.status !== "draft").length], ["Drafts, not ready", S.invoices.filter((i) => i.status === "draft").length], ["Validated by LHDN", 0]].map(([l, n]) => `<div class="li" style="padding:8px 0"><div class="grow"><div class="t" style="font-weight:500">${l}</div></div><b class="tnum">${n}</b></div>`).join("");
    }
    function draw(flashId) {
      const cnt = (k) => k === "all" ? S.invoices.length : S.invoices.filter((i) => invStatus(i) === k).length;
      $("#iSeg", el).innerHTML = ["all", "draft", "sent", "paid", "overdue"].map((k) => `<button type="button" data-f="${k}" aria-pressed="${UI.invFilter === k}">${k === "all" ? "All" : INV_PILL[k][1]} <span class="faint tnum">${cnt(k)}</span></button>`).join("");
      $$("[data-f]", el).forEach((b) => b.addEventListener("click", () => { UI.invFilter = b.dataset.f; saveUI(); draw(); $(`[data-f="${UI.invFilter}"]`, el).focus(); }));
      const get = { id: (i) => i.id, co: (i) => CO[i.co].name, issued: (i) => i.issued, due: (i) => i.due, total: (i) => invTotal(i), status: (i) => invStatus(i) };
      const q = iq.q.toLowerCase();
      const rows = sortRows(S.invoices.filter((i) => (UI.invFilter === "all" || invStatus(i) === UI.invFilter) && (!q || (i.id + CO[i.co].name).toLowerCase().includes(q))), iq.sort.key, iq.sort.dir, get);
      $("#iBody", el).innerHTML = `<div class="tbl-wrap"><table class="tbl cards"><thead><tr>${th("Invoice", "id", iq.sort)}${th("Customer", "co", iq.sort)}${th("Issued", "issued", iq.sort, "hide-m")}${th("Due", "due", iq.sort)}${th("Amount", "total", iq.sort, "r")}${th("Status", "status", iq.sort)}<th class="hide-l">e-Invoice · planned</th></tr></thead><tbody>${rows.length ? rows.map((i) => `<tr class="click ${i.id === flashId ? "flash" : ""}" tabindex="0" data-id="${i.id}"><td class="first" data-l="Invoice"><b class="mono">${i.id}</b></td><td data-l="Customer"><div class="co">${lq(CO[i.co].name)}<b>${esc(CO[i.co].name)}</b></div></td><td data-l="Issued" class="hide-m">${fdateY(i.issued)}</td><td data-l="Due" class="${invStatus(i) === "overdue" ? "" : "muted"}"><span>${fdate(i.due)}${invStatus(i) === "overdue" ? ` <small style="color:var(--crit-ink);font-weight:700">· ${-daysFrom(i.due)}d late</small>` : ""}</span></td><td class="r strong" data-l="Amount">${rm(invTotal(i))}</td><td data-l="Status">${invPill(i)}</td><td data-l="e-Invoice" class="faint einv hide-l">${esc(i.einv)}</td></tr>`).join("") : `<tr><td colspan="7">${empty("invoice", "No invoices here", UI.invFilter === "all" ? "Create your first invoice." : "Nothing with this status right now.")}</td></tr>`}</tbody></table></div><div class="tfoot"><span>${rows.length} invoices</span><span class="tnum">Total ${rm(rows.reduce((s, i) => s + invTotal(i), 0))}</span></div>`;
      $$("[data-sort]", el).forEach((b) => b.addEventListener("click", () => { const k = b.dataset.sort; iq.sort = { key: k, dir: iq.sort.key === k && iq.sort.dir === "desc" ? "asc" : "desc" }; draw(); $(`[data-sort="${k}"]`, el).focus(); }));
      $$("tr.click", el).forEach((tr) => { tr.addEventListener("click", () => openInvoice(tr.dataset.id)); tr.addEventListener("keydown", (e) => { if (e.key === "Enter") openInvoice(tr.dataset.id); }); });
      aging(); $("#iStats", el).innerHTML = stats();
    }
    S._redrawInv = draw;
    $("#iq", el).addEventListener("input", (e) => { iq.q = e.target.value; draw(); });
    $("#iNew", el).addEventListener("click", () => newInvoiceModal());
    $("#iExp", el).addEventListener("click", () => toast("Export for your accountant prepared (demo)", { icon: "file" }));
    draw();
  };
  function invoicePaper(inv) {
    const co = CO[inv.co], s = invStatus(inv);
    return `<div class="inv-paper">
      <div class="inv-top"><img src="assets/logo.png" alt="Logsco Agri Technology"><div class="inv-title"><h3>INVOICE</h3><p class="mono">${esc(inv.id)}</p>${s !== "sent" ? `<div class="inv-stamp ${s}">${s.toUpperCase()}</div>` : ""}</div></div>
      <div class="inv-parties"><div><h4>From</h4><b>Logsco Agri Technology Sdn. Bhd.</b><div>SSM 202501040607 · MOF registered</div><div>Masai, Johor, Malaysia</div><div>SST reg. no.: <i>configurable</i></div></div><div><h4>Bill to</h4><b>${esc(co.name)}</b><div>Attn: ${esc(co.contact)}, ${esc(co.title)}</div><div>${esc(co.state)}, Malaysia</div><div>Issued ${fdateY(inv.issued)} · Due ${fdateY(inv.due)} (${inv.terms} days)</div></div></div>
      <table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead><tbody>${inv.lines.map((l) => `<tr><td>${esc(l.desc || "—")}</td><td class="r">${qtyFmt(l.qty)}</td><td class="r">${rm(l.price)}</td><td class="r">${rm(lineAmt(l))}</td></tr>`).join("")}</tbody></table>
      <div class="inv-sum"><div><span>Subtotal</span><span>${rm(invSub(inv))}</span></div><div><span>SST (${inv.sst}%)</span><span>${rm(invTax(inv))}</span></div><div class="g"><span>Total due</span><span>${rm(invTotal(inv))}</span></div></div>
      <div class="inv-foot"><div>Bank transfer to Logsco Agri Technology Sdn. Bhd. · bank details on the final template<br>Please quote ${esc(inv.id)} as the payment reference. Thank you for your business.</div><div class="qr">MyInvois QR · planned</div></div></div>`;
  }
  function openInvoice(id) {
    const inv = S.invoices.find((x) => x.id === id); if (!inv) return; const s = invStatus(inv);
    const lay = openLayer("drawer", drawerShell({
      title: esc(inv.id), sub: `${esc(CO[inv.co].name)} · ${rm(invTotal(inv))}`, lead: `<span class="ic" style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--surface-2);border:1px solid var(--line)">${ic("invoice")}</span>`,
      body: `<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">${invPill(inv)}<span class="pill plan nodot">e-Invoice: ${esc(inv.einv)} · planned</span></div>${invoicePaper(inv)}`,
      foot: `<button class="btn btn-g" id="ivPrint">${ic("print")}Print / PDF</button><button class="btn btn-s" id="ivDup">${ic("copy")}Duplicate</button>${s === "draft" ? `<button class="btn btn-p" id="ivSend">${ic("send")}Send to customer</button>` : s !== "paid" ? `<button class="btn btn-p" id="ivPaid">${ic("check")}Mark as paid</button>` : ""}`
    }), { label: "Invoice preview" });
    const p = lay.panel;
    $("#ivPrint", p).addEventListener("click", () => { root.classList.add("print-inv"); const off = () => { root.classList.remove("print-inv"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); window.print(); setTimeout(off, 1000); });
    $("#ivDup", p).addEventListener("click", () => { lay.close(); setTimeout(() => newInvoiceModal({ co: inv.co, lines: clone(inv.lines), sst: inv.sst }), 200); });
    const after = (msg, undo) => { save(); lay.close(); if (S._redrawInv && current === "invoicing") S._redrawInv(inv.id); else refreshView(); refreshBadges(); toast(msg, { icon: "invoice", action: undo ? { label: "Undo", fn: () => { undo(); save(); if (S._redrawInv && current === "invoicing") S._redrawInv(inv.id); else refreshView(); refreshBadges(); } } : null }); };
    const sb = $("#ivSend", p); if (sb) sb.addEventListener("click", () => { inv.status = "sent"; inv.einv = "Not submitted"; after(`${esc(inv.id)} sent to ${esc(CO[inv.co].contact)}`); });
    const pb = $("#ivPaid", p); if (pb) pb.addEventListener("click", () => { const prev = inv.status; inv.status = "paid"; after(`${esc(inv.id)} marked as paid · ${rm(invTotal(inv))}`, () => (inv.status = prev)); });
  }
  const SST_RATES = [0, 5, 6, 8, 10];
  function nextInvNo() { const n = Math.max(...S.invoices.map((i) => parseInt(i.id.slice(-4), 10))) + 1; return "LAT-INV-26-" + String(n).padStart(4, "0"); }
  function newInvoiceModal(pre = {}) {
    const defSst = UI.sst != null ? UI.sst : 8;
    const draft = { id: nextInvNo(), co: pre.co || "c1", issued: TODAY.toISOString(), terms: 30, sst: pre.sst != null ? pre.sst : defSst, lines: pre.lines ? clone(pre.lines) : [{ desc: "", qty: 1, price: 0 }], status: "draft", einv: "Not ready" };
    const lay = openLayer("modal", drawerShell({
      title: "New invoice", sub: `<span class="mono">${draft.id}</span> · Ringgit Malaysia (RM)`,
      body: `<div id="niForm"><div class="form-grid">
          <div class="field" style="grid-column:span 2"><label for="ni-c">Customer</label><select class="select" id="ni-c">${L.COMPANIES.map((c) => `<option value="${c.id}" ${c.id === draft.co ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
          <div class="field"><label for="ni-d">Invoice date</label><input class="input" type="date" id="ni-d" required value="${ymd(TODAY)}"></div>
          <div class="field"><label for="ni-t">Payment terms</label><select class="select" id="ni-t">${[7, 14, 30, 60].map((t) => `<option value="${t}" ${t === 30 ? "selected" : ""}>${t} days</option>`).join("")}</select><small id="ni-due"></small></div>
          <div class="field"><label for="ni-s">SST rate <span class="tag" style="height:18px;margin-left:4px">configurable</span></label><select class="select" id="ni-s" aria-describedby="ni-s-h">${SST_RATES.map((r) => `<option value="${r}" ${r === draft.sst ? "selected" : ""}>${r === 0 ? "0% · exempt / not registered" : r + "%"}</option>`).join("")}</select><small id="ni-s-h">Default comes from Settings. Confirm the rate with your tax adviser.</small></div>
          <div class="field"><span class="lab">e-Invoice (MyInvois)</span><span class="pill plan nodot" style="height:36px;border-radius:9px;justify-content:flex-start;padding:0 12px">Planned integration · not submitted</span></div>
        </div>
        <table class="lines"><caption class="sr-only">Invoice lines</caption><thead><tr><th style="width:52%">Description</th><th style="width:12%">Qty</th><th style="width:18%">Unit price (RM)</th><th class="r" style="text-align:right">Amount</th><th><span class="sr-only">Remove</span></th></tr></thead><tbody id="niLines"></tbody></table>
        <p class="form-err" id="niErr" role="alert" hidden></p>
        <button type="button" class="btn btn-g btn-sm" id="niAdd" style="margin-top:8px">${ic("plus")}Add line</button>
        <div class="totals" id="niTot" aria-live="polite"></div>
        <div class="field mt"><label for="ni-n">Notes to customer</label><textarea class="input" id="ni-n" rows="2">Thank you for your business. Payment by bank transfer within the terms above.</textarea></div></div>
        <div id="niPrev" hidden></div>`,
      foot: `<button type="button" class="btn btn-g" data-close>Cancel</button><button type="button" class="btn btn-s" id="niPv" aria-pressed="false">${ic("file")}<span>Preview</span></button><button type="button" class="btn btn-s" id="niDraft">Save draft</button><button type="button" class="btn btn-p" id="niSend">${ic("send")}Create & send</button>`
    }), { label: "New invoice" });
    const p = lay.panel;
    const due = () => new Date(dt(draft.issued).getTime() + draft.terms * DAY).toISOString();
    const showDue = () => { $("#ni-due", p).textContent = "Due " + fdateY(due()); };
    const err = (msg) => { const e = $("#niErr", p); e.textContent = msg || ""; e.hidden = !msg; };
    function lines() {
      $("#niLines", p).innerHTML = draft.lines.map((l, i) => `<tr data-i="${i}"><td class="desc"><label class="sr-only" for="nl-d${i}">Description, line ${i + 1}</label><input class="input" id="nl-d${i}" data-k="desc" value="${esc(l.desc)}" placeholder="e.g. Reemoon grading line, deposit (30%)" autocomplete="off"></td><td><span class="cap" aria-hidden="true">Qty</span><label class="sr-only" for="nl-q${i}">Quantity, line ${i + 1}</label><input class="input tnum" id="nl-q${i}" data-k="qty" type="number" inputmode="decimal" min="0" step="any" value="${l.qty}"></td><td><span class="cap" aria-hidden="true">Unit price (RM)</span><label class="sr-only" for="nl-p${i}">Unit price in RM, line ${i + 1}</label><input class="input tnum" id="nl-p${i}" data-k="price" type="number" inputmode="decimal" min="0" step="0.01" value="${l.price}"></td><td class="amt" data-amt>${rm(lineAmt(l))}</td><td><button type="button" class="icon-btn" data-rm="${i}" aria-label="Remove line ${i + 1}" ${draft.lines.length === 1 ? "disabled" : ""}>${ic("trash")}</button></td></tr>`).join("");
      $$("#niLines input", p).forEach((inp) => inp.addEventListener("input", () => {
        const i = +inp.closest("tr").dataset.i, k = inp.dataset.k;
        draft.lines[i][k] = k === "desc" ? inp.value : Math.max(0, +inp.value || 0);
        inp.removeAttribute("aria-invalid"); err("");
        inp.closest("tr").querySelector("[data-amt]").textContent = rm(lineAmt(draft.lines[i])); totals();
      }));
      $$("#niLines input[type=number]", p).forEach((inp) => inp.addEventListener("blur", () => { if (inp.value !== "" && +inp.value < 0) { inp.value = 0; inp.dispatchEvent(new Event("input")); } }));
      $$("[data-rm]", p).forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.rm; draft.lines.splice(i, 1); lines(); totals();
        const n = $(`#nl-d${Math.min(i, draft.lines.length - 1)}`, p); if (n) n.focus(); announce("Line removed");
      }));
    }
    function totals() { $("#niTot", p).innerHTML = `<div><span class="muted">Subtotal</span><span>${rm(invSub(draft))}</span></div><div><span class="muted">SST (${draft.sst}%)</span><span>${rm(invTax(draft))}</span></div><div class="grand"><span>Total</span><span>${rm(invTotal(draft))}</span></div>`; }
    lines(); totals(); showDue();
    $("#niAdd", p).addEventListener("click", () => { draft.lines.push({ desc: "", qty: 1, price: 0 }); lines(); totals(); $(`#nl-d${draft.lines.length - 1}`, p).focus(); });
    $("#ni-s", p).addEventListener("change", (e) => { draft.sst = +e.target.value; totals(); });
    $("#ni-c", p).addEventListener("change", (e) => (draft.co = e.target.value));
    $("#ni-t", p).addEventListener("change", (e) => { draft.terms = +e.target.value; showDue(); });
    $("#ni-d", p).addEventListener("change", (e) => { if (e.target.value) { draft.issued = new Date(e.target.value + "T00:00:00").toISOString(); e.target.removeAttribute("aria-invalid"); showDue(); } });
    const showForm = () => { $("#niPrev", p).hidden = true; $("#niForm", p).hidden = false; const b = $("#niPv", p); b.setAttribute("aria-pressed", "false"); b.lastChild.textContent = "Preview"; };
    $("#niPv", p).addEventListener("click", (e) => { const on = $("#niPrev", p).hidden; if (!on) return showForm(); draft.due = due(); $("#niPrev", p).innerHTML = invoicePaper(Object.assign({}, draft, { lines: draft.lines.filter((l) => l.desc.trim() || lineAmt(l)) })); $("#niPrev", p).hidden = false; $("#niForm", p).hidden = true; e.currentTarget.setAttribute("aria-pressed", "true"); e.currentTarget.lastChild.textContent = "Edit"; });
    /* validation: blank rows are ignored; a row with an amount needs a description; a described row needs a quantity above 0 */
    function validate() {
      $$("#niLines [aria-invalid]", p).forEach((x) => x.removeAttribute("aria-invalid"));
      if (!$("#ni-d", p).value) return { el: $("#ni-d", p), msg: "Choose an invoice date." };
      for (let i = 0; i < draft.lines.length; i++) {
        const l = draft.lines[i], blank = !l.desc.trim() && !(+l.price);
        if (blank) continue;
        if (!l.desc.trim()) return { el: $(`#nl-d${i}`, p), msg: `Line ${i + 1} needs a description.` };
        if (!(+l.qty > 0)) return { el: $(`#nl-q${i}`, p), msg: `Line ${i + 1}: quantity must be more than 0.` };
      }
      const used = draft.lines.filter((l) => l.desc.trim());
      if (!used.length) return { el: $("#nl-d0", p), msg: "Add at least one line with a description." };
      if (!(invTotal(Object.assign({}, draft, { lines: used })) > 0)) return { el: $(`#nl-p${draft.lines.indexOf(used[0])}`, p), msg: "The invoice total is RM 0.00. Add a unit price." };
      return null;
    }
    function create(status) {
      const bad = validate();
      if (bad) { showForm(); bad.el.setAttribute("aria-invalid", "true"); bad.el.setAttribute("aria-describedby", "niErr"); err(bad.msg); bad.el.focus(); return; }
      draft.lines = draft.lines.filter((l) => l.desc.trim()).map((l) => ({ desc: l.desc.trim(), qty: +l.qty, price: sen(l.price) }));
      draft.status = status; draft.due = due(); draft.einv = status === "draft" ? "Not ready" : "Not submitted";
      S.invoices.push(draft); save(); lay.close(); refreshBadges();
      const view = () => (current === "invoicing" ? openInvoice(draft.id) : go("invoicing", () => openInvoice(draft.id)));
      if (current === "invoicing" && S._redrawInv) { if (UI.invFilter !== "all" && UI.invFilter !== status) UI.invFilter = "all"; S._redrawInv(draft.id); } else refreshView();
      toast(`${draft.id} ${status === "draft" ? "saved as draft" : "created and sent"} · ${rm(invTotal(draft))}`, { icon: "invoice", action: { label: "View", fn: view } });
    }
    $("#niDraft", p).addEventListener("click", () => create("draft"));
    $("#niSend", p).addEventListener("click", () => create("sent"));
  }

  /* ---------- Campaigns ---------- */
  const CH_IC = { Email: "mail", LinkedIn: "linkedin", WhatsApp: "chat" };
  VIEWS.campaigns = function (el) {
    const seq = S.sequences, ads = S.ads;
    const meet = seq.reduce((s, x) => s + x.meetings, 0), sent = seq.reduce((s, x) => s + x.sent, 0), rep = seq.reduce((s, x) => s + x.replied, 0);
    const spend = ads.reduce((s, a) => s + a.spend, 0), b2b = ads.filter((a) => !a.signups), sgn = ads.filter((a) => a.signups);
    const b2bSpend = b2b.reduce((s, a) => s + a.spend, 0), leads = b2b.reduce((s, a) => s + a.leads, 0), sgnSpend = sgn.reduce((s, a) => s + a.spend, 0), signups = sgn.reduce((s, a) => s + a.leads, 0);
    const wl = L.WAITLIST; const todayIdx0 = 7 + (TODAY.getDay() + 6) % 7; const cal0 = new Date(TODAY.getTime() - todayIdx0 * DAY);
    el.innerHTML = `<div class="page-head"><div><h1>Campaigns</h1><p>Outbound sequences, paid ads and the Pina Boosta launch calendar in one place.</p></div><div class="actions"><button class="btn btn-p" id="cmNew">${ic("plus")}New sequence</button></div></div>
      <div class="stat-row">${[["Meetings booked", meet, "From outbound, this month"], ["Reply rate", pct((rep / sent) * 100), num(rep) + " replies of " + num(sent)], ["Ad spend · 30 days", rm(spend), "Google + Meta"], ["Cost per lead", rm(b2bSpend / leads), num(leads) + " B2B leads · " + rm(sgnSpend / signups) + " per sign-up"]].map(([l, v, s]) => `<div class="card stat"><small>${l}</small><b>${v}</b><em>${s}</em></div>`).join("")}</div>
      <section class="card" aria-labelledby="seqH"><div class="card-h"><div><h2 id="seqH">Outbound sequences</h2><span class="sub">AI agents draft, a human approves, replies land in the pipeline</span></div></div><div class="tbl-wrap"><table class="tbl cards"><thead><tr><th>Sequence</th><th>Channel</th><th class="r">Sent</th><th class="r">Opened</th><th class="r">Replied</th><th class="r">Meetings</th><th>Active</th></tr></thead><tbody>${seq.map((s) => `<tr><td class="first" data-l="Sequence"><b style="font-weight:600">${esc(s.name)}</b><div>${divTag(s.div)} <span class="faint" style="font-size:12px">· ${s.steps} steps</span></div></td><td data-l="Channel"><span class="ch">${ic(CH_IC[s.channel])}${s.channel}</span></td><td class="r" data-l="Sent">${num(s.sent)}</td><td class="r" data-l="Opened"><span>${num(s.opened)} <span class="faint">${pct((s.opened / s.sent) * 100, 0)}</span></span></td><td class="r" data-l="Replied"><span>${num(s.replied)} <span class="faint">${pct((s.replied / s.sent) * 100, 0)}</span></span></td><td class="r strong" data-l="Meetings">${s.meetings}</td><td data-l="Active">${s.status === "draft" ? `<span class="pill nodot">Draft</span>` : `<button class="switch" role="switch" aria-checked="${s.status === "active"}" data-seq="${s.id}" aria-label="${esc(s.name)} active"></button>`}</td></tr>`).join("")}</tbody></table></div></section>
      <div class="grid g-main mt">
        <section class="card" aria-labelledby="adH"><div class="card-h"><div><h2 id="adH">Google & Meta ads</h2><span class="sub">Last 30 days · Pina Boosta ads count waitlist sign-ups</span></div></div><div class="tbl-wrap"><table class="tbl cards"><thead><tr><th>Campaign</th><th class="r">Spend</th><th class="r hide-l">Clicks</th><th class="r">Results</th><th class="r">Cost / result</th><th>On</th></tr></thead><tbody>${ads.map((a) => `<tr><td class="first" data-l="Campaign"><b style="font-weight:600">${esc(a.name)}</b><div><span class="ch faint" style="font-size:12px">${ic(a.platform === "Google" ? "search" : "fb", "sm")}${a.platform}</span><span style="margin-left:10px">${divTag(a.div)}</span></div></td><td class="r" data-l="Spend">${rm(a.spend)}</td><td class="r hide-l" data-l="Clicks">${num(a.clicks)}</td><td class="r" data-l="Results">${num(a.leads)} <span class="faint">${a.signups ? "sign-ups" : "leads"}</span></td><td class="r strong" data-l="Cost / result">${rm(a.spend / a.leads)}</td><td data-l="On"><button class="switch" role="switch" aria-checked="${a.status === "active"}" data-ad="${a.id}" aria-label="${esc(a.name)} running"></button></td></tr>`).join("")}</tbody></table></div><div class="tfoot"><span>${ads.length} campaigns · ${num(ads.reduce((s, a) => s + a.clicks, 0))} clicks</span><span class="tnum">Spend ${rm(spend)}</span></div></section>
        <section class="card" aria-labelledby="wlH"><div class="card-h"><div><h2 id="wlH">Batch 001 waitlist</h2><span class="sub">Pina Boosta · pre-launch</span></div>${divTag("bev")}</div><div class="card-b">
          <div class="wl-hero"><span class="wl-can" aria-hidden="true"></span><div style="flex:1;min-width:160px"><div class="big-n">${num(wl.total)}</div><div class="muted" style="font-size:13px">sign-ups · goal ${num(wl.goal)} before launch</div><div class="bar lg" style="margin-top:10px" role="progressbar" aria-valuenow="${Math.round((wl.total / wl.goal) * 100)}" aria-valuemin="0" aria-valuemax="100" aria-label="Waitlist progress to goal"><i style="width:${(wl.total / wl.goal) * 100}%;background:var(--c-bev)"></i></div><small class="faint">${pct((wl.total / wl.goal) * 100, 0)} of goal · ${num(wl.daily.slice(-7).reduce((s, d) => s + d.v, 0))} this week</small></div></div>
          <div id="wlChart" class="chart-box" style="margin-top:12px;min-height:130px"></div>
          <div class="sec-h" style="margin-top:8px">Latest sign-ups</div><div class="list">${wl.recent.slice(0, 3).map((r) => `<div class="li" style="padding:7px 0">${av(r.name)}<div class="grow"><div class="t">${esc(r.name)} <span class="faint" style="font-weight:500">${esc(r.email)}</span></div><div class="s">${esc(r.state)} · via ${esc(r.src)}</div></div><span class="when">${relH(r.t / 1440)}</span></div>`).join("")}</div></div></section>
      </div>
      <section class="card mt" aria-labelledby="socH"><div class="card-h"><div><h2 id="socH">Pina Boosta social calendar</h2><span class="sub">${fdate(cal0.toISOString())} – ${fdateY(new Date(cal0.getTime() + 34 * DAY).toISOString())} · Instagram, TikTok, Facebook</span></div><div class="legend"><span><i style="background:color-mix(in srgb,var(--good) 30%,var(--surface))"></i>Published</span><span><i style="background:color-mix(in srgb,var(--gold) 40%,var(--surface))"></i>Scheduled</span><span><i style="background:var(--surface-3)"></i>Draft</span></div></div><div class="card-b"><div class="month" role="table" aria-label="Social posts, five weeks"><div class="mr" role="row">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div class="dh" role="columnheader">${d}</div>`).join("")}</div>${Array.from({ length: 35 }, (_, i) => { const day = new Date(cal0.getTime() + i * DAY); const posts = L.SOCIAL.filter((s) => s.d === i + 1); const past = day < TODAY; return `${i % 7 === 0 ? '<div class="mr" role="row">' : ""}<div class="mc ${+day === +TODAY ? "td" : ""}" role="cell" ${+day === +TODAY ? 'aria-current="date"' : ""}><span class="dn">${day.getDate()}${day.getDate() === 1 || i === 0 ? " " + MON[day.getMonth()] : ""}</span>${posts.map((s) => { s.status = past ? "published" : i - todayIdx0 <= 7 || S.socialSched.includes(L.SOCIAL.indexOf(s)) ? "scheduled" : "draft"; s.date = day.toISOString(); return `<button class="post ${s.status}" data-post="${L.SOCIAL.indexOf(s)}" aria-label="${{ IG: "Instagram", TT: "TikTok", FB: "Facebook" }[s.ch]} post, ${fdate(day.toISOString())}: ${esc(s.text)}, ${s.status}"><b>${s.ch}</b><span>${esc(s.text)}</span></button>`; }).join("")}</div>${i % 7 === 6 ? "</div>" : ""}`; }).join("")}</div></div></section>`;
    let run = wl.total - wl.daily.reduce((s, d) => s + d.v, 0);
    C.lines($("#wlChart", el), { labels: wl.daily.map((d) => d.d), height: 140, label: "Waitlist sign-ups, cumulative 30 days", series: [{ name: "Sign-ups", color: "var(--c-bev)", area: true, values: wl.daily.map((d) => (run += d.v)) }], format: num, axis: compact, xfmt: fdate, tipTitle: fdateY });
    $$("[data-seq]", el).forEach((b) => b.addEventListener("click", () => { const s = seq.find((x) => x.id === b.dataset.seq); s.status = s.status === "active" ? "paused" : "active"; b.setAttribute("aria-checked", String(s.status === "active")); save(); toast(`${esc(s.name)} ${s.status === "active" ? "resumed" : "paused"}`, { icon: "send" }); }));
    $$("[data-ad]", el).forEach((b) => b.addEventListener("click", () => { const a = ads.find((x) => x.id === b.dataset.ad); a.status = a.status === "active" ? "paused" : "active"; b.setAttribute("aria-checked", String(a.status === "active")); save(); toast(`${esc(a.name)} ${a.status === "active" ? "running" : "paused"}`, { icon: "megaphone" }); }));
    $$("[data-post]", el).forEach((b) => b.addEventListener("click", () => { const s = L.SOCIAL[+b.dataset.post]; openLayer("modal", drawerShell({ title: esc(s.text), sub: `${{ IG: "Instagram", TT: "TikTok", FB: "Facebook" }[s.ch]} · ${dt(s.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`, body: `<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><span class="wl-can" aria-hidden="true"></span><div style="flex:1;min-width:200px"><p class="muted">Caption draft: “${esc(s.text)}. One can, one boost. Join the Batch 001 waitlist, link in bio.” #PinaBoosta #Batch001</p><div style="margin-top:12px">${s.status === "published" ? '<span class="pill good">Published</span>' : s.status !== "draft" ? '<span class="pill warn">Scheduled · 8:30 pm</span>' : '<span class="pill">Draft</span>'}</div></div></div>`, foot: `<button class="btn btn-g" data-close>Close</button>${s.status === "draft" ? `<button class="btn btn-p" data-close id="pSched">${ic("calendar")}Schedule post</button>` : ""}` }), { cls: "sm", label: "Social post" }); const ps = $("#pSched"); if (ps) ps.addEventListener("click", () => { S.socialSched.push(+b.dataset.post); save(); s.status = "scheduled"; b.className = "post scheduled"; b.setAttribute("aria-label", b.getAttribute("aria-label").replace(/draft$/, "scheduled")); toast("Post scheduled for 8:30 pm (demo)", { icon: "calendar" }); }); }));
    $("#cmNew", el).addEventListener("click", () => toast("Sequence builder opens here in the full build", { icon: "send" }));
  };

  /* ---------- Websites ---------- */
  VIEWS.websites = function (el) {
    const block = (s) => {
      const done = S.siteTasks[s.id];
      /* form submissions, last 30 days: corporate = CRM "Website form" leads (AgriTech + Estates);
         Pina Boosta = waitlist sign-ups + stockist enquiry forms */
      const forms = s.id === "corp" ? L.LEAD_SOURCES.agri["Website form"] + L.LEAD_SOURCES.estates["Website form"] : L.WAITLIST.daily.reduce((a, d) => a + d.v, 0) + L.LEAD_SOURCES.bev["Website form"];
      return `<div class="stack">
        <section class="card site-card" aria-labelledby="st-${s.id}"><div class="site-h"><div style="display:flex;gap:12px;align-items:center;min-width:0"><span class="fav" style="background:${s.id === "corp" ? "color-mix(in srgb,var(--a-agri) 14%,var(--surface))" : "color-mix(in srgb,var(--gold) 30%,var(--surface))"}">${s.id === "corp" ? '<img src="assets/mark.png" alt="">' : `<b style="font-size:13px;color:var(--ink)">PB</b>`}</span><div style="min-width:0"><h2 id="st-${s.id}">${esc(s.name)}</h2><small>${s.domain === "Domain TBC" ? `<span class="tag">Domain TBC</span>` : `<a class="link" href="https://${s.domain}" target="_blank" rel="noopener">${esc(s.domain)} ${ic("ext", "sm")}</a>`}</small></div></div><span class="pill good">Online</span></div>
          <div class="metrics"><div class="metric"><small>Uptime · 30 days</small><b>${s.uptime}%</b></div><div class="metric"><small>Mobile score</small><b>${s.speedM}</b></div><div class="metric"><small>Largest paint</small><b>${s.lcp} s</b></div><div class="metric"><small>Pages published</small><b>${s.pages}</b></div></div>
          <div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px" class="faint"><span>Uptime, last 60 days</span><span>1 short incident</span></div><div class="uptime" aria-hidden="true">${Array.from({ length: 60 }, (_, i) => `<i class="${i === (s.id === "corp" ? 41 : 17) ? "w" : ""}" title="${i === (s.id === "corp" ? 41 : 17) ? "Degraded 4 min" : "Up"}"></i>`).join("")}</div></div>
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><span class="score-w"><span class="score" style="--v:${s.speedM}" role="img" aria-label="Mobile speed score ${s.speedM} out of 100"><span aria-hidden="true">${s.speedM}</span></span><small aria-hidden="true">Mobile</small></span><span class="score-w"><span class="score" style="--v:${s.speedD}" role="img" aria-label="Desktop speed score ${s.speedD} out of 100"><span aria-hidden="true">${s.speedD}</span></span><small aria-hidden="true">Desktop</small></span><div style="flex:1;min-width:150px"><b style="font-size:13.5px">${s.id === "corp" ? "Enquiry forms" : "Waitlist & stockist forms"}</b><div class="big-n" style="font-size:22px">${num(forms)} <span class="delta up" style="font-size:12px">${ic("trendUp", "sm")}${pct(((forms - s.formsPrev) / s.formsPrev) * 100, 0)}</span></div><small class="faint">Submissions, last 30 days vs previous 30</small></div></div></section>
        <section class="card" aria-label="Top keywords, ${esc(s.name)}"><div class="card-h"><h3 id="kw-${s.id}">Top keywords</h3><span class="sub">Google Search Console · position</span></div><div class="tbl-wrap"><table class="tbl kw"><thead><tr><th>Keyword</th><th class="r">Rank</th><th class="r">Change</th></tr></thead><tbody>${s.keywords.map(([k, r, prev]) => { const d = prev - r; return `<tr><td>${esc(k)}</td><td class="r"><span class="rank ${r <= 3 ? "top" : ""}">${r}</span></td><td class="r"><span class="mv ${d > 0 ? "up" : d < 0 ? "down" : "flat"}">${d > 0 ? ic("up") + d : d < 0 ? ic("down") + -d : "—"}</span><span class="sr-only">${d > 0 ? "up " + d : d < 0 ? "down " + -d : "no change"}</span></td></tr>`; }).join("")}</tbody></table></div></section>
        <section class="card" aria-label="SEO tasks, ${esc(s.name)}"><div class="card-h"><div><h3 id="tk-${s.id}">SEO tasks this month</h3><span class="sub">2 new pages per site, plus fixes</span></div><span class="sub tnum" data-tc="${s.id}">${done.filter(Boolean).length}/${done.length}</span></div><div class="card-b flush"><div class="list">${s.tasks.map(([t], i) => `<div class="li task" role="checkbox" tabindex="0" aria-checked="${done[i]}" data-site="${s.id}" data-i="${i}"><span class="check">${ic("check")}</span><div class="grow"><div class="t" style="white-space:normal">${esc(t)}</div></div>${/^New page/.test(t) ? `<span class="tag">New page</span>` : ""}</div>`).join("")}</div></div>
          <div class="card-f" style="display:block"><b style="color:var(--ink);font-size:12.5px">Recent changes</b><div class="list" style="margin-top:6px">${s.changes.map(([d, t]) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0"><span class="muted">${esc(t)}</span><span class="when">${relH(d)}</span></div>`).join("")}</div></div></section>
      </div>`;
    };
    el.innerHTML = `<div class="page-head"><div><h1>Websites</h1><p>Both sites are monitored, optimised and extended every month.</p></div><div class="actions"><button class="btn btn-s" id="wsRun">${ic("gauge")}Run speed test</button></div></div><div class="grid g-2 keep-1">${L.SITES.map(block).join("")}</div>`;
    $$(".task[data-site]", el).forEach((row) => { const flip = () => { const arr = S.siteTasks[row.dataset.site]; const i = +row.dataset.i; arr[i] = !arr[i]; save(); row.setAttribute("aria-checked", String(arr[i])); $(`[data-tc="${row.dataset.site}"]`, el).textContent = arr.filter(Boolean).length + "/" + arr.length; if (arr[i]) toast("SEO task done"); }; row.addEventListener("click", flip); row.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } }); });
    $("#wsRun", el).addEventListener("click", (e) => { const b = e.currentTarget; b.disabled = true; b.lastChild.textContent = "Testing…"; setTimeout(() => { b.disabled = false; b.lastChild.textContent = "Run speed test"; toast("Speed test complete · both sites pass Core Web Vitals", { icon: "gauge" }); }, 1400); });
  };

  /* ---------- Analytics ---------- */
  VIEWS.analytics = function (el) {
    const CH = ["Organic search", "Paid social", "Direct", "Paid search", "Referral", "Email & outbound", "WhatsApp"];
    const SH = { corp: [0.44, 0.04, 0.18, 0.15, 0.08, 0.07, 0.04], pb: [0.12, 0.46, 0.16, 0.02, 0.06, 0.03, 0.15] };
    const RANGES = [[7, "7 days"], [30, "30 days"], [90, "90 days"], [365, "12 months"]];
    el.innerHTML = `<div class="page-head"><div><h1>Analytics</h1><p>Traffic and conversions from GA4 and Search Console for both websites, joined with the CRM.</p></div>
      <div class="actions"><div class="seg" role="group" aria-label="Website" id="aSite">${[["all", "All sites"], ["corp", "Corporate"], ["pb", "Pina Boosta"]].map(([k, l]) => `<button type="button" data-s="${k}" aria-pressed="${UI.site === k}">${l}</button>`).join("")}</div><div class="seg" role="group" aria-label="Date range" id="aRange">${RANGES.map(([k, l]) => `<button type="button" data-r="${k}" aria-pressed="${UI.range === k}">${l}</button>`).join("")}</div></div></div>
      <div id="aBody"></div>`;
    const sum = (a) => a.reduce((s, v) => s + v, 0);
    /* CRM side of the funnel: deals that came in through a website, in this range */
    function crm(range, site) {
      const divOk = (d) => site === "all" || (site === "pb" ? d.div === "bev" : d.div !== "bev");
      const web = S.deals.filter((d) => L.WEB_SOURCES.includes(d.src) && divOk(d));
      const inRange = (iso) => daysFrom(iso) > -range && daysFrom(iso) <= 0;
      const won = web.filter((d) => d.stage === "Won" && inRange(d.close));
      const qual = web.filter((d) => d.stage !== "Lead" && d.stage !== "Lost" && (inRange(d.created) || won.includes(d)));
      return { qual: qual.length, won: won.length };
    }
    function draw() {
      $$("#aSite button", el).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === UI.site)));
      $$("#aRange button", el).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.r === UI.range)));
      if (!RANGES.some(([k]) => k === UI.range)) UI.range = 30;
      let pts = L.analytics(UI.range, UI.site);
      const all = { corp: sum(pts.map((p) => p.corp)), pb: sum(pts.map((p) => p.pb)), corpConv: sum(pts.map((p) => p.corpConv)), pbConv: sum(pts.map((p) => p.pbConv)) };
      if (UI.range === 365) {
        const g = {}; pts.forEach((p) => { const d0 = dt(p.d), k = d0.getFullYear() * 12 + d0.getMonth(); (g[k] = g[k] || { d: new Date(d0.getFullYear(), d0.getMonth(), 1).toISOString(), corp: 0, pb: 0, conv: 0 }); g[k].corp += p.corp; g[k].pb += p.pb; g[k].conv += p.conv; }); pts = Object.keys(g).sort((x, y) => x - y).map((k) => g[k]);
      }
      const labels = pts.map((p) => p.d), corp = pts.map((p) => p.corp), pb = pts.map((p) => p.pb), conv = pts.map((p) => p.conv);
      const sess = UI.site === "corp" ? all.corp : UI.site === "pb" ? all.pb : all.corp + all.pb;
      const cv = UI.site === "corp" ? all.corpConv : UI.site === "pb" ? all.pbConv : all.corpConv + all.pbConv;
      const prev = L.analyticsPrev(UI.range);
      const prevSess = prev ? sum(prev.map((p) => (UI.site !== "pb" ? p.corp : 0) + (UI.site !== "corp" ? p.pb : 0))) : 0;
      const sessNote = prev && prevSess ? `${sess >= prevSess ? "+" : "−"}${pct(Math.abs((sess - prevSess) / prevSess) * 100, 0)} vs previous ${UI.range} days` : UI.site === "corp" ? "Last 12 months" : "Since Pina Boosta went live";
      const { qual, won } = crm(UI.range, UI.site);
      const xf = UI.range === 365 ? (d) => MON[dt(d).getMonth()] : fdate;
      const tt = UI.range === 365 ? (d) => dt(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : (d) => dt(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
      const chan = CH.map((c, i) => ({ label: c, value: Math.round((UI.site !== "pb" ? all.corp * SH.corp[i] : 0) + (UI.site !== "corp" ? all.pb * SH.pb[i] : 0)) })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
      const rangeTxt = UI.range === 365 ? "last 12 months" : "last " + UI.range + " days";
      const sites = [["corp", "Corporate · logs-agri.com", all.corp, all.corpConv, "Organic search"], ["pb", "Pina Boosta · domain TBC", all.pb, all.pbConv, "Paid social"]].filter((r) => UI.site === "all" || r[0] === UI.site);
      $("#aBody", el).innerHTML = `<div class="stat-row">${[["Sessions", num(sess), sessNote], [UI.site === "pb" ? "Waitlist sign-ups" : "Conversions", num(cv), UI.site === "pb" ? "Batch 001 waitlist" : "Forms, WhatsApp clicks, sign-ups"], ["Conversion rate", pct(sess ? (cv / sess) * 100 : 0, 2), "Sessions to conversion"], ["Won from web", num(won), won === 1 ? "Deal won from a website lead" : "Deals won from website leads"]].map(([l, v, s]) => `<div class="card stat"><small>${l}</small><b>${v}</b><em>${s}</em></div>`).join("")}</div>
        <div class="grid g-2">
          <section class="card" aria-labelledby="ssH"><div class="card-h"><div><h2 id="ssH">Sessions over time</h2><span class="sub">${UI.range === 365 ? "Monthly" : "Daily"} · ${rangeTxt}</span></div><div class="legend">${UI.site !== "pb" ? '<span><i style="background:var(--c-agri)"></i>Corporate</span>' : ""}${UI.site !== "corp" ? '<span><i style="background:var(--c-bev)"></i>Pina Boosta</span>' : ""}</div></div><div class="card-b"><div id="aSess" class="chart-box"></div></div></section>
          <section class="card" aria-labelledby="cvH"><div class="card-h"><div><h2 id="cvH">${UI.site === "pb" ? "Sign-ups over time" : "Conversions over time"}</h2><span class="sub">${UI.site === "pb" ? "Batch 001 waitlist" : "Enquiries and sign-ups"} · ${rangeTxt}</span></div></div><div class="card-b"><div id="aConv" class="chart-box"></div></div></section>
        </div>
        <div class="grid g-main mt">
          <section class="card" aria-labelledby="fnH"><div class="card-h"><div><h2 id="fnH">Funnel</h2><span class="sub">Visit → ${UI.site === "pb" ? "sign-up" : "enquiry"} → qualified → won · ${rangeTxt}</span></div></div><div class="card-b"><div class="funnel" id="aFun"></div>
            <div class="tbl-wrap mt"><table class="tbl cards by-site"><caption class="sr-only">By site</caption><thead><tr><th>Site</th><th class="r">Sessions</th><th class="r">${UI.site === "pb" ? "Sign-ups" : "Conversions"}</th><th class="r">Conv. rate</th><th class="r hide-l">Top channel</th></tr></thead><tbody>${sites.map(([k, n, s, c, t]) => `<tr><td class="first" data-l="Site"><span class="div-tag ${k === "corp" ? "d-agri" : "d-bev"}">${n}</span></td><td class="r" data-l="Sessions">${num(s)}</td><td class="r" data-l="Conversions">${num(c)}</td><td class="r strong" data-l="Conv. rate">${pct(s ? (c / s) * 100 : 0, 2)}</td><td class="r hide-l" data-l="Top channel">${s ? t : "—"}</td></tr>`).join("")}</tbody>${sites.length > 1 ? `<tfoot><tr><td class="first" data-l="Site"><b>Both sites</b></td><td class="r strong" data-l="Sessions">${num(sess)}</td><td class="r strong" data-l="Conversions">${num(cv)}</td><td class="r strong" data-l="Conv. rate">${pct(sess ? (cv / sess) * 100 : 0, 2)}</td><td class="r hide-l" data-l="Top channel">${chan[0] ? chan[0].label : "—"}</td></tr></tfoot>` : ""}</table></div></div></section>
          <section class="card" aria-labelledby="chH"><div class="card-h"><div><h2 id="chH">Sessions by channel</h2><span class="sub">${UI.site === "all" ? "Both sites" : UI.site === "corp" ? "logs-agri.com" : "Pina Boosta"} · ${rangeTxt}</span></div></div><div class="card-b"><div id="aCh"></div></div></section>
        </div>`;
      C.lines($("#aSess", el), { labels, height: 240, label: `Sessions over time, ${rangeTxt}`, series: [UI.site !== "pb" && { name: "Corporate", color: "var(--c-agri)", values: corp }, UI.site !== "corp" && { name: "Pina Boosta", color: "var(--c-bev)", values: pb }].filter(Boolean), format: num, axis: compact, xfmt: xf, tipTitle: tt });
      C.lines($("#aConv", el), { labels, height: 240, label: `${UI.site === "pb" ? "Waitlist sign-ups" : "Conversions"} over time, ${rangeTxt}`, series: [{ name: UI.site === "pb" ? "Sign-ups" : "Conversions", color: "var(--c-mag)", area: true, values: conv }], format: num, axis: compact, xfmt: xf, tipTitle: tt });
      C.hbars($("#aCh", el), { items: chan, color: "var(--c-mag)", format: num, unit: "Sessions", label: `Sessions by channel, ${rangeTxt}`, rowHead: "Channel", labelWidth: 132, valueWidth: 60, rowH: window.innerWidth > 1100 ? 44 : 34 });
      const steps = [["Visits", sess], [UI.site === "pb" ? "Sign-ups" : "Enquiries", cv], ["Qualified", qual], ["Won", won]];
      $("#aFun", el).innerHTML = `<ol class="fun-grid" aria-label="Funnel, ${rangeTxt}">${steps.map(([l, v], i) => `<li class="fun-step"><small>${l}</small><b>${num(v)}</b><div class="bar" aria-hidden="true"><i style="width:${v ? Math.max(3, Math.sqrt(v / Math.max(1, steps[0][1])) * 100) : 0}%"></i></div>${i ? `<span class="fun-rate">${steps[i - 1][1] ? (() => { const r = (v / steps[i - 1][1]) * 100; return pct(r, r && r < 1 ? 2 : r < 10 ? 1 : 0); })() : "—"} of ${steps[i - 1][0].toLowerCase()}</span>` : `<span class="fun-rate">All sessions</span>`}</li>`).join(`<li class="fun-arrow" aria-hidden="true">${ic("chev")}</li>`)}</ol><p class="faint" style="font-size:12px;margin-top:10px">Qualified and won are deals in the pipeline that came from a website form or ad. Bars use a square-root scale so the small stages stay visible.</p>`;
    }
    $$("#aSite button", el).forEach((b) => b.addEventListener("click", () => { UI.site = b.dataset.s; saveUI(); draw(); announce("Showing " + b.textContent); }));
    $$("#aRange button", el).forEach((b) => b.addEventListener("click", () => { UI.range = +b.dataset.r; saveUI(); draw(); announce("Range " + b.textContent); }));
    draw();
  };

  /* ---------- Estates & café ---------- */
  VIEWS.estates = function (el) {
    const tours = S.tours, shop = S.shop;
    const cafe14 = L.CAFE.reduce((s, d) => s + d.v, 0);
    const isWe = (d) => [0, 6].includes(dt(d.d).getDay()), avg = (a) => a.reduce((s, d) => s + d.v, 0) / Math.max(1, a.length);
    const weAvg = avg(L.CAFE.filter(isWe)), wdAvg = avg(L.CAFE.filter((d) => !isWe(d))), best = L.CAFE.reduce((a, d) => (d.v > a.v ? d : a));
    const TS = { Confirmed: "good", Open: "info", "Deposit due": "warn", Tentative: "" };
    function draw() {
      el.innerHTML = `<div class="page-head"><div><div class="eyebrow">${divTag("estates")}</div><h1>Estates & café</h1><p>Pontian pineapple estate: tours, the farm café and the farm shop.</p></div><div class="actions"><button class="btn btn-p" id="eNew">${ic("plus")}New booking</button></div></div>
        <div class="stat-row">${[["Tours · next 30 days", tours.length, tours.filter((t) => t.status === "Confirmed").length + " confirmed"], ["Visitors booked", num(tours.reduce((s, t) => s + t.pax, 0)), "Schools, agencies, families"], ["Café sales · 14 days", rm0(cafe14), "Weekends are " + (weAvg / wdAvg).toFixed(1) + "× weekdays"], ["Farm-shop stock alerts", shop.filter((s) => s.stock <= 15).length, "Low or out of stock"]].map(([l, v, s]) => `<div class="card stat"><small>${l}</small><b>${v}</b><em>${s}</em></div>`).join("")}</div>
        <div class="grid g-main">
          <section class="card" aria-labelledby="cfH"><div class="card-h"><div><h2 id="cfH">Café sales by day</h2><span class="sub">Last 14 days · POS sync</span></div></div><div class="card-b"><div id="cafeChart" class="chart-box"></div><div class="mini-stats"><div><small>Weekday average</small><b>${rm(wdAvg)}</b></div><div><small>Weekend average</small><b>${rm(weAvg)}</b></div><div><small>Best day</small><b>${dt(best.d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${rm(best.v)}</b></div></div></div></section>
          <section class="card" aria-labelledby="trH"><div class="card-h"><h2 id="trH">Tour bookings</h2><span class="sub">${rm0(tours.reduce((s, t) => s + t.value, 0))} booked</span></div><div class="list">${tours.map((t) => `<div class="li"><span class="date-tile"><small>${fday(t.date)}</small><b>${dt(t.date).getDate()}</b></span><div class="grow"><div class="t">${esc(t.group)}</div><div class="s">${t.pax} pax · ${esc(t.pkg)}</div><div class="s tour-v"><b class="tnum">${rm(t.value)}</b>${t.status !== "Confirmed" ? " · " + esc(t.status) : ""}</div></div>${t.status === "Confirmed" ? `<span class="pill good">Confirmed</span>` : `<button type="button" class="btn btn-s btn-xs" data-tour="${t.id}" aria-label="Confirm booking: ${esc(t.group)}">${ic("check", "sm")}Confirm</button>`}</div>`).join("")}</div></section>
        </div>
        <section class="card mt" aria-labelledby="fsH"><div class="card-h"><div><h2 id="fsH">Farm-shop items</h2><span class="sub">Stock and sales this week</span></div></div><div class="tbl-wrap"><table class="tbl cards"><thead><tr><th>Item</th><th class="r">Price</th><th class="r">Sold · week</th><th class="r">Revenue</th><th>Stock</th><th class="r"><span class="sr-only">Actions</span></th></tr></thead><tbody>${shop.map((s) => `<tr><td class="first" data-l="Item"><b style="font-weight:600">${esc(s.name)}</b> <span class="faint mono">${s.sku}</span></td><td class="r" data-l="Price">${rm(s.price)}</td><td class="r" data-l="Sold">${num(s.sold)}</td><td class="r strong" data-l="Revenue">${rm(s.price * s.sold)}</td><td data-l="Stock"><span class="pill ${s.stock === 0 ? "crit" : s.stock <= 15 ? "warn" : "good"}">${s.stock === 0 ? "Out of stock" : s.stock <= 15 ? "Low · " + s.stock : s.stock + " in stock"}</span></td><td class="r" data-l=""><button class="btn btn-s btn-xs" data-restock="${s.sku}">${ic("refresh", "sm")}Restock</button></td></tr>`).join("")}</tbody></table></div></section>`;
      C.bars($("#cafeChart", el), { labels: L.CAFE.map((d) => dt(d.d).getDate() + ""), height: 262, label: "Café sales by day, last 14 days", rowHead: "Day", series: [{ name: "Café sales", color: "var(--c-estates)", values: L.CAFE.map((d) => d.v) }], format: rm, axis: rmc, tipTitle: (i) => dt(L.CAFE[i].d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }) });
      $$("[data-tour]", el).forEach((b) => b.addEventListener("click", () => { const t = tours.find((x) => x.id === b.dataset.tour); t.status = "Confirmed"; save(); draw(); toast(`${esc(t.group)} confirmed · WhatsApp confirmation sent (demo)`); }));
      $$("[data-restock]", el).forEach((b) => b.addEventListener("click", () => { const s = shop.find((x) => x.sku === b.dataset.restock); s.stock += 48; save(); draw(); toast(`${esc(s.name)} restocked +48`, { icon: "box" }); }));
      $("#eNew", el).addEventListener("click", () => toast("Booking form opens here; customers can also book on the website", { icon: "calendar" }));
    }
    draw();
  };

  /* ---------- Settings ---------- */
  VIEWS.settings = function (el) {
    const LOGO = { wa: ["#15803d", "WA"], gw: ["#2f6bd8", "G"], gsc: ["#5f6368", "SC"], ga4: ["#b35c00", "GA"], meta: ["#0866ff", "M"], myinv: ["#123a22", "MI"] };
    el.innerHTML = `<div class="page-head"><div><h1>Settings</h1><p>Company profile, users and roles, integrations and appearance.</p></div></div>
      <div class="grid g-main">
        <div class="stack">
          <section class="card" aria-labelledby="usH"><div class="card-h"><div><h2 id="usH">Users & roles</h2><span class="sub">Roles decide what each person can see and approve</span></div><button class="btn btn-s btn-sm" id="uInv">${ic("plus")}Invite user</button></div><div class="tbl-wrap"><table class="tbl cards" id="uTbl"></table></div></section>
          <section class="card" aria-labelledby="inH"><div class="card-h"><div><h2 id="inH">Integrations</h2><span class="sub">Connect the tools Logsco already uses</span></div></div><div class="card-b"><div class="int-grid">${S.integrations.map((g) => `<div class="card int"><div class="int-h"><span class="lg" style="background:${LOGO[g.id][0]}">${LOGO[g.id][1]}</span><b>${esc(g.name)}</b></div><p>${esc(g.desc)}</p><div class="int-f"><span data-ist="${g.id}">${intState(g)}</span><button class="switch" role="switch" aria-checked="${g.on}" data-int="${g.id}" aria-label="Connect ${esc(g.name)}"></button></div></div>`).join("")}</div></div></section>
        </div>
        <div class="stack">
          <section class="card" aria-labelledby="cpH"><div class="card-h"><h2 id="cpH">Company</h2></div><div class="card-b"><div style="display:flex;gap:12px;align-items:center;margin-bottom:14px"><img src="assets/mark.png" alt="" style="width:30px"><div><b>Logsco Agri Technology Sdn. Bhd.</b><div class="faint" style="font-size:12.5px">Part of Logsco Sdn. Bhd. · est. 2025</div></div></div><dl class="kv"><div><dt>SSM</dt><dd class="mono">202501040607</dd></div><div><dt>Registration</dt><dd><span class="pill good">MOF registered</span></dd></div><div><dt>Address</dt><dd>Masai, Johor</dd></div><div><dt>Currency</dt><dd>RM (MYR)</dd></div><div><dt>Invoice prefix</dt><dd class="mono">LAT-INV-26-</dd></div><div><dt><label for="sstDef">Default SST</label></dt><dd><select class="select" id="sstDef" style="width:100%">${SST_RATES.map((r) => `<option value="${r}" ${r === (UI.sst != null ? UI.sst : 8) ? "selected" : ""}>${r}%</option>`).join("")}</select></dd></div></dl><p class="faint" style="font-size:12px">SST rate and registration number are configurable. Confirm both with your tax adviser before going live.</p></div></section>
          <section class="card" aria-labelledby="apH"><div class="card-h"><h2 id="apH">Appearance</h2></div><div class="card-b" style="display:grid;gap:14px"><div class="seg" role="group" aria-label="Theme" id="thSeg">${[["", "System"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => `<button type="button" data-th="${k}" aria-pressed="${(UI.theme || "") === k}">${l}</button>`).join("")}</div><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span>Compact sidebar</span><button class="switch" role="switch" aria-checked="${UI.collapsed}" id="colSw" aria-label="Compact sidebar"></button></div></div></section>
          <section class="card" aria-labelledby="dmH"><div class="card-h"><h2 id="dmH">Demo data</h2></div><div class="card-b"><p class="muted" style="font-size:13px;margin-bottom:12px">Everything in this demo is fictional sample data. Changes are kept in this browser only.</p><button class="btn btn-d" id="resetBtn">${ic("refresh")}Reset demo data</button></div></section>
        </div>
      </div>`;
    function users() {
      $("#uTbl", el).innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${S.users.map((u, i) => `<tr><td class="first" data-l="Name"><span class="co">${av(u.name)}<b>${esc(u.name)}</b></span></td><td data-l="Email" class="muted">${esc(u.email)}</td><td data-l="Role"><label class="sr-only" for="ur-${i}">Role for ${esc(u.name)}</label><select class="select status-sel" id="ur-${i}" data-u="${i}" ${u.role === "Owner" ? "disabled" : ""}>${["Owner", "Admin", "Finance", "Manager", "Sales", "Technician", "Viewer"].map((r) => `<option ${u.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></td></tr>`).join("")}</tbody>`;
      $$("[data-u]", el).forEach((s) => s.addEventListener("change", () => { S.users[+s.dataset.u].role = s.value; save(); toast(`${esc(S.users[+s.dataset.u].name)} is now ${s.value}`, { icon: "shield" }); }));
    }
    users();
    $$("[data-int]", el).forEach((b) => b.addEventListener("click", () => {
      const g = S.integrations.find((x) => x.id === b.dataset.int); g.on = !g.on; b.setAttribute("aria-checked", String(g.on)); $(`[data-ist="${g.id}"]`, el).innerHTML = intState(g); save();
      toast(g.planned ? (g.on ? "MyInvois added to the build plan (planned integration)" : "MyInvois removed from the plan") : `${esc(g.name)} ${g.on ? "connected" : "disconnected"} (demo)`, { icon: g.on ? "link" : "x" });
    }));
    $$("[data-th]", el).forEach((b) => b.addEventListener("click", () => { setTheme(b.dataset.th || null); $$("[data-th]", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
    $("#colSw", el).addEventListener("click", (e) => { setCollapsed(!UI.collapsed); e.currentTarget.setAttribute("aria-checked", String(UI.collapsed)); });
    $("#resetBtn", el).addEventListener("click", resetDemo);
    $("#sstDef", el).addEventListener("change", (e) => { UI.sst = +e.target.value; saveUI(); toast("Default SST for new invoices set to " + UI.sst + "%"); });
    $("#uInv", el).addEventListener("click", () => {
      const lay = openLayer("modal", drawerShell({ title: "Invite user", sub: "They get a Google Workspace sign-in link.", body: `<div class="form-grid" style="grid-template-columns:1fr"><div class="field"><label for="iu-n">Name</label><input class="input" id="iu-n" autofocus placeholder="Full name"></div><div class="field"><label for="iu-e">Work email</label><input class="input" id="iu-e" type="email" placeholder="name@logs-agri.example"></div><div class="field"><label for="iu-r">Role</label><select class="select" id="iu-r"><option>Sales</option><option>Technician</option><option>Finance</option><option>Manager</option><option>Viewer</option></select></div></div>`, foot: `<button class="btn btn-g" data-close>Cancel</button><button class="btn btn-p" id="iu-s">${ic("send")}Send invite</button>` }), { cls: "sm", label: "Invite user" });
      $("#iu-s", lay.panel).addEventListener("click", () => { const n = $("#iu-n", lay.panel).value.trim(); if (!n) { $("#iu-n", lay.panel).focus(); return; } S.users.push({ name: n, email: $("#iu-e", lay.panel).value || n.toLowerCase().split(" ")[0] + "@logs-agri.example", role: $("#iu-r", lay.panel).value }); save(); lay.close(); users(); toast(`Invite sent to ${esc(n)} (demo)`, { icon: "send" }); });
    });
  };
  const intState = (g) => g.planned ? `<span class="pill plan nodot">${g.on ? "Planned · in build plan" : "Planned integration"}</span>` : g.on ? `<span class="pill good">Connected</span>` : `<span class="pill nodot">Not connected</span>`;
  function resetDemo() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } toast("Demo data reset", { icon: "refresh" }); setTimeout(() => location.reload(), 500); }

  /* ---------------- command palette ---------------- */
  function openPalette() {
    if (layers.some((l) => l.kind === "palette")) return;
    closeAll();
    const lay = openLayer("palette", `<div class="pal-in">${ic("search")}<input id="palq" type="text" role="combobox" aria-expanded="true" aria-controls="pall" aria-autocomplete="list" aria-label="Search or jump to" placeholder="Search deals, companies, invoices, people… or jump to a page" autocomplete="off" autofocus><kbd>Esc</kbd></div><div class="pal-list" id="pall" role="listbox" aria-label="Results"></div><div class="pal-f"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span></div>`, { label: "Command palette" });
    const p = lay.panel, inp = $("#palq", p), list = $("#pall", p); let items = [], sel = 0;
    const run = (fn) => { lay.close(); setTimeout(fn, 60); };
    const nav = ROUTES.map((r) => ({ g: "Go to", icon: r.icon, label: r.title, hint: "Page", fn: () => go(r.id) }));
    const actions = [
      { g: "Actions", icon: "invoice", label: "New invoice", hint: "Invoicing", fn: () => newInvoiceModal() },
      { g: "Actions", icon: "pipeline", label: "New deal", hint: "Pipeline", fn: () => newDealModal() },
      { g: "Actions", icon: "moon", label: "Toggle dark mode", hint: "Appearance", fn: toggleTheme },
      { g: "Actions", icon: "sidebar", label: UI.collapsed ? "Expand sidebar" : "Collapse sidebar", hint: "Layout", fn: () => setCollapsed(!UI.collapsed) },
      { g: "Actions", icon: "refresh", label: "Reset demo data", hint: "Demo", fn: resetDemo }
    ];
    function build(q) {
      q = q.trim().toLowerCase();
      if (!q) return actions.concat(nav);
      const m = (s) => s.toLowerCase().includes(q);
      const out = nav.filter((x) => m(x.label)).concat(actions.filter((x) => m(x.label)));
      S.deals.filter((d) => m(d.title) || m(CO[d.co].name)).slice(0, 5).forEach((d) => out.push({ g: "Deals", icon: "target", label: d.title + " · " + CO[d.co].name, hint: rmc(d.value) + " · " + d.stage, fn: () => go("pipeline", () => openDeal(d.id, S._redrawPipe)) }));
      L.COMPANIES.filter((c) => m(c.name) || m(c.contact)).slice(0, 5).forEach((c) => out.push({ g: "Companies", icon: "building", label: c.name, hint: c.contact, fn: () => go("contacts", () => openCompany(c.id)) }));
      S.invoices.filter((i) => m(i.id) || m(CO[i.co].name)).slice(0, 5).forEach((i) => out.push({ g: "Invoices", icon: "invoice", label: i.id + " · " + CO[i.co].name, hint: rm(invTotal(i)), fn: () => go("invoicing", () => openInvoice(i.id)) }));
      L.STAFF.filter((s) => m(s.name) || m(s.role)).slice(0, 4).forEach((s) => out.push({ g: "People", icon: "users", label: s.name, hint: s.role, fn: () => go("staff") }));
      return out;
    }
    function draw() {
      items = build(inp.value); sel = Math.min(sel, Math.max(0, items.length - 1)); let g = "";
      list.innerHTML = items.length ? items.map((it, i) => { const head = it.g !== g ? `<div class="pal-g" role="presentation">${it.g}</div>` : ""; g = it.g; return head + `<button type="button" class="pal-o" role="option" id="po-${i}" data-i="${i}" aria-selected="${i === sel}">${ic(it.icon)}<span>${esc(it.label)}</span><small>${esc(it.hint)}</small></button>`; }).join("") : `<div class="empty" style="padding:28px">${ic("search")}<b>No results for “${esc(inp.value)}”</b><p>Try a company, deal, invoice number or page name.</p></div>`;
      inp.setAttribute("aria-activedescendant", items.length ? "po-" + sel : "");
      $$(".pal-o", list).forEach((b) => { b.addEventListener("click", () => run(items[+b.dataset.i].fn)); b.addEventListener("mousemove", () => { if (sel !== +b.dataset.i) { sel = +b.dataset.i; mark(); } }); });
    }
    function mark() { $$(".pal-o", list).forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.i === sel))); inp.setAttribute("aria-activedescendant", "po-" + sel); const s = $(`#po-${sel}`, list); if (s) s.scrollIntoView({ block: "nearest" }); }
    inp.addEventListener("input", () => { sel = 0; draw(); });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, items.length); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(1, items.length); mark(); }
      else if (e.key === "Enter") { e.preventDefault(); if (items[sel]) run(items[sel].fn); }
    });
    draw();
  }

  /* ---------------- boot ---------------- */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $("#kbdHint").textContent = isMac ? "⌘K" : "Ctrl K";
  $("#searchBtn").setAttribute("aria-label", "Search or jump to (" + (isMac ? "Command" : "Control") + " K)");
  $("#searchBtn").addEventListener("click", openPalette);
  $("#themeBtn").addEventListener("click", toggleTheme);
  $("#collapse").addEventListener("click", () => setCollapsed(!UI.collapsed));
  $("#menuBtn").addEventListener("click", openSide);
  $("#sideClose").addEventListener("click", closeSide);
  scrim.addEventListener("click", closeSide);
  $("#nav").addEventListener("click", (e) => { if (e.target.closest("a") && window.innerWidth <= 860) closeSide(); });
  $("#bellBtn").addEventListener("click", (e) => { e.stopPropagation(); togglePop($("#bellBtn"), $("#notif")); });
  $("#userBtn").addEventListener("click", (e) => { e.stopPropagation(); togglePop($("#userBtn"), $("#usermenu")); });
  $("#usermenu").addEventListener("click", (e) => { const a = e.target.closest("[data-act]"); if (a) { closePops(); a.dataset.act === "theme" ? toggleTheme() : resetDemo(); } else if (e.target.closest("a")) closePops(); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".pop-wrap")) closePops(); });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
    const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
    if (e.key === "/" && !typing && !layers.length) { e.preventDefault(); openPalette(); }
    if (e.key === "Escape" && !layers.length) { const open = $$(".popover").find((x) => !x.hidden); closePops(); if (open) { const b = open.previousElementSibling; if (b) b.focus(); } closeSide(); }
  });
  side.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSide(); });
  window.addEventListener("hashchange", () => route());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncThemeBtn);
  if (UI.collapsed) setCollapsed(true);
  syncThemeBtn(); renderNotifs(); current = null; renderNav();
  if (!location.hash) history.replaceState(null, "", "#/overview");
  route(true);
})();
