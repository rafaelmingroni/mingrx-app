// Performance probe (npm run perf:probe): runs the production renderer against Firebase
// emulators with four accounts and reports the measured client CPU, memory and DOM-observer
// churn idle, in a busy chat and in a voice call, plus voice-activity reads when minimized.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const esbuild = require('esbuild');
const { app, BrowserWindow, ipcMain, session } = require('electron');

const root = path.resolve(__dirname, '..');
const testData = fs.mkdtempSync(path.join(os.tmpdir(), 'mingrx-perf-'));
const projectId = process.env.GCLOUD_PROJECT || 'demo-mingrx-site';
const authUrl = new URL(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'}`);
const firestoreUrl = new URL(`http://${process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'}`);
app.setPath('userData', testData);
for (const s of ['use-fake-device-for-media-stream', 'use-fake-ui-for-media-stream']) app.commandLine.appendSwitch(s);
app.on('window-all-closed', () => {});
const settings = { idleSeconds: 0, idleState: 'active', activity: null, settings: { shareActivity: true, autoAwayMinutes: 5, startup: { supported: true, enabled: false, registered: false } }, startupLaunch: false };
for (const [n, h] of Object.entries({
  'banana-v21:get-settings': () => settings, 'banana-v21:set-settings': () => settings, 'banana-v21:get-system-languages': () => ['pt-BR'],
  'update:get-config': () => ({ repoUrl: 'https://github.com/rafaelmingroni/mingrx-app', autoCheck: false, autoDownload: false, currentVersion: require('../package.json').version }),
  'update:get-state': () => ({ status: 'idle', phase: 'idle', progress: 0 }), 'banana-updater:get-state': () => ({ status: 'idle', phase: 'idle', percent: 0 }),
  'banana-updater:get-version': () => require('../package.json').version, 'banana-updater:check': () => ({ ok: true }), 'clipboard:write': () => true,
  'ptt:configure': () => ({ ok: true }), 'rtc:configuration': () => ({ iceServers: [], relayAvailable: false }), 'voice:background-active': () => true
})) ipcMain.handle(n, h);
require('../e2ee-main'); require('../auth-vault').install();

const one = (s, a, b) => { assert.equal(s.split(a).length, 2, a); return s.replace(a, b); };
async function bundle() {
  const builder = fs.readFileSync(path.join(root, 'scripts/build-cloud-browser.js'), 'utf8');
  const lines = [...builder.match(/contents:\s*\[([\s\S]*?)\]\.join\(/)[1].matchAll(/^\s*("(?:\\.|[^"\\])*")\s*,?\s*$/gm)].map(m => JSON.parse(m[1]));
  const r = await esbuild.build({ stdin: { contents: lines.join('\n'), resolveDir: path.join(root, 'src'), sourcefile: 'perf-entry.js' }, bundle: true, platform: 'browser', format: 'iife', target: ['chrome140'], write: false, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'emu', setup(b) {
      b.onLoad({ filter: /[\\/]cloud[\\/]firebase-config\.js$/ }, () => ({ contents: `module.exports=${JSON.stringify({ apiKey: 'demo-api-key', authDomain: `${projectId}.firebaseapp.com`, projectId, appId: 'demo-app-id' })};`, loader: 'js' }));
      b.onLoad({ filter: /[\\/]src[\\/]cloud-v2\.js$/ }, a => { let s = fs.readFileSync(a.path, 'utf8');
        s = one(s, "const auth = require('./secure-auth-persistence')(firebaseApp);", `const auth = require('firebase/auth').initializeAuth(firebaseApp,{persistence:require('firebase/auth').inMemoryPersistence}); require('firebase/auth').connectAuthEmulator(auth, ${JSON.stringify(authUrl.origin)}, {disableWarnings:true});`);
        s = one(s, 'const realtime = null;', `require('firebase/firestore').connectFirestoreEmulator(db, ${JSON.stringify(firestoreUrl.hostname)}, ${Number(firestoreUrl.port)}); const realtime = null;`);
        return { contents: s, loader: 'js' }; });
    } }] });
  return r.outputFiles[0].contents;
}
async function auth(action, data, admin = false) {
  const r = await fetch(`${authUrl.origin}/identitytoolkit.googleapis.com/v1/accounts:${action}?key=demo-api-key`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin ? { Authorization: 'Bearer owner' } : {}) }, body: JSON.stringify(data) });
  const j = await r.json(); assert(r.ok, JSON.stringify(j)); return j;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const wins = [];
