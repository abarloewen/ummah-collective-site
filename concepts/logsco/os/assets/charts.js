/* Logsco OS · hand-made SVG charts (no library). Colours come from CSS custom properties,
   so light/dark mode switches without re-rendering. Each chart re-renders on container resize. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  let tip;
  function getTip() {
    if (!tip) { tip = document.createElement("div"); tip.className = "chart-tip"; tip.setAttribute("role", "status"); document.body.appendChild(tip); }
    return tip;
  }
  function showTip(html, x, y) {
    const t = getTip(); t.innerHTML = html; t.classList.add("on");
    const w = t.offsetWidth, h = t.offsetHeight;
    let left = x + 14, top = y - h - 10;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (left < 8) left = 8;
    if (top < 8) top = y + 16;
    t.style.transform = `translate(${Math.round(left)}px,${Math.round(top)}px)`;
  }
  function hideTip() { if (tip) tip.classList.remove("on"); }

  function niceMax(v, ticks) {
    if (v <= 0) return { max: ticks, step: 1 };
    const raw = v / ticks; const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag; const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
    return { max: step * Math.ceil(v / step), step };
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  /* rect with rounded top corners only (data end), square at the baseline */
  function topRounded(x, y, w, h, r) {
    if (h <= 0) return "";
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  function rightRounded(x, y, w, h, r) {
    if (w <= 0) return "";
    r = Math.min(r, h / 2, w);
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }

  const registry = new WeakMap();
  const ro = "ResizeObserver" in window ? new ResizeObserver((entries) => {
    entries.forEach((e) => {
      const rec = registry.get(e.target); if (!rec) return;
      const w = Math.round(e.contentRect.width);
      if (w && w !== rec.w) { rec.w = w; rec.fn(); }
    });
  }) : null;
  function mount(el, draw) {
    const fn = () => { el.innerHTML = ""; draw(Math.max(el.clientWidth, 240)); };
    registry.set(el, { fn, w: el.clientWidth }); fn();
    if (ro) ro.observe(el);
  }

  /* grouped/stacked vertical bars */
  function bars(el, o) {
    mount(el, (W) => {
      const H = o.height || 240, padL = 52, padR = 8, padT = 12, padB = 26;
      const iw = W - padL - padR, ih = H - padT - padB;
      const n = o.labels.length, series = o.series;
      const totals = o.labels.map((_, i) => series.reduce((s, se) => s + (se.values[i] || 0), 0));
      const peak = o.stacked ? Math.max(...totals) : Math.max(...series.flatMap((s) => s.values));
      const { max, step } = niceMax(peak * 1.05, 4);
      const band = iw / n; const bw = Math.min(o.stacked ? 34 : 22, band * (o.stacked ? 0.56 : 0.7 / series.length));
      const y = (v) => padT + ih - (v / max) * ih;
      let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.label || "Bar chart")}">`;
      for (let v = 0; v <= max + 1e-9; v += step) {
        s += `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${padL - 8}" y="${y(v) + 4}" text-anchor="end">${esc(o.axis ? o.axis(v) : v)}</text>`;
      }
      o.labels.forEach((lab, i) => {
        const cx = padL + band * i + band / 2;
        s += `<text class="ax" x="${cx}" y="${H - 6}" text-anchor="middle">${esc(lab)}</text>`;
        if (o.stacked) {
          let acc = 0; const visible = series.filter((se) => se.values[i] > 0);
          visible.forEach((se, k) => {
            const v = se.values[i]; const y0 = y(acc), y1 = y(acc + v); acc += v;
            const gap = k > 0 ? 2 : 0; const h = Math.max(0, y0 - y1 - gap);
            const d = k === visible.length - 1 ? topRounded(cx - bw / 2, y1, bw, h, 4) : `M${cx - bw / 2},${y1}h${bw}v${h}h${-bw}Z`;
            s += `<path d="${d}" style="fill:${se.color}" class="mark"/>`;
          });
        } else {
          series.forEach((se, k) => {
            const v = se.values[i]; const x = cx - (bw * series.length + 2 * (series.length - 1)) / 2 + k * (bw + 2);
            s += `<path d="${topRounded(x, y(v), bw, y(0) - y(v), 4)}" style="fill:${se.color}" class="mark"/>`;
          });
        }
        s += `<rect class="hit" x="${padL + band * i}" y="${padT}" width="${band}" height="${ih}" data-i="${i}" tabindex="-1"/>`;
      });
      s += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/></svg>`;
      el.innerHTML = s;
      el.querySelectorAll(".hit").forEach((r) => {
        const i = +r.dataset.i;
        const html = () => `<b>${esc(o.tipTitle ? o.tipTitle(i) : o.labels[i])}</b>` + series.map((se) => `<div class="tr"><i style="background:${se.color}"></i><span>${esc(se.name)}</span><em>${esc(o.format(se.values[i]))}</em></div>`).join("") + (o.stacked && series.length > 1 ? `<div class="tr tot"><span>Total</span><em>${esc(o.format(totals[i]))}</em></div>` : "");
        r.addEventListener("pointermove", (e) => { r.classList.add("on"); showTip(html(), e.clientX, e.clientY); });
        r.addEventListener("pointerleave", () => { r.classList.remove("on"); hideTip(); });
      });
    });
  }

  /* horizontal bars, one series, sorted by caller */
  function hbars(el, o) {
    mount(el, (W) => {
      const rowH = o.rowH || 30, labW = Math.min(o.labelWidth || 120, W * 0.4), valW = o.valueWidth || 64;
      const H = o.items.length * rowH; const iw = W - labW - valW - 8;
      const max = Math.max(...o.items.map((d) => d.value), 1);
      let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.label || "Bar chart")}">`;
      o.items.forEach((d, i) => {
        const y = i * rowH, bh = Math.min(14, rowH - 12), w = Math.max(d.value > 0 ? 3 : 0, (d.value / max) * iw);
        s += `<text class="lab" x="0" y="${y + rowH / 2 + 4}">${esc(d.label)}</text>`;
        s += `<rect class="track" x="${labW}" y="${y + (rowH - bh) / 2}" width="${iw}" height="${bh}" rx="3"/>`;
        s += `<path class="mark" d="${rightRounded(labW, y + (rowH - bh) / 2, w, bh, 4)}" style="fill:${d.color || o.color}"/>`;
        s += `<text class="val" x="${W}" y="${y + rowH / 2 + 4}" text-anchor="end">${esc(o.format(d.value))}</text>`;
        s += `<rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}" data-i="${i}"/>`;
      });
      s += "</svg>"; el.innerHTML = s;
      el.querySelectorAll(".hit").forEach((r) => {
        const d = o.items[+r.dataset.i];
        r.addEventListener("pointermove", (e) => showTip(`<b>${esc(d.label)}</b><div class="tr"><span>${esc(o.unit || "Value")}</span><em>${esc(o.format(d.value))}</em></div>${d.note ? `<div class="tr"><span>${esc(d.note)}</span></div>` : ""}`, e.clientX, e.clientY));
        r.addEventListener("pointerleave", hideTip);
      });
    });
  }

  /* line / area chart with crosshair; keyboard: focus + arrow keys */
  function lines(el, o) {
    mount(el, (W) => {
      const H = o.height || 240, padL = 48, padR = 12, padT = 12, padB = 26;
      const iw = W - padL - padR, ih = H - padT - padB, n = o.labels.length;
      const peak = Math.max(...o.series.flatMap((s) => s.values));
      const { max, step } = niceMax(peak * 1.08, 4);
      const x = (i) => padL + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
      const y = (v) => padT + ih - (v / max) * ih;
      let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.label || "Line chart")}" tabindex="0">`;
      s += `<defs>${o.series.map((se, k) => `<linearGradient id="${el.id || "g"}-a${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${se.color};stop-opacity:.22"/><stop offset="1" style="stop-color:${se.color};stop-opacity:0"/></linearGradient>`).join("")}</defs>`;
      for (let v = 0; v <= max + 1e-9; v += step) s += `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${padL - 8}" y="${y(v) + 4}" text-anchor="end">${esc(o.axis ? o.axis(v) : v)}</text>`;
      const every = Math.ceil(n / Math.max(2, Math.floor(iw / 70)));
      o.labels.forEach((lab, i) => { if (i % every === 0 || i === n - 1 && (n - 1) % every > every / 2) s += `<text class="ax" x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(o.xfmt ? o.xfmt(lab) : lab)}</text>`; });
      o.series.forEach((se, k) => {
        const pts = se.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
        if (se.area) s += `<path d="M${pts.join("L")}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z" style="fill:url(#${el.id || "g"}-a${k})"/>`;
        s += `<path class="line" d="M${pts.join("L")}" style="stroke:${se.color}"/>`;
      });
      s += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/>`;
      s += `<g class="xh" style="display:none"><line class="xl" y1="${padT}" y2="${padT + ih}"/>${o.series.map((se) => `<circle r="4.5" style="fill:${se.color}"/>`).join("")}</g>`;
      s += `<rect class="hit" x="${padL}" y="${padT}" width="${iw}" height="${ih}"/></svg>`;
      el.innerHTML = s;
      const svg = el.querySelector("svg"), g = svg.querySelector(".xh"), xl = g.querySelector("line"), dots = g.querySelectorAll("circle");
      let cur = -1;
      function at(i, cx, cy) {
        cur = i; g.style.display = "";
        xl.setAttribute("x1", x(i)); xl.setAttribute("x2", x(i));
        dots.forEach((c, k) => { c.setAttribute("cx", x(i)); c.setAttribute("cy", y(o.series[k].values[i])); });
        const html = `<b>${esc(o.tipTitle ? o.tipTitle(o.labels[i]) : o.labels[i])}</b>` + o.series.map((se) => `<div class="tr"><i style="background:${se.color}"></i><span>${esc(se.name)}</span><em>${esc(o.format(se.values[i]))}</em></div>`).join("");
        if (cx == null) { const r = svg.getBoundingClientRect(); cx = r.left + (x(i) / W) * r.width; cy = r.top + padT + 20; }
        showTip(html, cx, cy);
      }
      svg.querySelector(".hit").addEventListener("pointermove", (e) => {
        const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W;
        const i = Math.max(0, Math.min(n - 1, Math.round(((px - padL) / iw) * (n - 1))));
        at(i, e.clientX, e.clientY);
      });
      const off = () => { g.style.display = "none"; hideTip(); cur = -1; };
      svg.querySelector(".hit").addEventListener("pointerleave", off);
      svg.addEventListener("blur", off);
      svg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); at(Math.max(0, Math.min(n - 1, (cur < 0 ? n - 1 : cur) + (e.key === "ArrowRight" ? 1 : -1)))); }
        if (e.key === "Escape") off();
      });
    });
  }

  /* tiny sparkline string (no interaction) */
  function spark(values, color, w = 96, h = 30) {
    const max = Math.max(...values), min = Math.min(...values), rng = max - min || 1;
    const pts = values.map((v, i) => `${((i / (values.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 3 - ((v - min) / rng) * (h - 6)).toFixed(1)}`);
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="M${pts.join("L")}" style="stroke:${color}"/><circle cx="${pts[pts.length - 1].split(",")[0]}" cy="${pts[pts.length - 1].split(",")[1]}" r="2.6" style="fill:${color}"/></svg>`;
  }

  window.Charts = { bars, hbars, lines, spark, hideTip };
})();
