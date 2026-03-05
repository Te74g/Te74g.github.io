const fs = require('fs');
const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/^pick ([0-9a-f]+) chore: clean up leftover backup.*/m, 'r  chore: clean up leftover backup');
content = content.replace(/^pick ([0-9a-f]+) chore: remove orphaned member.*/m, 'r  chore: remove orphaned member');
fs.writeFileSync(file, content);
