/**
 * @desc Reads the appropriate settings json file, parses it, and exports it as
 * an object.
 * @version 0.1.0
 */

'use strict';

/**
 * ignore
 */
const isTest = typeof global.it === 'function',
    fs = require('fs'),
    path = require('path'),
    ceallogaDir = __dirname,
    resourcesDir = path.join(ceallogaDir, 'resources'),
    settingsFile = isTest ? 'settings.test.json' : 'settings.prod.json',
    settingsPath = path.join(resourcesDir, settingsFile),
    settingsBuf = fs.readFileSync(settingsPath, 'utf8'),
    settings = JSON.parse(settingsBuf);

settings.isTest = isTest;
settings.env = process.env.NODE_ENV || 'dev';
settings.appDir = path.resolve(__dirname);

module.exports = settings;
