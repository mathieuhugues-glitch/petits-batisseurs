/* Petits bâtisseurs - optional spoken prompts (speechSynthesis). French by default, Swedish toggle. Fails silently. */
(function () {
  'use strict';
  const KEY = 'pb.lang';
  let lang = localStorage.getItem(KEY) === 'sv' ? 'sv' : 'fr';
  let voiceOn = localStorage.getItem('pb.voice') !== '0';
  const T = {
    fr: { who: 'Qui joue ?', build: (n) => 'Construis ' + n + ' !', bravo: (n) => 'Bravo ! ' + n + ' !', city: 'Regarde ta ville !', rotate: 'Tourne-la !', bravoName: (p) => 'Bravo ' + p + ' !', scan: 'Scanne le code !' },
    sv: { who: 'Vem spelar?', build: (n) => 'Bygg ' + n + '!', bravo: (n) => 'Bra jobbat! ' + n + '!', city: 'Titta på din stad!', rotate: 'Vrid den!', bravoName: (p) => 'Bra jobbat ' + p + '!', scan: 'Skanna koden!' }
  };
  function pickVoice(code) {
    try { const vs = speechSynthesis.getVoices() || []; return vs.find(v => v.lang && v.lang.toLowerCase().startsWith(code)) || null; } catch (e) { return null; }
  }
  function say(text) {
    if (!voiceOn || !text) return;
    try {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'sv' ? 'sv-SE' : 'fr-FR'; const v = pickVoice(lang); if (v) u.voice = v;
      u.rate = 0.9; u.pitch = 1.15;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { /* silent */ }
  }
  window.PBVoice = {
    get lang() { return lang; },
    setLang(l) { lang = l === 'sv' ? 'sv' : 'fr'; localStorage.setItem(KEY, lang); },
    get on() { return voiceOn; },
    setOn(b) { voiceOn = !!b; localStorage.setItem('pb.voice', b ? '1' : '0'); if (!b) try { speechSynthesis.cancel(); } catch (e) {} },
    t(k, ...a) { const v = T[lang][k]; return typeof v === 'function' ? v(...a) : v; },
    say
  };
})();
