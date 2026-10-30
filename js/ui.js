/* Petits bâtisseurs - shared UI bits: no zoom/scroll gestures, language + sound toggles, offline cache */
(function () {
  'use strict';
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  const $ = (s) => document.querySelector(s);
  function toggles(box, opts) { // opts.lang: show FR/SV switch
    opts = opts || {};
    const render = () => {
      box.innerHTML = (opts.lang ? '<button class="round flag' + (PBVoice.lang === 'fr' ? ' on' : '') + '" data-l="fr" aria-label="Français">🇫🇷</button><button class="round flag' + (PBVoice.lang === 'sv' ? ' on' : '') + '" data-l="sv" aria-label="Svenska">🇸🇪</button>' : '') +
        '<button class="round" data-m aria-label="Son">' + (PBSound.muted ? '🔇' : '🔊') + '</button>';
      box.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { PBVoice.setLang(b.dataset.l); PBSound.unlock(); render(); PBVoice.say(PBVoice.t('who')); if (opts.onLang) opts.onLang(); });
      box.querySelector('[data-m]').onclick = () => { const m = !PBSound.muted; PBSound.setMuted(m); PBVoice.setOn(!m); render(); };
    };
    render();
  }
  function avatarBtn(id, extra) { const a = PB.AV[id]; return '<button class="av ' + id + '" data-p="' + id + '">' + a.svg + '<span>' + a.name + '</span>' + (extra || '') + '</button>'; }
  function dots(n, cur) { let h = '<div class="dots">'; for (let i = 0; i < n; i++) h += '<i class="' + (i < cur ? 'ok' : i === cur ? 'cur' : '') + '"></i>'; return h + '</div>'; }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.PBUI = { $, toggles, avatarBtn, dots };
})();
