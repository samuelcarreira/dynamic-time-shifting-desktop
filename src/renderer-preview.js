/*!
 * Dynamic Time-shifting Desktop renderer preview page
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

document.getElementById('time-range-slider').onchange = function () {
    // NOTE: onchange do not trigger when scrolling
    ipcRenderer.send('ipcSliderChange', this.value);

    document.getElementById('hour-value').innerText = percentagetoTime(this.value / 100);
}

ipcRenderer.on('ipcWallpaperFile', (event, arg) => {
    const imageEl = document.getElementById('background-wallpaper-image');

    document.getElementById('time-range-slider').disabled = true;

    document.body.style.cursor = "wait";

    imageEl.src = arg;
    // imageEl.style.display = 'block';
    // imageEl.style.opacity = 1;

    imageEl.onerror = function (e) {
        imageEl.src = "";
        document.body.style.cursor = "default";
        document.getElementById('time-range-slider').disabled = false;
        // imageEl.style.opacity = 0;
        // imageEl.style.display = 'none';
    };

    imageEl.onload = function (e) {
        document.body.style.cursor = "default";
        document.getElementById('time-range-slider').disabled = false;
    };
});


/**
 * Converts percentage of time to h:mm
 * @param {number} d seconds
 * @returns h:mm
 */
function percentagetoTime(d) {
    if (isNaN(d) || d === null || d < 0 || d >= 1) {
        d = 0;
    }
    d = Number(d * 86400);
    
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);

    return h + ":" + (m < 10 ? "0" : "") + m;
}


document.addEventListener('DOMContentLoaded', () => {
    const dateNow = new Date(); // current datetime
    const nowSeconds = (dateNow.getHours() * 3600) + (dateNow.getMinutes() * 60) + dateNow.getSeconds();
    
    const currentPercentage = (nowSeconds / 86400) * 100;

    document.getElementById('time-range-slider').value = currentPercentage;
    document.getElementById('hour-value').innerText = percentagetoTime(currentPercentage / 100);

    ipcRenderer.send('ipcSliderChange', currentPercentage);
});