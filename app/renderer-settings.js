/*!
 * Dynamic Time-shifting Desktop renderer settings page
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */"use strict";const{ipcRenderer}=require("electron");function fillSettings(a){document.getElementById("setting-startup").checked=a.startup,document.getElementById("setting-tray").checked=a.tray,document.getElementById("setting-notifications").checked=a.notifications}function saveSettings(){const a={startup:document.getElementById("setting-startup").checked,tray:document.getElementById("setting-tray").checked,notifications:document.getElementById("setting-notifications").checked};ipcRenderer.send("ipcSaveSettings",a)}document.getElementById("setting-startup").onclick=()=>{saveSettings()},document.getElementById("setting-tray").onclick=()=>{saveSettings()},document.getElementById("setting-notifications").onclick=()=>{saveSettings()},document.getElementById("btn-show-licenses").onclick=()=>{ipcRenderer.send("ipcShowLicenses")},document.getElementById("btn-samuelcarreira").onclick=()=>{ipcRenderer.send("ipcSamuelCarreira")},document.getElementById("btn-check-updates").onclick=()=>{ipcRenderer.send("ipcUpdatesWebsite")},document.addEventListener("DOMContentLoaded",()=>{const a=ipcRenderer.sendSync("ipcGetSettings");fillSettings(a)});