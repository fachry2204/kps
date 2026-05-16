
import fs from 'fs';

const content = fs.readFileSync('src/components/map/MapComponent.tsx', 'utf8');

function checkBalance(str, open, close) {
    let count = 0;
    let stack = [];
    for (let i = 0; i < str.length; i++) {
        if (str.startsWith(open, i)) {
            count++;
            stack.push(i);
        } else if (str.startsWith(close, i)) {
            count--;
            if (count < 0) {
                console.log(`Extra ${close} at ${i}`);
                return;
            }
            stack.pop();
        }
    }
    if (count > 0) {
        console.log(`${count} unclosed ${open} at ${stack}`);
    } else {
        console.log(`${open}/${close} balanced`);
    }
}

console.log("Checking Parens:");
checkBalance(content, "(", ")");
console.log("Checking Curlies:");
checkBalance(content, "{", "}");
console.log("Checking Tags:");
checkBalance(content, "<div", "</div>");
