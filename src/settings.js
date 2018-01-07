'use strict';

const isTest = typeof global.it === 'function';
const fs = require('fs');
const path = require('path');
const ceallogaDir = __dirname;
const resourcesDir = path.join(ceallogaDir, 'resources');
const settingsFile = isTest ? 'settings.test.json' : 'settings.prod.json';
const settingsPath = path.join(resourcesDir, settingsFile);
const settingsBuf = fs.readFileSync(settingsPath, 'utf8');
const settings = JSON.parse(settingsBuf);

settings.isTest = isTest;

module.exports = settings;
