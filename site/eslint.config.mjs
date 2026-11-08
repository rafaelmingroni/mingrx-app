// Site-only checks; no desktop/backend source or runtime dependency is involved.
const globals=Object.fromEntries(['window','document','navigator','location','fetch','AbortController','URL','URLSearchParams','setTimeout','setImmediate','clearTimeout','console','requestAnimationFrame','cancelAnimationFrame','getComputedStyle','ResizeObserver','IntersectionObserver','Buffer','process','require','module','__dirname'].map(name=>[name,'readonly']));
export default [
 {files:['**/*.{js,mjs,cjs}'],languageOptions:{ecmaVersion:'latest',globals},rules:{
  'no-undef':'error','no-unused-vars':['error',{argsIgnorePattern:'^_',caughtErrors:'none'}],
  'no-dupe-args':'error','no-dupe-keys':'error','no-duplicate-case':'error',
  'no-unreachable':'error','no-constant-condition':'error','no-constant-binary-expression':'error',
  'no-async-promise-executor':'error','no-loss-of-precision':'error','no-sparse-arrays':'error',
  'valid-typeof':'error','constructor-super':'error','no-fallthrough':'error'
 }},
 {files:['**/*.cjs'],languageOptions:{sourceType:'commonjs'}},
 {files:['**/app.js','**/invite.js'],languageOptions:{sourceType:'script'}}
];
