/* Petits bâtisseurs - TV host: QR + room code, live view of each child's build, celebration, city */
(function () {
  'use strict';
  const { $, toggles, dots } = PBUI;
  const S = { phase: 'lobby', list: [], k: 0, players: new Map(), conn2p: new Map(), built: [], partyT: null };
  window.__pb = S;
  const show = (id) => ['lobby', 'game', 'cityScr'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id));
  toggles($('#tg'), { lang: true, onLang: () => broadcastAll() });
  document.addEventListener('pointerdown', () => PBSound.unlock(), { once: true });

  const net = PBNet.createHost(sessionStorage.getItem('pb.room'), {
    onOpen(code) {
      sessionStorage.setItem('pb.room', code); $('#code').textContent = code;
      const u = new URL('play.html', location.href); u.search = ''; u.hash = ''; u.searchParams.set('room', code); if (net.transport === 'local') u.searchParams.set('transport', 'local');
      $('#qr').dataset.url = u.toString();
      try { const q = qrcode(0, 'M'); q.addData(u.toString()); q.make(); $('#qr').innerHTML = q.createSvgTag({ cellSize: 8, margin: 2, scalable: true }); } catch (e) { $('#qr').textContent = u.toString(); }
      const base = new URL('play.html', location.href); $('#joinUrl').textContent = base.host + base.pathname;
      $('#netWarn').textContent = net.transport === 'local' ? '🧪 transport=local' : '';
    },
    onMessage(cid, m) { handle(cid, m); },
    onClose(cid) { const pid = S.conn2p.get(cid); S.conn2p.delete(cid); const p = S.players.get(pid); if (p && p.cid === cid) { p.connected = false; render(); checkAllDone(); } },
    onError(t) { $('#netWarn').textContent = t; }
  });

  function players() { return ['lovisa', 'linnea'].map(id => S.players.get(id)).filter(Boolean); }
  function active() { return players().filter(p => p.connected); }
  function stateFor(p) {
    return { t: 'state', phase: S.phase, k: S.k, n: S.list.length, bid: S.list[S.k] || null, lang: PBVoice.lang, profile: p.profile,
      placed: [...p.placed], done: p.done, stars: p.stars, built: S.built.filter(b => b.profile === p.profile) };
  }
  function send(p) { if (p.cid && p.connected) net.send(p.cid, stateFor(p)); }
  function broadcastAll() { players().forEach(send); }

  function handle(cid, m) {
    if (!m || !m.t) return;
    if (m.t === 'hi') {
      const id = m.profile === 'linnea' ? 'linnea' : 'lovisa';
      // a device switching profile frees the old one
      const prev = S.conn2p.get(cid); if (prev && prev !== id) { const pp = S.players.get(prev); if (pp && pp.cid === cid) pp.connected = false; }
      let p = S.players.get(id);
      if (!p) { p = { profile: id, placed: new Set(), done: false, stars: 0 }; S.players.set(id, p); PBSound.join(); }
      p.cid = cid; p.connected = true; S.conn2p.set(cid, id);
      send(p); render(); return;
    }
    const p = S.players.get(S.conn2p.get(cid)); if (!p) return;
    if (m.t === 'start' && (S.phase === 'lobby' || S.phase === 'city')) startSession();
    else if (m.t === 'place' && S.phase === 'build' && m.bid === S.list[S.k]) { p.placed.add(m.i); renderGame(); PBSound.snap(); }
    else if (m.t === 'done' && S.phase === 'build' && m.bid === S.list[S.k] && !p.done) {
      p.done = true; p.stars++; S.built.push({ id: S.list[S.k], profile: p.profile }); PBVoice.say(PBVoice.t('bravoName', PB.AV[p.profile].name)); PBSound.star(); send(p); renderGame(); checkAllDone();
    } else if (m.t === 'next' && S.phase === 'party') nextBuilding();
  }
  function startSession() {
    PBSound.unlock(); S.list = PB.pickSession(PB.SESSION); S.k = -1; S.built = [];
    players().forEach(p => { p.stars = 0; });
    nextBuilding();
  }
  function nextBuilding() {
    clearTimeout(S.partyT); S.k++;
    if (S.k >= S.list.length) { S.phase = 'city'; render(); broadcastAll(); PBSound.fanfare(); PBVoice.say(PBVoice.t('city')); return; }
    S.phase = 'build'; players().forEach(p => { p.placed = new Set(); p.done = false; });
    render(); broadcastAll(); // the build prompt is spoken on each child's device
  }
  function checkAllDone() {
    if (S.phase !== 'build') return; const a = active(); if (!a.length || !a.every(p => p.done)) return;
    S.phase = 'party'; broadcastAll();
    setTimeout(() => { const nm = PB.name(PB.byId(S.list[S.k]), PBVoice.lang); $('#bname').textContent = nm; $('#party').classList.remove('hidden'); PBSound.fanfare(); PBVoice.say(PBVoice.t('bravo', nm)); }, 1400);
    S.partyT = setTimeout(nextBuilding, 7500);
  }

  function render() {
    const ps = players();
    $('#startBtn').disabled = !active().length;
    $('#joined').innerHTML = ps.length ? ps.map(p => '<div class="av ' + p.profile + '" style="' + (p.connected ? '' : 'opacity:.35') + '">' + PB.AV[p.profile].svg + '<span>' + PB.AV[p.profile].name + '</span></div>').join('') : '<div class="wait">📱 ➜ 📷</div>';
    if (S.phase === 'lobby') return show('lobby');
    if (S.phase === 'city') {
      show('cityScr'); $('#cityStars').innerHTML = ps.map(p => '<span class="mini-av" style="display:inline-block;vertical-align:middle">' + PB.AV[p.profile].svg + '</span> ' + '⭐'.repeat(p.stars)).join(' &nbsp; ');
      $('#city').innerHTML = PB.drawCity(S.built); return;
    }
    show('game'); renderGame();
  }
  function renderGame() {
    if (S.phase !== 'build' && S.phase !== 'party') return;
    if (S.phase === 'build') $('#party').classList.add('hidden');
    const b = PB.byId(S.list[S.k]); $('#dots').innerHTML = dots(S.list.length, S.k);
    let h = '<div class="tvcol target"><div class="who" style="font-size:6vmin">🏗️</div>' + PB.drawBuilding(b, 'lovisa', [], {}) + '</div>';
    const ps = players().filter(p => p.connected || p.placed.size);
    h += ps.map(p => '<div class="tvcol' + (p.done ? ' fin' : '') + '"><div class="who">' + PB.AV[p.profile].svg + '<span>' + PB.AV[p.profile].name + (p.done ? ' ⭐' : '') + '</span></div>' + PB.drawBuilding(b, p.profile, p.done ? 'all' : [...p.placed], { silFill: '#d9d2f2' }) + '</div>').join('');
    $('#cols').innerHTML = h;
  }
  $('#startBtn').onclick = startSession;
  $('#again').onclick = startSession;
})();
