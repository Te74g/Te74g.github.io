const fs = require('fs');

const dataPath = 'data/members.js';
let content = fs.readFileSync(dataPath, 'utf8');

// 1. Remove dummy members from the file content entirely
// Use regex to carefully match and remove the specific blocks.
// 'uruhunojon' block
content = content.replace(/\s*\{\s*id:\s*"uruhunojon"[\s\S]*?(?=\{(?:\s*id:\s*"|.*\}|\/\/))/g, '');
// 'kanibasiri' block
content = content.replace(/\s*\{\s*id:\s*"kanibasiri"[\s\S]*?(?=\{(?:\s*id:\s*"|.*\}|\/\/))/g, '');

// Clean up any double commas if left behind
content = content.replace(/,\s*,/g, ',');

// 2. Define the new sequence order of IDs you want to reveal.
// We have 16 valid characters now (18 original - 2 dummy).
// Let's specify the exact group order back from the 20th based on the user's input:
// March 20: ten, momo
// March 19: mugidango, aki
// March 18: eno
// March 17: kyosu
// March 16: teto
// March 15: azu
// March 14: bino
// March 13: kirara
// March 12: sakura
// March 11: nagi
// March 10: philia
// March 9: rei
// March 8: wikira, hinekure

const scheduleItems = [
    { dates: '2026-03-20', ids: ['ten', 'momo'] },
    { dates: '2026-03-19', ids: ['mugidango', 'aki'] },
    { dates: '2026-03-18', ids: ['eno'] },
    { dates: '2026-03-17', ids: ['kyosu'] },
    { dates: '2026-03-16', ids: ['teto'] },
    { dates: '2026-03-15', ids: ['azu'] },
    { dates: '2026-03-14', ids: ['bino'] },
    { dates: '2026-03-13', ids: ['kirara'] },
    { dates: '2026-03-12', ids: ['sakura'] },
    { dates: '2026-03-11', ids: ['nagi'] },
    { dates: '2026-03-10', ids: ['philia'] },
    { dates: '2026-03-09', ids: ['rei'] },
    { dates: '2026-03-08', ids: ['wikira', 'hinekure'] },
];

const revealDates = {};
for (const item of scheduleItems) {
    for (const id of item.ids) {
        revealDates[id] = item.dates;
    }
}

// 3. Update or insert the revealDates into the remaining objects
for (const [id, newDate] of Object.entries(revealDates)) {
    // If it already has revealDate, replace it
    const dateRegex = new RegExp(`id:\\s*"${id}"[\\s\\S]*?revealDate:\\s*"[0-9]{4}-[0-9]{2}-[0-9]{2}"`, 'g');
    if (dateRegex.test(content)) {
        content = content.replace(
            new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)revealDate:\\s*"[0-9]{4}-[0-9]{2}-[0-9]{2}"`, 'g'),
            `$1revealDate: "${newDate}"`
        );
    } else {
        // If it doesn't have it (e.g. if previous script failed or was incomplete for some), insert it
        content = content.replace(
            new RegExp(`(id:\\s*"${id}",)`, 'g'),
            `$1\n        revealDate: "${newDate}",`
        );
    }
}

fs.writeFileSync(dataPath, content, 'utf8');
console.log('Successfully removed dummy data and recalculated dates backwards from Mar 20');
