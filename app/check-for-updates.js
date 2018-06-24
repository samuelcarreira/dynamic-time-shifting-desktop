/*!
 * Dynamic Time-shifting Desktop check for updates script
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */"use strict";const{app,net}=require("electron"),EventEmitter=require("events").EventEmitter,semver=require("semver");class Updater extends EventEmitter{constructor(){super()}async checkForUpdates(a){if(!a||"string"!=typeof a)throw new TypeError("Feed URL must be a string");try{this.emit("checking-for-update");const b=await requestDataPromise(a),c=await parseVersionData(b);!1===c?this.emit("update-not-available"):this.emit("update-available",c)}catch(a){this.emit("error",a)}}}function requestDataPromise(a){return new Promise((b,c)=>{const d=net.request({method:"GET",redirect:"follow",url:a});d.on("response",a=>{if(200!==a.statusCode&&204!==a.statusCode)return c(new Error(`Invalid status code ${a.statusCode}`));let d="";a.on("data",a=>{d+=a}).on("end",()=>b(d))}).on("error",a=>c(a)),d.end()})}async function parseVersionData(a){try{const b=JSON.parse(a);if("undefined"==typeof b.version||!semver.valid(b.version))throw new Error("Invalid JSON");return semver.gt(b.version,app.getVersion())?Promise.resolve(b.version):Promise.resolve(!1)}catch(a){return Promise.reject(`Parsing version: ${a}`)}}module.exports={Updater};