const hard = setTimeout(() => done(1, 'perf: hard timeout'), 360000);
function done(code, msg) { clearTimeout(hard); if (msg) (code ? console.error : console.log)(msg); for (const w of wins) try { w.destroy(); } catch {} try { fs.rmSync(testData, { recursive: true, force: true }); } catch {} app.exit(code); }
async function open(js, key, show, inject) {
  const ses = session.fromPartition(`perf-${process.pid}-${key}`);
  ses.webRequest.onBeforeRequest((d, cb) => { const u = new URL(d.url); cb({ cancel: ['http:', 'https:', 'ws:', 'wss:'].includes(u.protocol) && !['localhost', '127.0.0.1'].includes(u.hostname) }); });
  await ses.protocol.handle('file', async req => { const p = fileURLToPath(req.url);
    if (p === path.join(root, 'src/cloud-browser/cloud-v2-all.browser.js')) return new Response(js, { headers: { 'Content-Type': 'application/javascript' } });
    const t = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
    try { return new Response(fs.readFileSync(p), { headers: { 'Content-Type': t[path.extname(p)] || 'application/octet-stream' } }); } catch { return new Response('Not found', { status: 404 }); } });
  const w = new BrowserWindow({ show, width: 1440, height: 900, webPreferences: { session: ses, preload: path.join(root, 'preload.js'), nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: true } });
  wins.push(w); if (inject) { await w.loadURL('about:blank'); w.webContents.debugger.attach('1.3'); await w.webContents.debugger.sendCommand('Page.enable'); await w.webContents.debugger.sendCommand('Page.addScriptToEvaluateOnNewDocument', { source: inject }); } await w.loadFile(path.join(root, 'src/index.html')); return w;
}
async function login(w, email, password) {
  await w.webContents.executeJavaScript(`(()=>{document.getElementById('cloudLoginEmail').value=${JSON.stringify(email)};document.getElementById('cloudLoginPassword').value=${JSON.stringify(password)};document.getElementById('cloudLoginForm').requestSubmit();})()`);
  for (let i = 0; i < 250; i++) { if (await w.webContents.executeJavaScript(`document.getElementById('app')?.classList.contains('hidden')===false&&window.BananaCloud?.ready===true&&!!window.BananaCloudSocket?.user`)) return; await wait(100); }
  throw new Error('login timeout');
}
const run = (w, code) => w.webContents.executeJavaScript(`(async()=>{const socket=window.BananaCloudSocket,sleep=ms=>new Promise(r=>setTimeout(r,ms));${code}})()`);
// Count MutationObserver callbacks to quantify DOM-observer churn.
const COUNT = `(()=>{if(window.__moCount!=null)return;window.__moCount=0;const O=window.MutationObserver;window.MutationObserver=class extends O{constructor(cb){super((...a)=>{window.__moCount++;return cb(...a)})}};})();void 0`;
async function sample(w, label, seconds, during) {
  const pid = w.webContents.getOSProcessId();
  const cpu = () => app.getAppMetrics().find(m => m.pid === pid)?.cpu;
  cpu(); await wait(1000); cpu();
  const mo0 = await w.webContents.executeJavaScript('window.__moCount||0');
  const t0 = Date.now(); const samples = [];
  const job = during ? during() : null;
  while (Date.now() - t0 < seconds * 1000) { await wait(1000); const m = app.getAppMetrics().find(x => x.pid === pid); samples.push(m.cpu.percentCPUUsage); }
  await job;
  const m = app.getAppMetrics().find(x => x.pid === pid);
  const heap = await w.webContents.executeJavaScript('performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):0');
  const mo = (await w.webContents.executeJavaScript('window.__moCount||0')) - mo0;
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const result = { label, cpuAvgPct: +avg.toFixed(2), cpuMaxPct: +Math.max(...samples).toFixed(2), rendererWorkingSetMB: Math.round(m.memory.workingSetSize / 1024), jsHeapMB: heap, observerCallbacksPerSec: +(mo / seconds).toFixed(1) };
  console.log('PERF ' + JSON.stringify(result));
}
app.whenReady().then(async () => {
  const js = await bundle(); const pw = 'perf-only-123456';
  const names = ['Lia', 'Bruna', 'Caio', 'Davi'];
  const people = [];
  for (const [i, name] of names.entries()) {
    const email = `${name.toLowerCase()}-${process.pid}@example.test`;
    const acc = await auth('signUp', { email, password: pw, returnSecureToken: true });
    await auth('update', { localId: acc.localId, emailVerified: true, displayName: name }, true);
    const w = await open(js, name, i === 0, i === 0 ? COUNT : '');
    await login(w, email, pw); people.push({ name, w });
  }
  const [lia, ...peers] = people;
  const room = JSON.parse(await run(lia.w, `await socket.createServer('Perf');let s;for(let i=0;i<100&&!(s=state.servers.find(x=>x.name==='Perf'));i++)await sleep(50);await socket.createChannel({serverId:s.id,name:'Squad',type:'voice'});const l=await socket.loadServer(s.id);return JSON.stringify({id:s.id,invite:l.inviteCode,text:l.channels.find(c=>c.type==='text').id,voice:l.channels.find(c=>c.name==='Squad').id})`));
  for (const p of peers) await run(p.w, `await socket.joinServer(${JSON.stringify(room.invite)});`);
  const sel = (p, ch) => run(p.w, `for(let i=0;i<100&&!state.servers.some(s=>s.id===${JSON.stringify(room.id)});i++)await sleep(50);selectServer(${JSON.stringify(room.id)});selectChannel(${JSON.stringify(ch)});await sleep(300);`);
  await sel(lia, room.text);
  for (let i = 0; i < 30; i++) await run(peers[i % 3].w, `await socket.sendMessage({serverId:${JSON.stringify(room.id)},channelId:${JSON.stringify(room.text)},text:'mensagem de aquecimento ${i}'});`);
  await wait(3000);
  await sample(lia.w, 'idle-chat', 10);
  let chatting = true;
  const chatter = async () => { let i = 0; while (chatting) { await run(peers[i % 3].w, `await socket.sendMessage({serverId:${JSON.stringify(room.id)},channelId:${JSON.stringify(room.text)},text:'ativo ${i}'});`); i++; await wait(700); } };
  const c = chatter(); await sample(lia.w, 'busy-chat', 10); chatting = false; await c;
  for (const p of [lia, ...peers]) { await run(p.w, `selectServer(${JSON.stringify(room.id)});const ch=state.servers.find(s=>s.id===${JSON.stringify(room.id)}).channels.find(c=>c.id===${JSON.stringify(room.voice)});selectChannel(ch.id);await joinVoice(ch);for(let i=0;i<120&&!socket.voice;i++)await sleep(50);`); await wait(500); }
  for (let i = 0; i < 100; i++) { const st = await lia.w.webContents.executeJavaScript('[...state.voice.peers.values()].map(p=>p.pc.connectionState)'); if (st.length >= 3 && st.every(s => s === 'connected')) break; await wait(100); }
  console.log('PEERS ' + JSON.stringify(await lia.w.webContents.executeJavaScript('[...state.voice.peers.values()].map(p=>p.pc.connectionState)')));
  await wait(3000);
  
  const rafCount=w=>w.webContents.executeJavaScript('new Promise(r=>{let n=0;const f=()=>{n++;requestAnimationFrame(f)};requestAnimationFrame(f);setTimeout(()=>r(n),3000)})');
  const vadAlive=w=>w.webContents.executeJavaScript('new Promise(r=>{const v=state.voice.vad;if(!v)return r("no-vad");const a=v.analyser,o=a.getByteTimeDomainData.bind(a);let n=0;a.getByteTimeDomainData=d=>{n++;return o(d)};setTimeout(()=>{a.getByteTimeDomainData=o;r(n+" reads/3s")},3000)})');
  await sample(lia.w, 'voice-call-4', 15);
  console.log('VAD visible ' + await vadAlive(lia.w));
  lia.w.minimize(); await wait(3000);
  console.log('VAD minimized ' + await vadAlive(lia.w));
  await sample(lia.w, 'voice-call-minimized', 10);
  console.log('TOTAL_APP_MB ' + Math.round(app.getAppMetrics().reduce((a, m) => a + m.memory.workingSetSize, 0) / 1024) + ' (all ' + wins.length + ' clients + shared processes)');
  done(0, 'perf complete');
}).catch(e => done(1, e.stack || String(e)));
