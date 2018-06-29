/*!
 * Dynamic Time-shifting Desktop main Class
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const EventEmitter = require('events').EventEmitter;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const execFile = promisify(require('child_process').execFile);

const wallpaper = require('wallpaper');
const fsoperations = require('./fsoperations');


module.exports = class DynamicWallpaper extends EventEmitter {
    /**
     * Dynamic Wallpaper Main Class
     * @param {array} wallpapers List of all wallpaper files (ordered chronologically)
     */
    constructor(wallpapers) {
        super();

        this._wallpapers = wallpapers;
        this.init();
        this._linuxDesktop = null;
    }

    /**
     * Set Wallpapers list
     * @param {array} newWallpapers List of all wallpaper files (ordered chronologically)
     */
    set setWallpapers(newWallpapers) {
        this._wallpapers = newWallpapers;
    }

    /**
     * Add new wallpapers to current wallpaper list
     * @param {array} newWallpapers List of wallpaper files (ordered chronologically)
     */
    addWallpapers(newWallpapers) {
        newWallpapers.forEach(element => {
            this._wallpapers.push(element);
        });
    }

    /**
     * Get current time percentage
     * Example: 12:00 => 0.5 (50%)
     * @returns {number} current percentage
     */
    get nowPercentage() {
        const dateNow = new Date(); // current datetime
        const nowSeconds = (dateNow.getHours() * 3600) + (dateNow.getMinutes() * 60) + dateNow.getSeconds();
        return nowSeconds / 86400; // 86400 seconds on 1 day
    }

    /**
     * Outputs current system wallpaper complete file
     */
    get currentSystemWallpaper() {
        return new Promise((resolve, reject) => {
            wallpaper.get()
                .then(file => {
                    resolve(file);
                })
                .catch(err => {
                    //global.Log.error(`Get current System Wallpaper: ${err}`);
                    reject(err);
                });
        });
    }

    /**
     * Returns total number of wallpapers on the list
     */
    get numberOfWallpapers() {
        return this._wallpapers.length;
    }

    /**
     * Get all wallpaper list
     */
    get wallpapersList() {
        return this._wallpapers;
    }

    /**
     * Retreive current Linux desktop environment
     * Experimental feature (tested with ubuntu 18.x and
     * lubuntu 18.x)
     * @returns {string|boolean} gnome, lxde or false (if
     *                           no matches found)
     */
    async getDesktopEnv() {
        try {
            const result = await exec('echo $XDG_CURRENT_DESKTOP');

            if (result.includes('GNOME')) {
                return 'gnome';
            } else if (result.includes('LXDE')) {
                return 'lxde';
            } else {
                return false;
            }
        } catch (err) {
            console.error(`Get desktop environment: ${err}`);
            return false;
        }
    }

    /**
     * Startup function:
     * calculate wallpaper and create a recurrent task
     */
    init() {
        this.calculateWallpaper();

        setInterval(() => {
            this.calculateWallpaper();
        }, 600000); // each 10 minutes = 600.000
    }

    /**
     * Calculate current wallpaper from the list, based on
     * the time percentage
     * @param {number} percentage time percentage (value between 0 and 1) Optional
     * @returns {string} wallpaper filename
     */
    calculateWallpaperFile(percentage = null) {
        if (!this.numberOfWallpapers) {
            return false; // no wallpapers
        }

        // no specific percentage, calculte from current time
        percentage = percentage != null ? percentage : this.nowPercentage;

        if (percentage < 0) {
            percentage = 0;
        }
        if (percentage > 1) {
            percentage = 1;
        }

        const wallpaperIndex = Math.round(percentage * (this.numberOfWallpapers - 1));

        global.Log.debug(`Wallpaper ${wallpaperIndex + 1} of ${this.numberOfWallpapers}`);

        return this._wallpapers[wallpaperIndex];
    }

    /**
     * Calculate current wallpaper from the list, based on now time
     */
    calculateWallpaper() {
        if (!this.numberOfWallpapers) {
            return; // no wallpapers
        }

        const wallpaperIndex = Math.round(this.nowPercentage * (this.numberOfWallpapers - 1));

        global.Log.debug(`Wallpaper ${wallpaperIndex + 1} of ${this.numberOfWallpapers}`);

        this.changeWallpaper(this._wallpapers[wallpaperIndex]);
    }

    /**
     * Change the current system wallpaper
     * @param {string} newWallpaperFile wallpaper filename
     */
    async changeWallpaper(newWallpaperFile) {
        try {
            if (!this._linuxDesktop === null) {
                const currentWallpaper = await this.currentSystemWallpaper;

                if (currentWallpaper === newWallpaperFile) {
                    return; // no need to change wallpaper
                }
            }

            const isReadable = await fsoperations.checkReadPermissions(newWallpaperFile);

            if (!isReadable) {
                global.Log.error(`Cannot read wallpaper file: ${newWallpaperFile}`);
                return;
            }

            if (process.platform === 'linux') {
                if (this._linuxDesktop === null) {
                    this._linuxDesktop = await this.getDesktopEnv();
                }

                if (this._linuxDesktop === 'gnome') {
                    // for ubuntu
                    execFile('gsettings', ['set', 'org.gnome.desktop.background', 'picture-uri', `'file://${newWallpaperFile}'`], (err) => {
                        if (err) {
                            global.Log.error(`Cannot change wallpaper: ${err}`);
                            return;
                        }
                    });
                } else if (this._linuxDesktop === 'lxde') {
                    exec(`pcmanfm --set-wallpaper='${newWallpaperFile}'`, (err) => {
                        if (err) {
                            global.Log.error(`Cannot change wallpaper: ${err}`);
                            return;
                        }
                    });
                } else {
                    wallpaper.set(newWallpaperFile);
                }

                // cp.execFile('gsettings', ['set', 'org.gnome.desktop.background', 'picture-uri', '/home/samc/Imagens/marguerite-daisy-beautiful-beauty.jpg'], (err, stdout) => {
                //     if (err) {
                //         console.error(err);
                //         return;
                //     }

                //     console.log(stdout)
                // })

            } else {
                wallpaper.set(newWallpaperFile);
            }

            this.emit('wallpaperChanged');

            global.Log.info(`Wallpaper changed to: ${newWallpaperFile}`);
        } catch (err) {
            global.Log.error(`Cannot change wallpaper: ${err}`);
        }
    }
}


// wallpaper.set('mojave_dynamic_1.jpeg').then(() => {
// 	console.log('done');
// });