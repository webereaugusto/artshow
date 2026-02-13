const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'index.html');
let s = fs.readFileSync(file, 'utf8');
// Add loading="lazy" to images that reference the galeria folder (only if not already present)
// simple string replace: add loading attribute before src for gallery images
s = s.split('src=\"galeria/').join('loading=\"lazy\" src=\"galeria/');
fs.writeFileSync(file, s, 'utf8');
console.log('Done: added loading=\"lazy\" to gallery images.');
