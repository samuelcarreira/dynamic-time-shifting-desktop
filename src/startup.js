/*!
 * Dynamic Time-shifting Desktop startup
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const AutoLaunch = require('auto-launch');

const config = require('./config');

/**
 * Auto Lauch App on system startup
 * 
 * @param {boolean} enabled  set true to enable/false disable
 * @param {string} appName Application name
 * @param {boolean} debug true to show console results
 */
function autoLaunchApp(enabled, appName, debug = false) {
    if (config.ISDEV) {
        return; // Don't run this in development
    }

    const appAutoLauncher = new AutoLaunch({
        name: appName,
        isHidden: false
    });

    appAutoLauncher.isEnabled()
        .then(isEnabled => {
            if (isEnabled && !enabled) {
                appAutoLauncher.disable();
                if (debug) {
                    global.Log.info('Disable app auto launcher');
                }
            }
            if (!isEnabled && enabled) {
                appAutoLauncher.enable();
                if (debug) {
                    global.Log.info('Enable app auto launcher');
                }
            }
        })
        .catch(err => {
            global.Log.error(`Autolauncher error: ${err}`)
        });
}


module.exports = {
    autoLaunchApp
};