// Quick end-to-end pass (minimal on purpose): solo game for each profile + TV & 1 phone over ?transport=local.
// Usage: serve the folder on :8770, then NODE_PATH=/workspace/geo-party-build/node_modules node tools/e2e.cjs
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8770/';
const SHOTS = __dirname + '/../screens/';
let fails = 0; const check = (c, m) => { if (!c) { fails++; console.error('FAIL:', m); } else console.log('ok:', m); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function buildOne(page, shotAt) {
  for (let guard = 0; guard < 60; guard++) {
    const info = await page.evaluate(() => window.__pb.builder && window.__pb.builder.info());
    if (!info) return false;
    if (info.slots.every(s => s.filled)) return true;
    const p = info.tray.find(t => t.slot !== null); if (!p) return false;
    if (!p.rotOk) { await page.mouse.click(p.x, p.y); await sleep(80); continue; }
    const s = info.slots.find(x => x.i === p.slot);
    await page.mouse.move(p.x, p.y); await page.mouse.down();
    await page.mouse.move(p.x + 20, p.y + 20, { steps: 3 });
    await page.mouse.move(s.x + 10, s.y + 6, { steps: 6 }); // slightly off: snapping must fix it
    if (shotAt && guard === 1) await page.screenshot({ path: SHOTS + shotAt });
    await page.mouse.up(); await sleep(120);
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const errors = [];
  // ---- solo, both profiles ----
  for (const [profile, vp, shot] of [['lovisa', { width: 1180, height: 820 }, '01-solo-lovisa-ipad.png'], ['linnea', { width: 390, height: 844 }, null]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: false });
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(profile + ': ' + e.message));
    await page.goto(BASE + 'solo.html'); await page.click('.av.' + profile);
    let built = 0;
    for (let k = 0; k < 5; k++) {
      const ok = await buildOne(page, k === 1 ? shot : null);
      if (ok) built++;
      await page.waitForSelector('#party:not(.hidden)', { timeout: 5000 }).catch(() => {});
      await page.click('#next');
    }
    check(built === 5, 'solo ' + profile + ': 5 buildings completed');
    check(await page.isVisible('#cityScr') && (await page.$$('#city .cb')).length === 5, 'solo ' + profile + ': city with 5 buildings');
    await ctx.close();
  }
  // ---- TV + 1 phone over local transport ----
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const tv = await ctx.newPage(); tv.on('pageerror', e => errors.push('tv: ' + e.message));
  await tv.goto(BASE + 'index.html?transport=local');
  await tv.waitForFunction(() => /^[A-Z]{4}$/.test(document.querySelector('#code').textContent));
  const url = await tv.getAttribute('#qr', 'data-url');
  check(/play\.html\?room=[A-Z]{4}&transport=local/.test(url) && await tv.$('#qr svg'), 'QR rendered for ' + url);
  const ph = await ctx.newPage(); ph.on('pageerror', e => errors.push('phone: ' + e.message));
  await ph.setViewportSize({ width: 844, height: 390 });
  await ph.goto(url); await ph.click('.av.linnea', { timeout: 8000 });
  await ph.waitForSelector('#lobby:not(.hidden)', { timeout: 8000 });
  await tv.waitForSelector('#joined .av.linnea');
  check(true, 'phone joined as Linnéa');
  await tv.click('#startBtn');
  await ph.waitForSelector('#game:not(.hidden)', { timeout: 8000 });
  // place first piece then check TV mirrors it
  const first = await ph.evaluate(() => { const i = window.__pb.builder.info(); return { p: i.tray[0], s: i.slots.find(s => s.i === i.tray[0].slot) }; });
  await ph.mouse.move(first.p.x, first.p.y); await ph.mouse.down(); await ph.mouse.move(first.s.x, first.s.y, { steps: 6 }); await ph.mouse.up();
  await sleep(300);
  check((await tv.$$('#cols .tvcol:not(.target) .pc')).length === 1, 'TV shows the placed piece live');
  check(await buildOne(ph), 'phone completed the building');
  await tv.waitForSelector('#party:not(.hidden)', { timeout: 5000 }).then(() => check(true, 'TV celebration shown')).catch(() => check(false, 'TV celebration shown'));
  await tv.screenshot({ path: SHOTS + '02-tv-celebration.png' });
  await ph.screenshot({ path: SHOTS + '03-phone-linnea-done.png' });
  check(await tv.evaluate(() => window.__pb.built.length === 1), 'TV recorded 1 built building');
  check(!errors.length, 'no JS errors ' + errors.join(' | '));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
})();
