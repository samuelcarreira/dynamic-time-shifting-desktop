/*!
 * Dynamic Time-shifting Desktop startup
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */"use strict";const AutoLaunch=require("auto-launch"),config=require("./config");function autoLaunchApp(a,b,c=!1){if(config.ISDEV)return;const d=new AutoLaunch({name:b,isHidden:!1});d.isEnabled().then(b=>{b&&!a&&(d.disable(),c&&global.Log.info("Disable app auto launcher")),!b&&a&&(d.enable(),c&&global.Log.info("Enable app auto launcher"))}).catch(a=>{global.Log.error(`Autolauncher error: ${a}`)})}module.exports={autoLaunchApp};