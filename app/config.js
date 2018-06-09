/*!
 * Dynamic Time-shifting Desktop default settings and app config
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */"use strict";const{app}=require("electron"),path=require("path"),getFromEnv=1===parseInt(process.env.ELECTRON_IS_DEV,10),isEnvSet="ELECTRON_IS_DEV"in process.env,ISDEV=isEnvSet?getFromEnv:process.defaultApp||/[\\/]electron-prebuilt[\\/]/.test(process.execPath)||/[\\/]electron[\\/]/.test(process.execPath);function generateSampleImageList(){let a=[];for(let b=1;16>=b;b+=1){const c=path.join(app.getPath("userData"),"sample-wallpapers",`${10>b?"0"+b.toString():b}.jpeg`);a.push(c)}return a}const DEFAULT_SETTINGS={minimizeToTray:!0,notifications:!1,wallpapers:generateSampleImageList(),startup:!0};module.exports={ISDEV,DEFAULT_SETTINGS};