// Buildless site: prepare verified assets, validate, and stage only public files.
import {cp,mkdir,readdir,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const source=fileURLToPath(new URL('.',import.meta.url));
const args=process.argv.slice(2);
if(args.length&&!(args.length===2&&args[0]==='--out'))throw Error('Usage: node site/build.mjs [--out directory]');
const output=path.resolve(args[1]||fileURLToPath(new URL('../work/site-preview/',import.meta.url)));
if(source.startsWith(output+path.sep)||output===source.slice(0,-1)||output.startsWith(source))throw Error('Build output must be separate from source.');
for(const file of ['prepare-fonts.mjs','validate.mjs','test-invites.mjs'])execFileSync(process.execPath,[path.join(source,file)],{stdio:'inherit'});
await mkdir(output,{recursive:true});
for(const name of await readdir(source)){
 if(name==='assets'||name==='CNAME'||name==='.nojekyll'||name==='favicon.ico'||name==='robots.txt'||name==='sitemap.xml'||/\.(html|css)$/.test(name)||['app.js','invite.js','components.js'].includes(name))await cp(path.join(source,name),path.join(output,name),{recursive:true});
}
let files=0,bytes=0;
async function count(dir){for(const name of await readdir(dir)){const p=path.join(dir,name),s=await stat(p);if(s.isDirectory())await count(p);else{files++;bytes+=s.size}}}
await count(output);
console.log(JSON.stringify({output,files,bytes,kind:'static',published:false}));
