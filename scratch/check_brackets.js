
import fs from 'fs';

const content = fs.readFileSync('src/components/map/MapComponent.tsx', 'utf8');

const parenOpen = (content.match(/\(/g) || []).length;
const parenClose = (content.match(/\)/g) || []).length;
const curlyOpen = (content.match(/\{/g) || []).length;
const curlyClose = (content.match(/\}/g) || []).length;

console.log(`paren: ${parenOpen} / ${parenClose}`);
console.log(`curly: ${curlyOpen} / ${curlyClose}`);
