/* Petits bâtisseurs - buildings, shapes and SVG drawing helpers (shared by TV, phone and solo).
 * Board = 12 x 12 grid units, y goes down, ground at y = 12.
 * A piece is [type, x, y, w, h, rot]: x,y = top-left of its (rotated) box on the board, w,h = size BEFORE rotation,
 * rot in degrees (0/90/180/270). Shapes: rect, tri (points up at rot 0), dome (half-disc, flat side down), arch (block with a hole), col (column). */
(function () {
  'use strict';
  const G = 12;
  const COLORS = ['#ff6b6b', '#ffb703', '#4cc9f0', '#80ed99', '#c77dff', '#ff8fab', '#f4a261', '#2ec4b6', '#ffd166', '#90be6d'];

  // name: shown/spoken name, obj: used in "Construis ... !"
  const B = [
    { id: 'maison', d: 1, fr: ['La maison', 'la maison'], sv: ['Huset', 'ett hus'],
      L: [['rect', 2, 6, 8, 6], ['tri', 2, 2, 8, 4]],
      V: [['rect', 2, 6, 4, 6], ['rect', 6, 6, 4, 6], ['tri', 2, 2, 8, 4], ['rect', 7, 1.5, 1, 2]], X: [['tri', 0, 0, 4, 2], ['dome', 0, 0, 4, 2]] },
    { id: 'tour', d: 1, fr: ['La tour', 'la tour'], sv: ['Tornet', 'ett torn'],
      L: [['rect', 4, 4, 4, 8], ['tri', 4, 1, 4, 3]],
      V: [['rect', 4, 8, 4, 4], ['rect', 4, 4, 4, 4], ['tri', 4, 1, 4, 3], ['col', 3, 5, 1, 7], ['col', 8, 5, 1, 7]], X: [['dome', 0, 0, 4, 2], ['rect', 0, 0, 2, 2]] },
    { id: 'igloo', d: 1, fr: ["L'igloo", "l'igloo"], sv: ['Igloon', 'en igloo'],
      L: [['dome', 2, 6, 8, 4], ['rect', 2, 10, 8, 2]],
      V: [['dome', 2, 6, 8, 4], ['rect', 2, 10, 3, 2], ['rect', 7, 10, 3, 2], ['arch', 5, 10, 2, 2]], X: [['tri', 0, 0, 2, 2], ['rect', 0, 0, 2, 2]] },
    { id: 'tipi', d: 1, fr: ['Le tipi', 'le tipi'], sv: ['Tipin', 'en tipi'],
      L: [['tri', 2, 3, 8, 9], ['col', 5.5, 1, 1, 2]],
      V: [['tri', 2, 4, 8, 8], ['tri', 4, 1, 4, 3, 180], ['arch', 5, 9, 2, 3], ['tri', 0, 10, 2, 2]], X: [['rect', 0, 0, 3, 3], ['dome', 0, 0, 4, 2]] },
    { id: 'pyramide', d: 2, fr: ['La pyramide', 'la pyramide'], sv: ['Pyramiden', 'en pyramid'],
      L: [['tri', 1, 5, 10, 6], ['rect', 0, 11, 12, 1]],
      V: [['rect', 1, 9, 10, 3], ['rect', 3, 6, 6, 3], ['rect', 5, 3, 2, 3], ['tri', 5, 1, 2, 2]], X: [['tri', 0, 0, 4, 2], ['arch', 0, 0, 4, 3]] },
    { id: 'chateau', d: 2, fr: ['Le château', 'le château'], sv: ['Slottet', 'ett slott'],
      L: [['rect', 1, 4, 3, 8], ['rect', 4, 7, 4, 5], ['rect', 8, 4, 3, 8]],
      V: [['rect', 1, 4, 3, 8], ['arch', 4, 7, 4, 5], ['rect', 8, 4, 3, 8], ['tri', 1, 1, 3, 3], ['tri', 8, 1, 3, 3]], X: [['dome', 0, 0, 4, 2], ['col', 0, 0, 1, 4]] },
    { id: 'temple', d: 2, fr: ['Le temple', 'le temple'], sv: ['Templet', 'ett tempel'],
      L: [['tri', 1, 2, 10, 3], ['col', 2, 5, 2, 7], ['col', 8, 5, 2, 7]],
      V: [['tri', 1, 2, 10, 3], ['rect', 1, 5, 10, 1], ['col', 2, 6, 1, 5], ['col', 4, 6, 1, 5], ['col', 7, 6, 1, 5], ['col', 9, 6, 1, 5], ['rect', 1, 11, 10, 1]], X: [['dome', 0, 0, 4, 2]] },
    { id: 'pont', d: 3, fr: ['Le pont', 'le pont'], sv: ['Bron', 'en bro'],
      L: [['arch', 1, 6, 10, 6], ['rect', 0, 5, 12, 1]],
      V: [['arch', 0, 7, 6, 5], ['arch', 6, 7, 6, 5], ['rect', 0, 6, 12, 1], ['col', 2, 3, 1, 3], ['col', 9, 3, 1, 3]], X: [['tri', 0, 0, 3, 3], ['rect', 0, 0, 4, 2]] },
    { id: 'moulin', d: 3, fr: ['Le moulin', 'le moulin'], sv: ['Väderkvarnen', 'en väderkvarn'],
      L: [['rect', 4, 5, 4, 7], ['dome', 4, 3, 4, 2], ['rect', 1, 1.5, 10, 1.5]],
      V: [['rect', 4, 5, 4, 7], ['dome', 4, 3, 4, 2], ['rect', 3, 2.5, 6, 1], ['rect', 5.5, 0, 6, 1, 90], ['arch', 5, 9, 2, 3]], X: [['tri', 0, 0, 4, 3], ['rect', 0, 0, 4, 1]] },
    { id: 'gratteciel', d: 3, fr: ['Le gratte-ciel', 'le gratte-ciel'], sv: ['Skyskrapan', 'en skyskrapa'],
      L: [['rect', 3, 5, 6, 7], ['rect', 4, 2, 4, 3], ['tri', 5, 0, 2, 2]],
      V: [['rect', 2, 7, 8, 5], ['rect', 3, 4, 6, 3], ['rect', 4, 2, 4, 2], ['col', 5.5, 0, 1, 2], ['rect', 0, 9, 2, 3], ['rect', 10, 9, 2, 3]], X: [['tri', 0, 0, 4, 2], ['dome', 0, 0, 6, 3]] },
    { id: 'phare', d: 4, fr: ['Le phare', 'le phare'], sv: ['Fyren', 'en fyr'],
      L: [['rect', 4, 5, 4, 7], ['rect', 4.5, 2, 3, 3], ['dome', 4.5, 0.5, 3, 1.5]],
      V: [['rect', 4, 9, 4, 3], ['rect', 4, 6, 4, 3], ['rect', 3, 5, 6, 1], ['rect', 4.5, 3, 3, 2], ['dome', 4.5, 1.5, 3, 1.5], ['col', 5.5, 0.5, 1, 1]], X: [['tri', 0, 0, 3, 3], ['arch', 0, 0, 4, 3]] },
    { id: 'palais', d: 4, fr: ['Le palais', 'le palais'], sv: ['Palatset', 'ett palats'],
      L: [['rect', 2, 7, 8, 5], ['dome', 3, 4, 6, 3]],
      V: [['rect', 2, 7, 2, 5], ['arch', 4, 7, 4, 5], ['rect', 8, 7, 2, 5], ['dome', 3, 4, 6, 3], ['col', 0, 5, 1, 7], ['col', 11, 5, 1, 7], ['tri', 0, 3, 1, 2], ['tri', 11, 3, 1, 2]], X: [['tri', 0, 0, 4, 3]] },
    { id: 'eiffel', d: 5, fr: ['La tour Eiffel', 'la tour Eiffel'], sv: ['Eiffeltornet', 'Eiffeltornet'],
      L: [['arch', 2, 8, 8, 4], ['tri', 3, 1, 6, 7]],
      V: [['arch', 2, 8, 8, 4], ['rect', 3, 7, 6, 1], ['arch', 4, 4, 4, 3], ['rect', 4, 3, 4, 1], ['tri', 5, 0, 2, 3]], X: [['dome', 0, 0, 4, 2], ['rect', 0, 0, 2, 4]] }
  ];

  function norm(p, i) { return { type: p[0], x: p[1], y: p[2], w: p[3], h: p[4], rot: p[5] || 0, color: COLORS[i % COLORS.length], i }; }
  function eff(p) { const s = p.rot % 180 !== 0; return { W: s ? p.h : p.w, H: s ? p.w : p.h }; }
  // does a piece (type,w,h,rot) fit slot s? rect/col only care about the visible box; others also about direction
  function fits(piece, s) {
    if (piece.type !== s.type) return false;
    const a = eff(piece), b = eff(s);
    if (Math.abs(a.W - b.W) > 1e-6 || Math.abs(a.H - b.H) > 1e-6) return false;
    if (piece.type === 'rect' || piece.type === 'col') return true;
    return piece.w === s.w && piece.h === s.h && ((piece.rot - s.rot) % 360 + 360) % 360 === 0;
  }
  function sameShape(piece, s) { // same piece, maybe wrongly rotated
    if (piece.type !== s.type) return false;
    return (piece.w === s.w && piece.h === s.h) || (piece.w === s.h && piece.h === s.w && (piece.type === 'rect' || piece.type === 'col'));
  }
  // SVG path of the base shape in its own w x h box
  function basePath(t, w, h) {
    if (t === 'tri') return 'M0 ' + h + ' L' + (w / 2) + ' 0 L' + w + ' ' + h + 'Z';
    if (t === 'dome') return 'M0 ' + h + ' A' + (w / 2) + ' ' + h + ' 0 0 1 ' + w + ' ' + h + 'Z';
    if (t === 'arch') { const r = w * 0.25, cx = w / 2, top = h - h * 0.7; return 'M0 0H' + w + 'V' + h + 'H' + (cx + r) + 'V' + (top + r) + 'A' + r + ' ' + r + ' 0 0 0 ' + (cx - r) + ' ' + (top + r) + 'V' + h + 'H0Z'; }
    return 'M0 0H' + w + 'V' + h + 'H0Z';
  }
  function xform(p) { const e = eff(p); return 'translate(' + (e.W / 2) + ' ' + (e.H / 2) + ') rotate(' + p.rot + ') translate(' + (-p.w / 2) + ' ' + (-p.h / 2) + ')'; }
  // shape markup positioned at (x,y); opts.fill, opts.cls, opts.stroke, opts.detail
  function shapeSvg(p, opts) {
    opts = opts || {};
    const fill = opts.fill || p.color, st = opts.stroke === undefined ? 'rgba(0,0,0,.25)' : opts.stroke;
    let inner = '<path d="' + basePath(p.type, p.w, p.h) + '" fill="' + fill + '"' + (st ? ' stroke="' + st + '" stroke-width="' + (opts.sw || 0.08) + '" stroke-linejoin="round"' : '') + (opts.dash ? ' stroke-dasharray="' + opts.dash + '"' : '') + '/>';
    if (opts.detail && p.type === 'col') { // capitals + fluting
      const cw = p.w, ch = p.h; inner += '<rect x="-0.1" y="0" width="' + (cw + 0.2) + '" height="0.3" fill="rgba(255,255,255,.55)"/><rect x="-0.1" y="' + (ch - 0.3) + '" width="' + (cw + 0.2) + '" height="0.3" fill="rgba(255,255,255,.55)"/>';
      for (let k = 1; k < 3; k++) inner += '<line x1="' + (cw * k / 3) + '" y1="0.4" x2="' + (cw * k / 3) + '" y2="' + (ch - 0.4) + '" stroke="rgba(0,0,0,.18)" stroke-width="0.06"/>';
    }
    return '<g class="' + (opts.cls || '') + '" transform="translate(' + p.x + ' ' + p.y + ') ' + xform(p) + '">' + inner + '</g>';
  }
  function variant(b, profile) { return (profile === 'linnea' ? b.L : b.V).map(norm); }
  function decoys(b) { return (b.X || []).map((p, i) => norm(p, i + 5)); }
  function name(b, lang) { return (b[lang] || b.fr)[0]; }
  function obj(b, lang) { return (b[lang] || b.fr)[1]; }
  // static drawing of a building: silhouette + some placed slots (array of slot indexes or 'all')
  function drawBuilding(b, profile, placed, opts) {
    opts = opts || {};
    const slots = variant(b, profile), all = placed === 'all';
    const set = new Set(all ? slots.map(s => s.i) : placed || []);
    let h = '<svg viewBox="-0.3 -0.3 12.6 12.6" class="' + (opts.cls || 'bsvg') + '" xmlns="http://www.w3.org/2000/svg">';
    if (!opts.noSil) h += '<g class="sil">' + slots.map(s => shapeSvg(s, { fill: opts.silFill || '#3a3a5c', stroke: null })).join('') + '</g>';
    h += slots.filter(s => set.has(s.i)).map(s => shapeSvg(s, { cls: 'pc', detail: true })).join('');
    return h + '</svg>';
  }
  // simple drawn avatars
  const AV = {
    lovisa: { name: 'Lovisa', color: '#c77dff', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e9d5ff"/><path d="M22 52 Q20 18 50 16 Q80 18 78 52 Q78 30 50 28 Q22 30 22 52Z" fill="#c8862a"/><path d="M76 34 Q96 46 86 78 Q84 56 74 46Z" fill="#c8862a"/><circle cx="50" cy="54" r="26" fill="#ffd7b5"/><path d="M26 46 Q30 26 50 26 Q70 26 74 46 Q60 34 50 40 Q38 34 26 46Z" fill="#c8862a"/><circle cx="41" cy="54" r="3.5" fill="#333"/><circle cx="59" cy="54" r="3.5" fill="#333"/><path d="M41 64 Q50 72 59 64" stroke="#d6336c" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="35" cy="62" r="4" fill="#ffb3c6"/><circle cx="65" cy="62" r="4" fill="#ffb3c6"/><circle cx="80" cy="36" r="5" fill="#c77dff"/></svg>' },
    linnea: { name: 'Linnéa', color: '#ff9f1c', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ffe8cc"/><circle cx="20" cy="40" r="11" fill="#f6c453"/><circle cx="80" cy="40" r="11" fill="#f6c453"/><circle cx="50" cy="56" r="27" fill="#ffd7b5"/><path d="M23 50 Q26 26 50 26 Q74 26 77 50 Q66 36 50 40 Q34 36 23 50Z" fill="#f6c453"/><circle cx="20" cy="40" r="4" fill="#ff6b6b"/><circle cx="80" cy="40" r="4" fill="#ff6b6b"/><circle cx="41" cy="56" r="4" fill="#333"/><circle cx="59" cy="56" r="4" fill="#333"/><path d="M42 66 Q50 74 58 66" stroke="#d6336c" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="34" cy="64" r="4.5" fill="#ffb3c6"/><circle cx="66" cy="64" r="4.5" fill="#ffb3c6"/></svg>' }
  };
  // pick a session of n buildings, avoiding recently built ones, sorted by difficulty
  function pickSession(n) {
    let seen = []; try { seen = JSON.parse(localStorage.getItem('pb.seen') || '[]'); } catch (e) {}
    let pool = B.filter(b => !seen.includes(b.id)); if (pool.length < n) { seen = []; pool = B.slice(); }
    pool = pool.map(b => [Math.random(), b]).sort((a, c) => a[0] - c[0]).slice(0, n).map(x => x[1]).sort((a, c) => a.d - c.d);
    try { localStorage.setItem('pb.seen', JSON.stringify(seen.concat(pool.map(b => b.id)))); } catch (e) {}
    return pool.map(b => b.id);
  }
  function byId(id) { return B.find(b => b.id === id); }
  // city: row of finished buildings on a ground line. items = [{id, profile}]
  function drawCity(items) {
    const n = Math.max(1, items.length), W = n * 13 + 1;
    let h = '<svg class="city" viewBox="0 -4 ' + W + ' 18" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="-4" width="' + W + '" height="16" fill="#bde0fe"/><circle cx="' + (W - 3) + '" cy="-1" r="2" fill="#ffd166"/><rect x="0" y="12" width="' + W + '" height="2" fill="#80ed99"/>';
    items.forEach((it, k) => { const b = byId(it.id); if (!b) return; h += '<g class="cb" style="animation-delay:' + (k * 0.35) + 's" transform="translate(' + (1 + k * 13) + ' 0)">' + variant(b, it.profile).map(s => shapeSvg(s, { detail: true })).join('') + '</g>'; });
    return h + '</svg>';
  }
  window.PB = { G, COLORS, B, byId, norm, eff, fits, sameShape, basePath, shapeSvg, variant, decoys, name, obj, drawBuilding, drawCity, AV, pickSession, SESSION: 5 };
})();
