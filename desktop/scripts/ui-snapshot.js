// UI snapshot (npm run ui:snapshot): renders the production renderer against Firebase
// emulators with fictional profiles and saves chat and call screenshots to UI_SNAPSHOT_OUT.
// Optional UI_AVATARS points at a folder of <key>.jpg avatars and server.jpg.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const esbuild = require('esbuild');
const { app, BrowserWindow, ipcMain, session } = require('electron');

const root = path.resolve(__dirname, '..');
const testData = fs.mkdtempSync(path.join(os.tmpdir(), 'mingrx-ui-'));
const OUT = process.env.UI_SNAPSHOT_OUT || path.join(os.tmpdir(), 'mingrx-ui-snapshots');
const AVATARS = process.env.UI_AVATARS || '';
fs.mkdirSync(OUT, { recursive: true });
const projectId = process.env.GCLOUD_PROJECT || 'demo-mingrx-site';
const authUrl = new URL(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'}`);
const firestoreUrl = new URL(`http://${process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'}`);
app.setPath('userData', testData);
for (const s of ['use-fake-device-for-media-stream', 'use-fake-ui-for-media-stream', 'disable-backgrounding-occluded-windows', 'disable-renderer-backgrounding']) app.commandLine.appendSwitch(s);
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
const shareImage = 'data:image/webp;base64,' + fs.readFileSync(path.join(root, '../site/assets/mingrx-orbit-hero.webp')).toString('base64');
app.on('window-all-closed', () => {});
const settings = { idleSeconds: 0, idleState: 'active', activity: null, settings: { shareActivity: true, autoAwayMinutes: 5, startup: { supported: true, enabled: false, registered: false } }, startupLaunch: false };
for (const [n, h] of Object.entries({
  'banana-v21:get-settings': () => settings, 'banana-v21:set-settings': () => settings, 'banana-v21:get-system-languages': () => ['pt-BR'],
  'update:get-config': () => ({ repoUrl: 'https://github.com/rafaelmingroni/mingrx-app', autoCheck: false, autoDownload: false, currentVersion: require('../package.json').version }),
  'update:get-state': () => ({ status: 'idle', phase: 'idle', progress: 0 }), 'banana-updater:get-state': () => ({ status: 'idle', phase: 'idle', percent: 0 }),
  'banana-updater:get-version': () => require('../package.json').version, 'banana-updater:check': () => ({ ok: true }), 'clipboard:write': () => true,
  'ptt:configure': () => ({ ok: true }), 'rtc:configuration': () => ({ iceServers: [], relayAvailable: false }), 'voice:background-active': () => true, 'capture:select': () => true, 'capture:cancel': () => true, 'capture:sources': () => [{ id: 'window:art:0', name: 'Arte do servidor', thumbnail: shareImage, displayId: '' }]
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
const hard = setTimeout(() => done(1, 'ui-snapshot: hard timeout'), 360000);
function done(code, msg) { clearTimeout(hard); if (msg) (code ? console.error : console.log)(msg); for (const w of wins) try { w.destroy(); } catch {} try { fs.rmSync(testData, { recursive: true, force: true }); } catch {} app.exit(code); }
async function open(js, key, show, inject) {
  const ses = session.fromPartition(`ui-${process.pid}-${key}`);
  ses.webRequest.onBeforeRequest((d, cb) => { const u = new URL(d.url); cb({ cancel: ['http:', 'https:', 'ws:', 'wss:'].includes(u.protocol) && !['localhost', '127.0.0.1'].includes(u.hostname) }); });
  await ses.protocol.handle('file', async req => { const p = fileURLToPath(req.url);
    if (p === path.join(root, 'src/cloud-browser/cloud-v2-all.browser.js')) return new Response(js, { headers: { 'Content-Type': 'application/javascript' } });
    const t = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
    try { return new Response(fs.readFileSync(p), { headers: { 'Content-Type': t[path.extname(p)] || 'application/octet-stream' } }); } catch { return new Response('Not found', { status: 404 }); } });
  const w = new BrowserWindow({ show, width: 1440, height: 900, useContentSize: true, webPreferences: { session: ses, preload: path.join(root, 'preload.js'), nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false } });
  wins.push(w); if (inject) { await w.loadURL('about:blank'); w.webContents.debugger.attach('1.3'); await w.webContents.debugger.sendCommand('Page.enable'); await w.webContents.debugger.sendCommand('Page.addScriptToEvaluateOnNewDocument', { source: inject }); } await w.loadFile(path.join(root, 'src/index.html')); return w;
}
async function login(w, email, password) {
  await w.webContents.executeJavaScript(`(()=>{document.getElementById('cloudLoginEmail').value=${JSON.stringify(email)};document.getElementById('cloudLoginPassword').value=${JSON.stringify(password)};document.getElementById('cloudLoginForm').requestSubmit();})()`);
  for (let i = 0; i < 250; i++) { if (await w.webContents.executeJavaScript(`document.getElementById('app')?.classList.contains('hidden')===false&&window.BananaCloud?.ready===true&&!!window.BananaCloudSocket?.user`)) return; await wait(100); }
  throw new Error('login timeout');
}
const run = (w, code) => w.webContents.executeJavaScript(`(async()=>{const socket=window.BananaCloudSocket,sleep=ms=>new Promise(r=>setTimeout(r,ms));${code}})()`);
const shot = async (w, name) => { await wait(800); fs.writeFileSync(path.join(OUT, name + '.png'), (await w.webContents.capturePage()).toPNG()); if (process.env.UI_DUMP) fs.writeFileSync(path.join(OUT, name + '.html'), await w.webContents.executeJavaScript("document.body.outerHTML.replace(/data:[^\"')]{80,}/g,'data:…')")); console.log('SNAP ' + name); };
const avatar = key => { const f = AVATARS && path.join(AVATARS, key + '.jpg'); return f && fs.existsSync(f) ? 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64') : ''; };
const q = JSON.stringify;
app.whenReady().then(async () => {
  const js = await bundle(); const pw = 'ui-only-123456';
  const people = [['lia', 'Lia', 'arte nova no ar'], ['bruna', 'Bruna Neves', ''], ['caio', 'Caio', 'no trampo até 19h'], ['davi', 'davi', '']].map(([key, name, custom]) => ({ key, name, custom }));
  for (const [i, p] of people.entries()) {
    const email = `${p.key}-${process.pid}@example.test`;
    const acc = await auth('signUp', { email, password: pw, returnSecureToken: true });
    await auth('update', { localId: acc.localId, emailVerified: true, displayName: p.name }, true);
    p.w = await open(js, p.key, i < 2);
    await login(p.w, email, pw);
    await run(p.w, `await socket.updateProfile({name:${q(p.name)},avatar:${q(avatar(p.key))},customStatus:${q(p.custom)}});`);
  }
  const [lia, bruna, caio, davi] = people;
  const room = JSON.parse(await run(lia.w, `await socket.createServer('Noite de Sexta');let s;for(let i=0;i<100&&!(s=state.servers.find(x=>x.name==='Noite de Sexta'));i++)await sleep(50);
    const icon=${q(avatar('server'))};if(icon)await socket.updateServer({serverId:s.id,icon});
    for(const [name,type] of [['clipes','text'],['ranked','text'],['Squad','voice'],['Só ouvindo','voice']])await socket.createChannel({serverId:s.id,name,type});
    const l=await socket.loadServer(s.id);return JSON.stringify({id:s.id,invite:l.inviteCode,text:l.channels.find(c=>c.type==='text').id,voice:l.channels.find(c=>c.name==='Squad').id})`));
  for (const p of [bruna, caio, davi]) await run(p.w, `await socket.joinServer(${q(room.invite)});`);
  const msgs = [[bruna, 'alguém on hoje à noite? 🎮'], [caio, 'eu topo, saio do trampo às 19h'], [davi, 'bora, mas sem ninguém caindo da call no meio da partida 😂'], [lia, 'criei o canal de voz Squad pra gente'], [bruna, 'perfeito, entro às 19h30'], [caio, '19h30 fechado']];
  for (const [p, text] of msgs) { await run(p.w, `await socket.sendMessage({serverId:${q(room.id)},channelId:${q(room.text)},text:${q(text)}});`); await wait(300); }
  const sel = (p, ch) => run(p.w, `for(let i=0;i<100&&!state.servers.some(s=>s.id===${q(room.id)});i++)await sleep(50);selectServer(${q(room.id)});selectChannel(${q(ch)});await sleep(500);`);
  await sel(lia, room.text); await shot(lia.w, 'chat');
  for (const p of [bruna, caio, davi, lia]) {
    await run(p.w, `selectServer(${q(room.id)});const ch=state.servers.find(s=>s.id===${q(room.id)}).channels.find(c=>c.id===${q(room.voice)});selectChannel(ch.id);await joinVoice(ch);for(let i=0;i<120&&!socket.voice;i++)await sleep(50);`);
    await wait(500);
  }
  for (let i = 0; i < 100; i++) { const st = await lia.w.webContents.executeJavaScript('[...state.voice.peers.values()].map(p=>p.pc.connectionState)'); if (st.length >= 3 && st.every(s => s === 'connected')) break; await wait(100); }
  await run(lia.w, `const img=new Image();img.src=${q(shareImage)};await img.decode();const c=document.createElement('canvas');c.width=1920;c.height=1080;const x=c.getContext('2d');
    const sc=Math.max(1920/img.naturalWidth,1080/img.naturalHeight),dw=img.naturalWidth*sc,dh=img.naturalHeight*sc;const stream=c.captureStream(0),t=stream.getVideoTracks()[0];
    const draw=()=>{x.fillStyle='#060914';x.fillRect(0,0,1920,1080);x.drawImage(img,(1920-dw)/2,(1080-dh)*0.35,dw,dh);t.requestFrame()};draw();setInterval(draw,33);
    navigator.mediaDevices.getDisplayMedia=async()=>stream;toggleScreen();
    for(let i=0;i<60;i++){const b=document.querySelector('#captureChoices button');if(b){b.click();break}await sleep(100)}
    for(let i=0;i<100&&!state.voice.screen;i++)await sleep(100);`);
  await run(davi.w, 'await socket.voiceMedia({muted:true,camera:false,screen:false});');
  await wait(3000);
  await shot(lia.w, 'call-owner');
  await run(bruna.w, `for(let i=0;i<80;i++){const a=[...document.querySelectorAll('button')].find(e=>/Assistir transmiss/.test(e.textContent));if(a){a.click();break}await sleep(100)}
    for(let i=0;i<100;i++){if([...document.querySelectorAll('video')].some(v=>v.videoWidth>0))break;await sleep(100)}`);
  const unlock = await bruna.w.webContents.executeJavaScript("(()=>{const b=[...document.querySelectorAll('.audio-unlock')].find(e=>e.offsetParent);if(!b)return null;const r=b.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()");
  if (unlock) { for (const type of ['mouseDown', 'mouseUp']) bruna.w.webContents.sendInputEvent({ type, x: unlock.x, y: unlock.y, button: 'left', clickCount: 1 }); }
  await wait(2000);
  await shot(bruna.w, 'call-viewer');
  await sel(lia, room.text); await shot(lia.w, 'chat-in-call');
  done(0, 'ui-snapshot complete: ' + OUT);
}).catch(e => done(1, e.stack || String(e)));
