/*!
 * Dynamic Time-shifting Desktop check for updates script
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const {
    app,
    net
} = require('electron');

// Node native modules
const EventEmitter = require('events').EventEmitter;

// NPM modules
const semver = require('semver');

/**
 * Update the app
 */
class Updater extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * Check for Updates
     * 
     * @param {string} feedURL Update JSON file full URL
     */
    async checkForUpdates(feedURL) {
        if (!feedURL || typeof feedURL !== 'string') {
            throw new TypeError('Feed URL must be a string');
        }

        try {
            this.emit('checking-for-update');

            const rawData = await requestDataPromise(feedURL);

            const parsedVersion = await parseVersionData(rawData);

            if (parsedVersion === false) {
                // Older or same version found
                this.emit('update-not-available');
            } else {
                // new version
                this.emit('update-available', parsedVersion);
            }
        } catch (err) {
            //console.error(`Checking for updates: ${err}`);
            this.emit('error', err);
        }
    }
}

/**
 * Request JSON data from server
 * uses net module (electron)
 * 
 * @param {string} requestURL
 */
function requestDataPromise(requestURL) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: 'GET',
            redirect: 'follow',
            url: requestURL
        };

        const request = net.request(requestOptions);

        request.on('response', (response) => {
            if (response.statusCode !== 200 && response.statusCode !== 204) {
                return reject(new Error(`Invalid status code ${response.statusCode}`));
            }

            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                return resolve(data);
            });
        }).on('error', (err) => {
            return reject(err);
        });

        request.end();
    });
}

/**
 * Parse version data and compare with the current
 * app version
 * 
 * @param {object} data JSON data
 * @return {Promise} 
 */
async function parseVersionData(data) {
    try {
        const parsed = JSON.parse(data);

        //console.log(data);

        if (typeof parsed.version === 'undefined' ||
            !semver.valid(parsed.version)) {
            throw new Error('Invalid JSON');
        }

        // compare versions
        if (semver.gt(parsed.version, app.getVersion())) {
            //console.log(`New version found ${updateVersion}`);
            return Promise.resolve(parsed.version);
        } else {
            //console.log(`Older or same version found ${parsed.version}`);
            return Promise.resolve(false);
        }
    } catch (err) {
        return Promise.reject(`Parsing version: ${err}`);
    }
}

module.exports = {
    Updater
};