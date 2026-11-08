// Controlled lab measurements, not field Core Web Vitals or a Lighthouse score.
// Run with the project's pinned Electron; optional MINGRX_SITE_ROOT and MINGRX_PERFORMANCE_REPORT.
const {app,BrowserWindow,session}=require('electron');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const root=path.resolve(process.env.MINGRX_SITE_ROOT||__dirname);
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'mingrx-perf-'));
app.setPath('userData',profile);app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('disable-dev-shm-usage');
app.on('window-all-closed',()=>{});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let server,win;
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
const results=[];
const deadline=setTimeout(()=>finish(1,'Performance benchmark timed out'),180000);
function finish(code,error){clearTimeout(deadline);if(error)console.error(error);win?.destroy();server?.close();fs.rmSync(profile,{recursive:true,force:true});app.exit(code)}
app.whenReady().then(async()=>{
 server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const instrument=`window.__lab={lcp:0,cls:0,interactionMax:0,longTasks:0};for(const type of ['largest-contentful-paint','layout-shift','event','longtask']){try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')__lab.lcp=e.startTime;if(type==='layout-shift'&&!e.hadRecentInput)__lab.cls+=e.value;if(type==='event'&&e.interactionId)__lab.interactionMax=Math.max(__lab.interactionMax,e.duration);if(type==='longtask')__lab.longTasks+=e.duration}}).observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})})}catch{}}`;
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  for(let run=1;run<=3;run++){
   const isolated=session.fromPartition(`perf-${name}-${run}`);
   isolated.webRequest.onBeforeRequest((details,done)=>done({cancel:/^https?:/.test(details.url)&&!details.url.startsWith(origin+'/')}));
   win=new BrowserWindow({show:true,width,height,webPreferences:{session:isolated,nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
   win.setContentSize(width,height);
   await win.loadURL('about:blank');
   win.webContents.debugger.attach('1.3');
   const cdp=(method,params={})=>win.webContents.debugger.sendCommand(method,params);
   await cdp('Page.enable');await cdp('Page.addScriptToEvaluateOnNewDocument',{source:instrument});
   await cdp('Network.enable');await cdp('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000,connectionType:'cellular4g'});
   await cdp('Emulation.setCPUThrottlingRate',{rate:4});
   console.log('Loading',name,run);await win.loadURL(origin+'/');console.log('Loaded',name,run);await win.webContents.executeJavaScript('document.fonts.ready');await wait(1800);
   // Trusted interaction sample. No synthetic timing is presented as field INP.
   for(const selector of ['#tab-call','.faq summary']){
    await win.webContents.executeJavaScript(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'});void 0`);await wait(500);
    const point=await win.webContents.executeJavaScript(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`);
    win.webContents.sendInputEvent({type:'mouseDown',...point,button:'left',clickCount:1});win.webContents.sendInputEvent({type:'mouseUp',...point,button:'left',clickCount:1});await wait(600);
   }
   const metrics=await win.webContents.executeJavaScript(`({...window.__lab,resources:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)).map(e=>({name:new URL(e.name).pathname,bytes:e.transferSize,duration:Math.round(e.duration)}))})`);
   const item={scenario:name,run,viewport:{width,height},...metrics,lcp:Math.round(metrics.lcp),interactionMax:Math.round(metrics.interactionMax),longTasks:Math.round(metrics.longTasks)};
   results.push(item);console.log(JSON.stringify({...item,resources:undefined}));win.destroy();win=null;
  }
 }
 const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
 const report={kind:'controlled-lab',source:root,conditions:{runs:3,coldCache:true,cpuSlowdown:4,latencyMs:150,downloadBytesPerSecond:200000,uploadBytesPerSecond:100000,releaseApi:'blocked; official static fallback retained'},notes:['LCP and cumulative unexpected layout shift measured in a controlled Chromium lab.','interactionMax is the maximum observed Event Timing duration from two trusted sample clicks, not field INP.','No production deployment or field performance claim.'],summary:['desktop','mobile'].map(scenario=>({scenario,lcpMs:median(results.filter(r=>r.scenario===scenario).map(r=>r.lcp)),cls:median(results.filter(r=>r.scenario===scenario).map(r=>r.cls)),sampleInteractionMs:median(results.filter(r=>r.scenario===scenario).map(r=>r.interactionMax))})),runs:results};
 if(process.env.MINGRX_PERFORMANCE_REPORT){fs.mkdirSync(path.dirname(process.env.MINGRX_PERFORMANCE_REPORT),{recursive:true});fs.writeFileSync(process.env.MINGRX_PERFORMANCE_REPORT,JSON.stringify(report,null,2)+'\n')}
 console.log('LAB SUMMARY',JSON.stringify(report.summary));finish(0);
}).catch(error=>finish(1,error.stack));
