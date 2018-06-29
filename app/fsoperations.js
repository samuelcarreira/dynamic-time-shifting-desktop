/*!
 * Dynamic Time-shifting Desktop file system operations
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */"use strict";const fs=require("fs"),path=require("path");function globDirPromise(a,b={}){return new Promise((c,d)=>{try{fs.readdir(a,(e,f)=>{if(e)return d(e);let g=[];b.filter=b.filter||[".jpg",".jpeg",".png"],f.forEach(c=>{b.filter.includes(path.extname(c))&&(b.includePath?g.push(path.join(a,c)):g.push(c))}),c(g)})}catch(a){d(a)}})}function checkReadPermissions(a){return new Promise(b=>{if("string"!=typeof a)throw new TypeError("Filepath must be a string");fs.access(path.normalize(a),fs.constants.R_OK,a=>{a?b(!1):b(!0)})})}module.exports={globDirPromise,checkReadPermissions};