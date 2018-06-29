/*!
 * Dynamic Time-shifting Desktop file system operations
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * List all files in folder that matches a specific extension
 * 
 * uses native node fs module
 * @param {string} dir The directory to serach
 * @param {object} options
 * @param {array|string} options.filter Array of file extensions default: ['.jpg', '.jpeg', '.png']
 * @param {boolean} options.includePath include path in output default: false
 * @returns {array} list of files
 */
function globDirPromise(dir, options = {}) {
    return new Promise((resolve, reject) => {
        try {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                let glob = new Array;

                options.filter = options.filter || ['.jpg', '.jpeg', '.png']; // default extensions

                files.forEach((file) => {
                    if (options.filter.includes(path.extname(file))) {
                        if (options.includePath) {
                            glob.push(path.join(dir, file));
                        } else {
                            glob.push(file);
                        }
                    }
                });

                resolve(glob);
            });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 * Check file/folder read permissions (async)
 * 
 * uses native fs module
 * @param {string} filepath filepath
 * @returns {boolean}
 */
function checkReadPermissions(filepath) {
    return new Promise((resolve) => {
      if (typeof filepath !== 'string') {
        throw new TypeError('Filepath must be a string');
      }
  
      fs.access(path.normalize(filepath), fs.constants.R_OK, (err) => {
        if (err) {
          //console.log(`${filepath} is not readable. Error ${err}`);
          resolve(false);
        } else {
          //console.log(`${filepath} is readable`);
          resolve(true);
        }
      });
    });
  }

  module.exports = {
    globDirPromise,
    checkReadPermissions
  };