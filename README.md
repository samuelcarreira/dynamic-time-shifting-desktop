# Dynamic Time-shifting Desktop
A cross-platform (Windows and Linux) app that changes automatically the wallpaper throughout the day. You can create amazing time-shifts like on the dynamic desktop feature of macOS Mojave

![preview](https://raw.githubusercontent.com/samuelcarreira/dynamic-time-shifting-desktop/master/gif-preview.gif)

![preview](https://raw.githubusercontent.com/samuelcarreira/dynamic-time-shifting-desktop/master/preview-app.jpg)


## Highlights
- Completly free Open Source Software
- Easy to use: you only need to specify the wallpaper image files, and the app will cycle them throughout the day (no need to specify a timer for each image)
- Safe: open source, with only 1 verified Node.js external dependency 
- Includes the macOS X Mojave dynamic desktop wallpaper (Full HD resolution images)

## WARNING
**This is an Alpha release, you may find some bugs or not completely implemented features**

## A quick story of this app
When I saw the new Apple macOS X Mojave dynamic desktop feature I searched online for an alternative to use on a Windows 10 PC. I only found paid or old software and many of them don't have the time-shifting feature so I decided to quickly write an Electron app on one night.
 
## Quick guide
-  Download and install the app on your system ( Go to releases page: https://github.com/samuelcarreira/dynamic-time-shifting-desktop/releases )
-  You can use the included desert dynamic desktop wallpaper, extracted from macOS X Mojave (credits to xtai: https://github.com/xtai/mojave-dynamic-heic ) or you can add your custom files
-  Drag the image items on the list to specify the playing order. Note that the first item will be played at the midnight (0:00)
-  The app splits the list of wallpapers evenly throughout the day (click on the Preview button to check the results) so if you add 24 images, the app will change the wallpaper each hour
-  Let the app run in background and enjoy



## TODO list
- [ ]  New app icon (I use an icon from another app) 
- [ ]  Interface improvements
- [ ]  Check for updates feature
- [ ]  Linux compilations
- [ ]  Code revision for bug squashing

## FAQ
##### There are any keyboard shortcuts?
> Currently only F1 to see some tips on the main window

##### I reordered the wallpaper list, why I cannot see the changes on my system?
> The app verify the wallpaper every 10 minutes, so you have to wait for the next verification, or you can restart the app

##### I want to synchronize the wallpaper with the current day-night cycle, but I didn't have enough images
> You can duplicate the same file on the wallpaper list (just add it again), so you can have the same night wallpaper repeating during nighttime, and have different wallpapers to be changed during the day

##### I found a bug, what can I do?
> Please create a new issue or send me a private message. I will try to reply on my free time

##### This app slowdown my system?
> The app checks for the wallpapers every 10 minutes, so the CPU usage is very low. Also, I only use the wallpaper module (credits to sindresorhus - https://github.com/sindresorhus/wallpaper ) to minimize the app dependencies. Note that because it's an Electron app the RAM memory consumption is about 70 MB

##### How to remove an image from the list?
> Unhide the delete item button: mouse hover on the right side of the item


## License

Licensed under MIT

Copyright (c) 2018 [Samuel Carreira]

Mockup adapted from the work created by Aleksandr_samochernyi - Freepik.com
