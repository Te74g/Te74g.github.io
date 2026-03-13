const fs = require('fs');
const path = require('path');

const targetFile = 'js/pages/people.js';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add ES Module Imports at the top
const imports = `import { State, updateState } from '../app/state.js';
import { getUrlParam, updateUrlParam, removeUrlParam, fixPath } from '../app/url.js';
import { getMembersData, getSiteConfig } from '../app/data.js';
import { shouldShowItem, isMemberVisible, getMemberDisplayInfo, getPinClass, getMemberBackground, getMemberFrame, getPageBackground } from '../app/member-utils.js';
import { preloadImage } from '../app/dom.js';
import { fadeIn } from '../app/motion.js';

`;

// Remove old imports
content = content.replace(/import \{ State, updateState \} from '\.\/app\/state\.js';/g, '');
content = content.replace(/import \{ getUrlParam, updateUrlParam, removeUrlParam \} from '\.\/app\/url\.js';/g, '');
content = content.replace(/import \{ getMembersData, getSiteConfig \} from '\.\/app\/data\.js';/g, '');
content = content.replace(/import \{ fadeIn \} from '\.\/app\/motion\.js';/g, '');

// Replace old window references
content = content.replace(/window\.fixPath/g, 'fixPath');
content = content.replace(/window\.shouldShowItem/g, 'shouldShowItem');
content = content.replace(/window\.isMemberVisible/g, 'isMemberVisible');
content = content.replace(/window\.getMemberDisplayInfo/g, 'getMemberDisplayInfo');
content = content.replace(/window\.getPinClass/g, 'getPinClass');
content = content.replace(/window\.getMemberBackground/g, 'getMemberBackground');
content = content.replace(/window\.getMemberFrame/g, 'getMemberFrame');
content = content.replace(/window\.getPageBackground/g, 'getPageBackground');
content = content.replace(/window\.preloadImage/g, 'preloadImage');
content = content.replace(/window\.siteConfig/g, 'getSiteConfig()'); // just in case

// Remove IIFE and await manifest promise that no longer exists globally
content = content.replace(/\(async function \(\) \{/g, 'export async function initPeoplePage() {');
content = content.replace(/\/\/ Wait for Manifest\s*if \(window\.manifestPromise\) await window\.manifestPromise;/g, '');
content = content.replace(/\}\)\(\);/g, '}');

// Rewrite DOMContentLoaded logic to execute cleanly in bootstrap
content = content.replace(/if \(document\.readyState === 'loading'\) \{\s*document\.addEventListener\('DOMContentLoaded', init\);\s*\} else \{\s*init\(\);\s*\}/g, 'await init();');


fs.writeFileSync(targetFile, imports + content.trim() + '\n', 'utf8');
console.log('Successfully refactored people.js to ES Module');
