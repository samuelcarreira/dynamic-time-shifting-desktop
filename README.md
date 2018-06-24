# Dynamic Time-shifting Desktop
A cross-platform (Windows and Linux) app that changes automatically the wallpaper throughout the day. You can create amazing time-shifts like on the dynamic desktop feature of macOS Mojave

![preview](https://gitlab.com/samuelcarreira/dynamic-time-shifting-desktop/raw/d01406c8a084d3fd0c49c7e8d9d35bfefe50ce71/gif-preview.gif)

![preview](https://gitlab.com/samuelcarreira/dynamic-time-shifting-desktop/raw/master/preview-app.jpg)

## Highlights
- Completly free and open source software
- Easy to use: you only need to specify the wallpaper image files, and the app will cycle them throughout the day (no need to specify a timer for each image)
- Safe: open source, with only verified Node.js external dependencies
- Includes the macOS X Mojave dynamic desktop wallpaper (Full HD resolution images)

## Download
https://dl.orangedox.com/dynamic-time-shifting-desktop

or go to releases page:

https://github.com/samuelcarreira/dynamic-time-shifting-desktop/releases´

**NOTE: Ignore Security Warnings. This app wasn't signed with an enterprise certificate**



## Quick guide
-  Download and install the app on your system
-  You can use the included desert dynamic desktop wallpaper, extracted from macOS X Mojave or you can add your custom files
-  Drag the image items on the list to specify the playing order. Note that the first item will be played at the midnight (0:00)
-  The app splits the list of wallpapers evenly throughout the day (click on the Preview button to check the results) so if you add 24 images, the app will change the wallpaper each hour
-  Let the app run in background and enjoy

## A quick story of this app
When I saw the new Apple macOS X Mojave dynamic desktop feature I searched online for an alternative to use on a Windows 10 PC. I only found paid or old software and many of them don't have the time-shifting feature so I decided to quickly write an Electron app on one night.

## TODO list
- [x]  New app icon
- [ ]  Interface improvements
- [x]  Check for updates feature
- [ ]  Linux compilations
- [ ]  Code revision for bug squashing

## FAQ
##### I want to synchronize the wallpaper with the current day-night cycle, but I didn't have enough images
> You can duplicate the same file on the wallpaper list (just add it again), so you can have the same night wallpaper repeating during nighttime, and have different wallpapers to be changed during the day

##### There are any keyboard shortcuts?
> Currently only F1 to see some tips on the main window

##### I reordered the wallpaper list, why I cannot see the changes on my system?
> The app verify the wallpaper every 10 minutes, so you have to wait for the next verification, or you can restart the app

##### I found a bug, what can I do?
> Please create a new issue or send me a private message. I will try to reply on my free time

##### This app slowdown my system?
> The app checks for the wallpapers every 10 minutes, so the CPU usage is very low. Also, I almost only use native Node.js modules to minimize the app dependencies. Note that because it's an Electron app the RAM memory consumption is about 50 MB

##### How to remove an image from the list?
> Unhide the delete item button: mouse hover on the right side of the item


## License and Credits

Licensed under MIT

Copyright (c) 2018 [Samuel Carreira]

Mockup adapted from the work created by Aleksandr_samochernyi - Freepik.com

Wallpaper module: sindresorhus - https://github.com/sindresorhus/wallpaper

macOS Mojave extracted wallpapers: xtai - https://github.com/xtai/mojave-dynamic-heic