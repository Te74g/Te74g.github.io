const fs = require('fs');
let content = fs.readFileSync('_config/data_members.js', 'utf8');

const revealDates = {
    'ten': '2026-03-06',
    'momo': '2026-03-06',
    'hinekure': '2026-03-06',
    'wikira': '2026-03-06',
    'rei': '2026-03-07',
    'faria': '2026-03-08',
    'nagi': '2026-03-09',
    'sakura': '2026-03-10',
    'uruhunojon': '2026-03-11',
    'kirara': '2026-03-12',
    'bino': '2026-03-13',
    'azu': '2026-03-14',
    'teto': '2026-03-15',
    'kanibasiri': '2026-03-16',
    'kyosu': '2026-03-17',
    'eno': '2026-03-18',
    'aki': '2026-03-19',
    'mugidango': '2026-03-20'
};

for (const [id, date] of Object.entries(revealDates)) {
    const searchString = `id: "${id}",`;
    const replaceString = `id: "${id}",\n        revealDate: "${date}",`;
    content = content.replace(searchString, replaceString);
}

fs.writeFileSync('_config/data_members.js', content, 'utf8');
console.log('Updated data_members.js');
