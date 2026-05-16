
import fs from 'fs';

const content = fs.readFileSync('src/components/map/MapComponent.tsx', 'utf8');

const divOpen = (content.match(/<div/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;
const motionDivOpen = (content.match(/<motion.div/g) || []).length;
const motionDivClose = (content.match(/<\/motion.div>/g) || []).length;
const animatePresenceOpen = (content.match(/<AnimatePresence/g) || []).length;
const animatePresenceClose = (content.match(/<\/AnimatePresence>/g) || []).length;

console.log(`div: ${divOpen} / ${divClose}`);
console.log(`motion.div: ${motionDivOpen} / ${motionDivClose}`);
console.log(`AnimatePresence: ${animatePresenceOpen} / ${animatePresenceClose}`);
