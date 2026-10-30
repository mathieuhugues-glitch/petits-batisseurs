/* Petits bâtisseurs - the interactive "Construis-la !" board (drag shapes onto a silhouette).
 * Builder.create(root, { buildingId, profile, placed:[slotIdx], onPlace(i), onDone(), onRotateHint() }) */
(function () {
  'use strict';
  const P = window.PB, S = () => window.PBSound || { pick() {}, snap() {}, boing() {}, rotate() {}, star() {} };
  const VB = 0.3; // viewBox margin

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function create(root, o) {
    const b = P.byId(o.buildingId), kid = o.profile === 'linnea', slots = P.variant(b, o.profile);
    const filled = new Set(o.placed || []);
    let uid = 0;
    // tray pieces
    let tray = slots.map(s => ({ uid: ++uid, type: s.type, w: s.w, h: s.h, rot: s.rot, color: s.color, x: 0, y: 0 }));
    if (!kid) {
      tray.forEach(p => { // Lovisa: some pieces start turned the wrong way (tap to rotate)
        const square = p.w === p.h && (p.type === 'rect' || p.type === 'col');
        if (!square && Math.random() < 0.5) p.rot = (p.rot + (p.type === 'rect' || p.type === 'col' ? 90 : [90, 180, 270][Math.floor(Math.random() * 3)])) % 360;
      });
      tray = tray.concat(P.decoys(b).map(d => ({ uid: ++uid, type: d.type, w: d.w, h: d.h, rot: d.rot, color: d.color, decoy: true })));
      shuffle(tray);
    }
    // remove tray pieces for slots already placed (reconnect)
    for (const i of filled) { const k = tray.findIndex(p => !p.decoy && P.fits(p, slots[i]) || (!p.decoy && P.sameShape(p, slots[i]))); if (k >= 0) tray.splice(k, 1); }

    root.innerHTML = '<div class="builder ' + (kid ? 'kid' : 'big') + '"><div class="board-wrap"><svg class="board" viewBox="' + (-VB) + ' ' + (-VB) + ' ' + (12 + 2 * VB) + ' ' + (12 + 2 * VB) + '" xmlns="http://www.w3.org/2000/svg"></svg><div class="fx"></div></div><div class="tray"></div></div>';
    const el = root.firstChild, svg = el.querySelector('.board'), trayEl = el.querySelector('.tray'), fx = el.querySelector('.fx');
    let done = false;

    function drawBoard() {
      let h = '<rect class="ground" x="-0.3" y="12" width="12.6" height="0.3"/>';
      // grid dots
      for (let x = 0; x <= 12; x += 2) for (let y = 0; y <= 12; y += 2) h += '<circle cx="' + x + '" cy="' + y + '" r="0.06" fill="rgba(80,60,140,.22)"/>';
      h += '<g class="sil">' + slots.map(s => P.shapeSvg(s, { fill: kid ? '#d9d2f2' : '#4b4470', stroke: null })).join('') + '</g>';
      if (kid) h += '<g class="hints">' + slots.filter(s => !filled.has(s.i)).map(s => P.shapeSvg(s, { fill: s.color + '55', stroke: s.color, sw: 0.14, dash: '0.35 0.25' })).join('') + '</g>';
      h += '<g class="placed">' + slots.filter(s => filled.has(s.i)).map(s => P.shapeSvg(s, { cls: 'pc' + (s.i === lastSnap ? ' snapin' : ''), detail: true })).join('') + '</g>';
      svg.innerHTML = h;
    }
    let lastSnap = -1;
    function unit() { const r = svg.getBoundingClientRect(); return r.width / (12 + 2 * VB); }
    function drawTray() {
      const u = unit(), tr = trayEl.getBoundingClientRect(), n = Math.max(tray.length, 1);
      const cell = Math.max(48, Math.min(u * 5.5, Math.sqrt((tr.width * tr.height) / n) * 0.78));
      trayEl.innerHTML = tray.map(p => {
        const e = P.eff(p), s = Math.min(u, (cell - 12) / Math.max(e.W, e.H));
        return '<div class="tp" data-uid="' + p.uid + '" style="width:' + cell + 'px;height:' + cell + 'px"><svg width="' + (e.W * s) + '" height="' + (e.H * s) + '" viewBox="-0.1 -0.1 ' + (e.W + 0.2) + ' ' + (e.H + 0.2) + '">' + P.shapeSvg(Object.assign({}, p, { x: 0, y: 0 }), { detail: true }) + '</svg>' + (!kid && !(p.w === p.h && (p.type === 'rect' || p.type === 'col')) ? '<span class="rot">↻</span>' : '') + '</div>';
      }).join('');
    }
    function layout() { drawBoard(); drawTray(); }

    function burst(x, y, n, big) { // stars at client coords
      const r = fx.getBoundingClientRect();
      for (let k = 0; k < n; k++) {
        const s = document.createElement('div'); s.className = 'spark' + (big ? ' big' : ''); s.textContent = big ? '⭐' : '✦';
        const a = Math.random() * Math.PI * 2, d = (big ? 120 : 40) + Math.random() * (big ? 160 : 50);
        s.style.left = (x - r.left) + 'px'; s.style.top = (y - r.top) + 'px'; s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        fx.appendChild(s); setTimeout(() => s.remove(), 1400);
      }
    }
    function slotCenterClient(s) { const r = svg.getBoundingClientRect(), u = unit(), e = P.eff(s); return { x: r.left + (s.x + VB + e.W / 2) * u, y: r.top + (s.y + VB + e.H / 2) * u }; }

    function place(i, fromNet) {
      if (filled.has(i)) return; filled.add(i); lastSnap = i; drawBoard();
      if (!fromNet) { const c = slotCenterClient(slots[i]); burst(c.x, c.y, 8); S().snap(); if (o.onPlace) o.onPlace(i); }
      if (filled.size === slots.length && !done) { done = true; finish(); }
    }
    function finish() {
      el.classList.add('done');
      const r = svg.getBoundingClientRect();
      setTimeout(() => { burst(r.left + r.width / 2, r.top + r.height / 2, 14, true); S().star(); }, 250);
      if (o.onDone) o.onDone();
    }

    // drop logic
    function tryDrop(p, cx, cy) { // cx,cy = piece center in board units
      const cand = slots.filter(s => !filled.has(s.i) && P.sameShape(p, s));
      const dist = (s) => { const e = P.eff(s); return Math.hypot(s.x + e.W / 2 - cx, s.y + e.H / 2 - cy); };
      const ok = cand.filter(s => P.fits(p, s)).sort((a, c) => dist(a) - dist(c));
      const onBoard = cx > -2 && cx < 14 && cy > -2 && cy < 14;
      if (ok.length && (kid ? onBoard : dist(ok[0]) <= 2.6)) return { slot: ok[0] };
      const wrongRot = cand.filter(s => !P.fits(p, s) && dist(s) <= 3);
      return { wrongRot: wrongRot.length > 0 };
    }

    // pointer handling
    let drag = null;
    trayEl.addEventListener('pointerdown', (ev) => {
      if (done) return; const t = ev.target.closest('.tp'); if (!t) return;
      ev.preventDefault(); S().pick && window.PBSound && window.PBSound.unlock();
      const p = tray.find(q => q.uid === +t.dataset.uid); if (!p) return;
      drag = { p, t, id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, moving: false, ghost: null, touch: ev.pointerType === 'touch' };
      try { t.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    function startGhost() {
      const p = drag.p, u = unit(), e = P.eff(p);
      const g = document.createElement('div'); g.className = 'ghost';
      g.innerHTML = '<svg width="' + (e.W * u) + '" height="' + (e.H * u) + '" viewBox="0 0 ' + e.W + ' ' + e.H + '">' + P.shapeSvg(Object.assign({}, p, { x: 0, y: 0 }), { detail: true }) + '</svg>';
      document.body.appendChild(g); drag.ghost = g; drag.gw = e.W * u; drag.gh = e.H * u; drag.t.classList.add('lifted'); S().pick();
    }
    function moveGhost(x, y) { const lift = drag.touch ? Math.min(drag.gh * 0.35, 60) : 0; drag.gx = x - drag.gw / 2; drag.gy = y - drag.gh / 2 - lift; drag.ghost.style.transform = 'translate(' + drag.gx + 'px,' + drag.gy + 'px)'; }
    const mv = (ev) => {
      if (!drag || ev.pointerId !== drag.id) return; ev.preventDefault();
      if (!drag.moving && Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) > 8) { drag.moving = true; startGhost(); }
      if (drag.moving) moveGhost(ev.clientX, ev.clientY);
    };
    window.addEventListener('pointermove', mv, { passive: false });
    const end = (ev) => {
      if (!drag || ev.pointerId !== drag.id) return; const d = drag; drag = null;
      if (!d.moving) { // tap = rotate (Lovisa)
        if (!kid && ev.type === 'pointerup') { const p = d.p; p.rot = (p.rot + 90) % 360; if ((p.type === 'rect' || p.type === 'col') && p.rot >= 180) p.rot -= 180; S().rotate(); drawTray(); }
        return;
      }
      const r = svg.getBoundingClientRect(), u = unit();
      const cx = (d.gx + d.gw / 2 - r.left) / u - VB, cy = (d.gy + d.gh / 2 - r.top) / u - VB;
      const res = ev.type === 'pointerup' ? tryDrop(d.p, cx, cy) : {};
      if (res.slot) {
        d.ghost.remove(); tray = tray.filter(q => q !== d.p); drawTray(); place(res.slot.i);
      } else {
        S().boing(); if (res.wrongRot && o.onRotateHint) o.onRotateHint();
        d.ghost.classList.add('back'); const tr = d.t.getBoundingClientRect();
        d.ghost.style.transform = 'translate(' + (tr.left + tr.width / 2 - d.gw / 2) + 'px,' + (tr.top + tr.height / 2 - d.gh / 2) + 'px) scale(.5)';
        setTimeout(() => { d.ghost.remove(); d.t.classList.remove('lifted'); if (res.wrongRot) { d.t.classList.add('wiggle'); setTimeout(() => d.t.classList.remove('wiggle'), 700); } }, 260);
      }
    };
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);

    const ro = new ResizeObserver(() => layout()); ro.observe(el);
    layout();
    if (filled.size === slots.length) { done = true; el.classList.add('done'); }
    return {
      el, slots,
      get done() { return done; },
      place: (i) => place(i, true),
      destroy() { ro.disconnect(); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); root.innerHTML = ''; },
      // test helper: where things are (client px)
      info() {
        return { slots: slots.map(s => Object.assign({ i: s.i, filled: filled.has(s.i) }, slotCenterClient(s))),
          tray: tray.map(p => { const t = trayEl.querySelector('[data-uid="' + p.uid + '"]'), rr = t.getBoundingClientRect();
            const target = slots.find(s => !filled.has(s.i) && P.sameShape(p, s));
            return { uid: p.uid, decoy: !!p.decoy, x: rr.left + rr.width / 2, y: rr.top + rr.height / 2, slot: target ? target.i : null, rotOk: target ? P.fits(p, target) : null }; }) };
      }
    };
  }
  window.Builder = { create };
})();
