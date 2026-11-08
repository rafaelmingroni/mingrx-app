// Fetch the official Satoshi WOFF2 at build time. The ITF Free Font License permits
// embedding in desktop applications but not redistributing the font file through the
// repository, so the file is downloaded here and verified by SHA-256.
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const destination = path.join(__dirname, '..', 'src', 'fonts', 'satoshi-variable.woff2');
const source = 'https://cdn.fontshare.com/wf/NWBQYJIM7GCZ5XWD7D26ARB3VDY55ZRT/K63EV2KZIGKLE7RANQ2U42S6SVHU5RJ7/X6XYTKIVDUW7GZTZPZNN4EUM5KH54KHF.woff2';
const expected = 'e739aff9b4d02c264341d6d4872edcda28e79373aeda936f659566a1cd3eb47f';
const matches = bytes => crypto.createHash('sha256').update(bytes).digest('hex') === expected;

let bytes = fs.existsSync(destination) ? fs.readFileSync(destination) : null;
if (!bytes || !matches(bytes)) {
  bytes = execFileSync('curl', ['--fail', '--silent', '--show-error', '--proto', '=https', '--tlsv1.2',
    '--connect-timeout', '15', '--max-time', '60', '--retry', '2', source], { maxBuffer: 1024 * 1024 });
  if (!matches(bytes)) throw new Error('Official Satoshi font checksum changed; review the source before shipping.');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
}
console.log('Satoshi: official WOFF2 verified for the app (SHA-256).');
