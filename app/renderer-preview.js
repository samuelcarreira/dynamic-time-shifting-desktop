/*!
 * Dynamic Time-shifting Desktop renderer preview page
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */"use strict";const{ipcRenderer}=require("electron");document.getElementById("time-range-slider").onchange=function(){ipcRenderer.send("ipcSliderChange",this.value),document.getElementById("hour-value").innerText=percentagetoTime(this.value/100)},ipcRenderer.on("ipcWallpaperFile",(a,b)=>{const c=document.getElementById("background-wallpaper-image");document.getElementById("time-range-slider").disabled=!0,document.body.style.cursor="wait",c.src=b,c.onerror=function(){c.src="",document.body.style.cursor="default",document.getElementById("time-range-slider").disabled=!1},c.onload=function(){document.body.style.cursor="default",document.getElementById("time-range-slider").disabled=!1}});function percentagetoTime(a){var b=Math.floor;(isNaN(a)||null===a||0>a||1<=a)&&(a=0),a=+(86400*a);const c=b(a/3600),e=b(a%3600/60);return c+":"+(10>e?"0":"")+e}document.addEventListener("DOMContentLoaded",()=>{const a=new Date,b=3600*a.getHours()+60*a.getMinutes()+a.getSeconds(),c=100*(b/86400);document.getElementById("time-range-slider").value=c,document.getElementById("hour-value").innerText=percentagetoTime(c/100),ipcRenderer.send("ipcSliderChange",c)});