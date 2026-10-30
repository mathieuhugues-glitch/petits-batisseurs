/* Petits bâtisseurs - tiny WebAudio sound effects (no audio files, works offline) */
(function () {
  'use strict';
  let ctx = null, muted = localStorage.getItem('pb.muted') === '1';
  function ac() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  function tone(freq, dur, type, vol, delay, slide) {
    if (muted) return; const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  window.PBSound = {
    unlock() { ac(); },
    get muted() { return muted; },
    setMuted(m) { muted = m; localStorage.setItem('pb.muted', m ? '1' : '0'); },
    join() { tone(660, 0.12, 'triangle', 0.2); tone(990, 0.15, 'triangle', 0.2, 0.1); },
    pick() { tone(600, 0.06, 'sine', 0.15, 0, 800); },
    rotate() { tone(500, 0.08, 'triangle', 0.15, 0, 700); },
    snap() { tone(880, 0.07, 'triangle', 0.22); tone(1320, 0.12, 'triangle', 0.2, 0.06); },
    boing() { tone(260, 0.25, 'sine', 0.18, 0, 140); },
    star() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.15, 'sine', 0.16, i * 0.07)); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.22, i * 0.14)); tone(1047, 0.8, 'triangle', 0.2, 0.6); tone(784, 0.8, 'triangle', 0.15, 0.6); }
  };
})();
