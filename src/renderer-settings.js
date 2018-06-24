/*!
 * Dynamic Time-shifting Desktop renderer settings page
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const {
    ipcRenderer
} = require('electron');

const app = require('electron').remote.app;


function fillSettings(settings) {
    document.getElementById('setting-startup').checked = settings.startup;
    document.getElementById('setting-tray').checked = settings.tray;
    document.getElementById('setting-updates').checked = settings.updates;
    document.getElementById('setting-notifications').checked = settings.notifications;
}

function saveSettings() {
    const settings = {
        startup: document.getElementById('setting-startup').checked,
        tray: document.getElementById('setting-tray').checked,
        updates: document.getElementById('setting-updates').checked,
        notifications: document.getElementById('setting-notifications').checked
    };

    ipcRenderer.send('ipcSaveSettings', settings);
}

document.getElementById('setting-startup').onclick = () => {
    saveSettings();
};
document.getElementById('setting-tray').onclick = () => {
    saveSettings();
};
document.getElementById('setting-notifications').onclick = () => {
    saveSettings();
};
document.getElementById('setting-updates').onclick = () => {
    saveSettings();
};

document.getElementById('btn-show-licenses').onclick = () => {
    ipcRenderer.send('ipcShowLicenses');
};
document.getElementById('btn-samuelcarreira').onclick = () => {
    ipcRenderer.send('ipcSamuelCarreira');
};
document.getElementById('btn-check-updates').onclick = function () {
    this.disabled = true;

    ipcRenderer.send('ipcCheckForUpdates');

    setTimeout(()=> {
        this.disabled = false;
    }, 60000);
};

ipcRenderer.on('ipcUpdateInfo', (event, arg) => {
    document.getElementById('update-info-text').innerText = arg;
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('version-number').innerText = app.getVersion();

    const SETTINGS = ipcRenderer.sendSync('ipcGetSettings');
    fillSettings(SETTINGS);

    // fetch('https://raw.githubusercontent.com/samuelcarreira/dynamic-time-shifting-desktop/master/package.json')
    //     .then(function (response) {
    //         if (response.ok) {
    //             return response.json();
                
    //         } else {
    //             throw Error('Network response was not ok.');
    //         }
    //     })
    //     .then(function(data) {
    //         console.log(data);
    //         console.log(data.version)
    //     })
    //     .catch(function (error) {
    //         console.log('There has been a problem with your fetch operation: ' + error.message);
    //     });
});