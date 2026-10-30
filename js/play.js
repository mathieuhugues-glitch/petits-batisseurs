/* Petits bâtisseurs - phone/iPad: pick profile, then build on the own device */
(function () {
  'use strict';
  const { $, avatarBtn, dots } = PBUI;
  const qs = new URLSearchParams(location.search), room = (qs.get('room') || '').toUpperCase();
  const KEY = 'pb.profile.' + room;
  const st = { profile: sessionStorage.getItem(KEY), last: null, builder: null, bkey: null };
  window.__pb = st;
  const show = (id) => ['conn', 'pick', 'lobby', 'game', 'cityScr'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id));
  if (!room) { $('#connTxt').textContent = '?room=…'; return; }

  $('#avs').innerHTML = avatarBtn('lovisa') + avatarBtn('linnea');
  $('#avs').querySelectorAll('[data-p]').forEach(b => b.onclick = () => { PBSound.unlock(); PBSound.join(); choose(b.dataset.p); });
  function choose(p) { st.profile = p; sessionStorage.setItem(KEY, p); client.send({ t: 'hi', profile: p }); }

  const client = PBNet.createClient(room, {
    onStatus(s) {
      if (s === 'open') { if (st.profile) client.send({ t: 'hi', profile: st.profile }); else { show('pick'); PBVoice.say(PBVoice.t('who')); } }
      else if (!st.last || s === 'nohost') { if (!st.builder) show('conn'); $('#connTxt').textContent = s === 'nohost' ? '📺 ?' : '…'; }
    },
    onMessage(m) { if (m && m.t === 'state') onState(m); }
  });

  function onState(m) {
    st.last = m; if (m.lang && m.lang !== PBVoice.lang) PBVoice.setLang(m.lang);
    if (m.phase === 'lobby') { killBuilder(); $('#meBig').innerHTML = avatarBtn(m.profile); show('lobby'); return; }
    if (m.phase === 'city') { killBuilder(); show('cityScr'); $('#cityStars').textContent = '⭐'.repeat(m.stars); $('#city').innerHTML = PB.drawCity(m.built); PBSound.fanfare(); return; }
    show('game');
    $('#who').innerHTML = '<span class="mini-av" style="display:inline-block">' + PB.AV[m.profile].svg + '</span>';
    $('#dots').innerHTML = dots(m.n, m.k); $('#stars').textContent = '⭐ ' + m.stars;
    const key = m.k + ':' + m.bid + ':' + m.profile;
    if (st.bkey !== key) {
      killBuilder(); st.bkey = key; $('#party').classList.add('hidden');
      const bid = m.bid;
      st.builder = Builder.create($('#stage'), { buildingId: bid, profile: m.profile, placed: m.placed,
        onPlace: (i) => client.send({ t: 'place', i, bid }),
        onRotateHint: () => PBVoice.say(PBVoice.t('rotate')),
        onDone: () => { client.send({ t: 'done', bid }); setTimeout(() => { $('#bname').textContent = '⭐ ' + PB.name(PB.byId(bid), PBVoice.lang); $('#party').classList.remove('hidden'); PBVoice.say(PB.name(PB.byId(bid), PBVoice.lang)); }, 700); } });
      if (!m.placed.length) setTimeout(prompt, 300);
    }
    $('#next').classList.toggle('hidden', m.phase !== 'party');
  }
  function killBuilder() { if (st.builder) st.builder.destroy(); st.builder = null; st.bkey = null; }
  function prompt() { if (st.last && st.last.bid) PBVoice.say(PBVoice.t('build', PB.obj(PB.byId(st.last.bid), PBVoice.lang))); }
  $('#sayAgain').onclick = prompt;
  $('#startBtn').onclick = () => { PBSound.unlock(); client.send({ t: 'start' }); };
  $('#again').onclick = () => client.send({ t: 'start' });
  $('#next').onclick = () => client.send({ t: 'next' });
  $('#swap').onclick = () => { st.profile = null; sessionStorage.removeItem(KEY); show('pick'); };
})();
