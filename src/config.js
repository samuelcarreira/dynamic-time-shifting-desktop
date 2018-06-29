/*!
 * Dynamic Time-shifting Desktop default settings and app config
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const {
    app
} = require('electron');

const path = require('path');

// --------------- Electron isDEV -------------------------
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isEnvSet = 'ELECTRON_IS_DEV' in process.env;

const ISDEV = isEnvSet ? getFromEnv : (process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath));
// ---------------------------------- ./ End Electron isDEV

/**
 * Generate the default included sample images fullpath
 * all images are stored on root/resources/sample-wallpapers folder
 * name 01.jpeg ... 16.jpeg
 * 
 * @returns {array} all files fullpath and filename
 */
function generateSampleImageList() {
    let wallpapers = new Array();

    for (let i=1; i <= 16; i+=1) {
        const filename = path.join(path.dirname(app.getPath("exe")), 'resources' ,'sample-wallpapers', `${i < 10 ? '0' + i.toString() : i}.jpeg`)
        //const filename = path.join(app.getPath('userData'), 'sample-wallpapers', `${i < 10 ? '0' + i.toString() : i}.jpeg`);
        wallpapers.push(filename);
    }

    return wallpapers;
}

// function initialWallpapers() {
//     if (process.platform === 'win32') {
//         return generateSampleImageList();
//     } else {
//         return new Array(); // empty array
//     }
// }

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
    minimizeToTray: true,
    notifications: false,
    wallpapers: generateSampleImageList(),
    startup: true,
    updates: true
};

module.exports = {
    ISDEV,
    DEFAULT_SETTINGS,
    UPDATE_URL: 'https://raw.githubusercontent.com/samuelcarreira/dynamic-time-shifting-desktop/master/package.json',
    DOWNLOAD_URL: 'https://github.com/samuelcarreira/dynamic-time-shifting-desktop/'
};