// Voice join race (npm run smoke:voice-race): four accounts join the same voice room in quick
// succession for several rounds; every pair must reach a connected WebRTC session. Guards the
// first member's answer being dropped while the room directory lags behind a newcomer's offer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const esbuild = require('esbuild');
const { app, BrowserWindow, ipcMain, session } = require('electron');

const root = path.resolve(__dirname, '..');
const testData = fs.mkdtempSync(path.join(os.tmpdir(), 'mingrx-race-'));
const projectId = process.env.GCLOUD_PROJECT || 'demo-mingrx-site';
const authUrl = new URL(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'}`);
const firestoreUrl = new URL(`http://${process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'}`);
app.setPath('userData', testData);
// Real clients are foreground apps: keep every simulated client unthrottled so they race as fast as real ones.
for (const s of ['use-fake-device-for-media-stream', 'use-fake-ui-for-media-stream', 'disable-backgrounding-occluded-windows', 'disable-renderer-backgrounding', 'disable-background-timer-throttling']) app.commandLine.appendSwitch(s);
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
const hard = setTimeout(() => done(1, 'voice race: hard timeout'), 420000);
function done(code, msg) { clearTimeout(hard); if (msg) (code ? console.error : console.log)(msg); for (const w of wins) try { w.destroy(); } catch {} try { fs.rmSync(testData, { recursive: true, force: true }); } catch {} app.exit(code); }
async function open(js, key, show, inject) {
  const ses = session.fromPartition(`race-${process.pid}-${key}`);
  ses.webRequest.onBeforeRequest((d, cb) => { const u = new URL(d.url); cb({ cancel: ['http:', 'https:', 'ws:', 'wss:'].includes(u.protocol) && !['localhost', '127.0.0.1'].includes(u.hostname) }); });
  await ses.protocol.handle('file', async req => { const p = fileURLToPath(req.url);
    if (p === path.join(root, 'src/cloud-browser/cloud-v2-all.browser.js')) return new Response(js, { headers: { 'Content-Type': 'application/javascript' } });
    const t = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
    try { return new Response(fs.readFileSync(p), { headers: { 'Content-Type': t[path.extname(p)] || 'application/octet-stream' } }); } catch { return new Response('Not found', { status: 404 }); } });
  const w = new BrowserWindow({ show, width: 1440, height: 900, webPreferences: { session: ses, preload: path.join(root, 'preload.js'), nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false } });
  wins.push(w); if (inject) { await w.loadURL('about:blank'); w.webContents.debugger.attach('1.3'); await w.webContents.debugger.sendCommand('Page.enable'); await w.webContents.debugger.sendCommand('Page.addScriptToEvaluateOnNewDocument', { source: inject }); } await w.loadFile(path.join(root, 'src/index.html')); return w;
}
async function login(w, email, password) {
  await w.webContents.executeJavaScript(`(()=>{document.getElementById('cloudLoginEmail').value=${JSON.stringify(email)};document.getElementById('cloudLoginPassword').value=${JSON.stringify(password)};document.getElementById('cloudLoginForm').requestSubmit();})()`);
  for (let i = 0; i < 250; i++) { if (await w.webContents.executeJavaScript(`document.getElementById('app')?.classList.contains('hidden')===false&&window.BananaCloud?.ready===true&&!!window.BananaCloudSocket?.user`)) return; await wait(100); }
  throw new Error('login timeout');
}
const run = (w, code) => w.webContents.executeJavaScript(`(async()=>{const socket=window.BananaCloudSocket,sleep=ms=>new Promise(r=>setTimeout(r,ms));${code}})()`);
const q = JSON.stringify;
const ROUNDS = Number(process.env.RACE_ROUNDS || 6);
app.whenReady().then(async () => {
  const js = await bundle(); const pw = 'race-only-123456';
  const people = [];
  for (const name of ['Ana', 'Beto', 'Cris', 'Duda']) {
    const email = `${name.toLowerCase()}-${process.pid}@example.test`;
    const acc = await auth('signUp', { email, password: pw, returnSecureToken: true });
    await auth('update', { localId: acc.localId, emailVerified: true, displayName: name }, true);
    const w = await open(js, name, name === 'Ana'); await login(w, email, pw);
    // Real profiles carry photo avatars, which enlarge room documents and widen the race window.
    await run(w, `await socket.updateProfile({avatar:'data:image/jpeg;base64,'+'A'.repeat(30000)});`);
    people.push({ name, w });
  }
  const [first, ...rest] = people;
  const room = JSON.parse(await run(first.w, `await socket.createServer('Race');let s;for(let i=0;i<100&&!(s=state.servers.find(x=>x.name==='Race'));i++)await sleep(50);await socket.createChannel({serverId:s.id,name:'Squad',type:'voice'});const l=await socket.loadServer(s.id);return JSON.stringify({id:s.id,invite:l.inviteCode,voice:l.channels.find(c=>c.name==='Squad').id})`));
  for (const p of rest) await run(p.w, `await socket.joinServer(${q(room.invite)});`);
  for (const p of people) await run(p.w, `for(let i=0;i<100&&!state.servers.some(s=>s.id===${q(room.id)});i++)await sleep(50);selectServer(${q(room.id)});`);
  const join = p => run(p.w, `const ch=state.servers.find(s=>s.id===${q(room.id)}).channels.find(c=>c.id===${q(room.voice)});selectChannel(ch.id);await joinVoice(ch);for(let i=0;i<120&&!socket.voice;i++)await sleep(50);`);
  const states = p => p.w.webContents.executeJavaScript('[...state.voice.peers.values()].map(x=>x.pc.connectionState)');
  let ok = 0; const failures = [];
  for (let round = 1; round <= ROUNDS; round++) {
    // Everyone joins in quick succession; the first member is the one that used to be cut off.
    // Last round: the first member's transport loses its first answer to every newcomer, as when the
    // room directory lagged. The unanswered offer must be re-sent and the call must still connect.
    if (round === ROUNDS && process.env.RACE_DROP !== '0') await run(first.w, "const orig=socket.signal.bind(socket);const dropped=new Set();socket.signal=async p=>{if(p?.data?.description?.type==='answer'&&!dropped.has(p.targetSocketId)){dropped.add(p.targetSocketId);return}return orig(p)};");
    // Alternate the two join rhythms seen in practice: overlapping joins and one-after-another joins.
    for (const p of people) { const j = join(p).catch(e => failures.push(`round ${round} join ${p.name}: ${e.message}`)); if (round % 2 === 0) await j; await wait(round % 2 === 0 ? 500 : 250); }
    let all = false, snapshot = [];
    for (let i = 0; i < (round === ROUNDS ? 260 : 150) && !all; i++) {
      snapshot = await Promise.all(people.map(states));
      all = snapshot.every(s => s.length === people.length - 1 && s.every(x => x === 'connected'));
      if (!all) await wait(100);
    }
    if (!all) for (const p of people) console.log('RACE DEBUG ' + p.name + ' ' + await p.w.webContents.executeJavaScript('JSON.stringify([...state.voice.peers.values()].map(x=>({to:x.user?.name,cs:x.pc.connectionState,sig:x.pc.signalingState,retries:x._offerRetries||0,making:x.makingOffer,initiator:x.initiator,timer:!!x._offerRetryTimer})))'));
    if (all) ok++; else failures.push(`round ${round}: ${JSON.stringify(Object.fromEntries(people.map((p, i) => [p.name, snapshot[i]])))}`);
    console.log(`RACE round ${round}: ${all ? 'all connected' : 'STUCK'}`);
    for (const p of people) await run(p.w, 'await leaveVoice();await sleep(200);');
    await wait(1500);
  }
  // Departure: someone leaves while the first member never receives the "user left" event.
  // Presence must still clear the departed person's card from the call grid.
  let departureOk = false;
  for (const p of people) { await join(p).catch(e => failures.push(`departure join ${p.name}: ${e.message}`)); await wait(300); }
  for (let i = 0; i < 200; i++) { const snap = await Promise.all(people.map(states)); if (snap.every(x => x.length === people.length - 1 && x.every(y => y === 'connected'))) break; await wait(100); }
  const leaver = people[1];
  const leaverSid = await leaver.w.webContents.executeJavaScript('window.BananaCloudSocket?.id || ""');
  await run(first.w, "const orig=socket.receive.bind(socket);socket.receive=function(ev,p){if(ev==='voice:user-left')return;return orig(ev,p);};");
  await run(leaver.w, 'await leaveVoice();await sleep(200);');
  for (let i = 0; i < 150 && !departureOk; i++) {
    departureOk = await first.w.webContents.executeJavaScript(`!state.voice.peers.has(${JSON.stringify(leaverSid)}) && !document.getElementById(${JSON.stringify('video-' + leaverSid)}) && state.voice.peers.size === ${people.length - 2}`);
    if (!departureOk) await wait(100);
  }
  console.log(`RACE departure: ${departureOk ? 'card cleared without the leave event' : 'STALE CARD'}`);
  if (!departureOk) failures.push('departed member card stayed in the call grid');
  for (const p of people) await run(p.w, 'await leaveVoice();await sleep(200);');
  console.log(`RACE RESULT ${ok}/${ROUNDS} rounds fully connected`);
  for (const f of failures) console.log('RACE FAIL ' + f);
  const passed = ok === ROUNDS && departureOk;
  done(passed ? 0 : 1, passed ? 'voice join race: OK' : 'voice join race: FAILED');
}).catch(e => done(1, e.stack || String(e)));
