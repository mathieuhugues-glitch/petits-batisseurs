/* Petits bâtisseurs - solo mode: one device, no network at all */
(function () {
  'use strict';
  const { $, toggles, avatarBtn, dots } = PBUI;
  const st = { profile: null, list: [], k: 0, stars: 0, built: [], builder: null };
  window.__pb = st;
  const show = (id) => ['pick', 'game', 'cityScr'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id));
  toggles($('#tg'), { lang: true });
  $('#avs').innerHTML = avatarBtn('lovisa') + avatarBtn('linnea');
  $('#avs').querySelectorAll('[data-p]').forEach(b => b.onclick = () => { PBSound.unlock(); PBSound.join(); start(b.dataset.p); });
  setTimeout(() => PBVoice.say(PBVoice.t('who')), 600);

  function start(profile) {
    st.profile = profile; st.list = PB.pickSession(PB.SESSION); st.k = 0; st.stars = 0; st.built = [];
    $('#who').innerHTML = '<span class="mini-av" style="display:inline-block">' + PB.AV[profile].svg + '</span>';
    show('game'); next();
  }
  function hud() { $('#dots').innerHTML = dots(st.list.length, st.k); $('#stars').textContent = '⭐ ' + st.stars; }
  function prompt() { PBVoice.say(PBVoice.t('build', PB.obj(PB.byId(st.list[st.k]), PBVoice.lang))); }
  function next() {
    if (st.builder) st.builder.destroy();
    if (st.k >= st.list.length) return city();
    $('#party').classList.add('hidden'); hud();
    const id = st.list[st.k];
    st.builder = Builder.create($('#stage'), { buildingId: id, profile: st.profile,
      onRotateHint: () => PBVoice.say(PBVoice.t('rotate')),
      onDone: () => {
        st.stars++; st.built.push({ id, profile: st.profile }); hud();
        const nm = PB.name(PB.byId(id), PBVoice.lang);
        setTimeout(() => { PBSound.fanfare(); PBVoice.say(PBVoice.t('bravo', nm)); $('#bname').textContent = nm; $('#party').classList.remove('hidden'); }, 700);
      } });
    prompt();
  }
  $('#next').onclick = () => { PBSound.pick(); st.k++; next(); };
  $('#sayAgain').onclick = prompt;
  function city() {
    show('cityScr'); $('#cityStars').textContent = '⭐'.repeat(st.stars);
    $('#city').innerHTML = PB.drawCity(st.built); PBSound.fanfare(); PBVoice.say(PBVoice.t('city'));
  }
  $('#again').onclick = () => start(st.profile);
  const home = () => { if (st.builder) st.builder.destroy(); st.builder = null; show('pick'); };
  $('#home').onclick = home; $('#home2').onclick = home;
})();
