/*!
 * Dynamic Time-shifting Desktop main process
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

console.time('start'); // benchmark startup

// -------------------- Electron native modules ----------------------------
const {
	app,
	BrowserWindow,
	ipcMain,
	Tray,
	Menu,
	dialog,
	shell
} = require('electron');

// ----------------- npm modules dependencies ------------------------------
const path = require('path');
const url = require('url');
const winston = require('winston');
const electronStore = require('electron-store');

// -------------------- custom modules -----------------------------------------------
const config = require('./config');
const startup = require('./startup');
const dynamicWallpaper = require('./dynamic-wallpaper');
const fsoperations = require('./fsoperations');
const checkForUpdates = require('./check-for-updates');

// -------------------- App Settings --------------------------------------------------
class Settings extends electronStore {
	constructor(opts) {
		super(opts);
		this._options = new Object;
	}

	/**
	 * Get all values from RAM
	 */
	get getRAMOptions() {
		return this._options;
	}

	/**
	 * Set all values to RAM
	 */
	set setRAMOptions(newoptions) {
		this._options = newoptions;
	}

	/**
	 * Get value from RAM
	 * @param {string} prop property
	 * @returns value
	 */
	getR(prop) {
		if (typeof prop !== 'string') {
			throw new TypeError('Property should be a string');
		}
		return this._options[prop];
	}

	/**
	 * Set value to RAM
	 * @param {string} prop property
	 * @param {*} value value
	 */
	setR(prop, value) {
		this._options[prop] = value;
	}
}

const SETTINGS = new Settings({
	defaults: config.DEFAULT_SETTINGS
});
SETTINGS.setRAMOptions = SETTINGS.store;

// ------------------------ LOG ---------------------------------------
global.Log = winston.createLogger({
	transports: [
		new winston.transports.File({
			filename: path.resolve(app.getPath('userData'), 'log.txt'),
			level: 'info',
			maxsize: 5242880, // 5MB * 1024 * 1024;
			maxfiles: 1,
			format: winston.format.combine(winston.format.timestamp(), winston.format.json())
		}),
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
			level: config.ISDEV ? 'debug' : 'error'
		})
	]
});
// --------------------------------------------------------- ./ END LOG


// ------------------ GLOBAL VARS ---------------------------------
let mainWindow = null;
let previewWindow = null;
let settingsWindow = null;
let tray = null;

const wallpaperCore = new dynamicWallpaper(SETTINGS.getR('wallpapers'));


process.on('uncaughtException', err => {
	Log.error(`Uncaught Exception: ${err}`);
});

process.on('unhandledRejection', err => {
	Log.error(`Unhandled Rejection: ${err}`);
});

/**
 * Make this app a single instance app.
 * 
 * The main window will be restored and focused instead of a second window
 * opened when a person attempts to launch a second instance.
 * 
 * @returns {boolean}	Returns true if the current version of the app should 
 * 						quit instead of  launching.
 */
function makeSingleInstance() {
	if (process.mas) {
		return false;
	}

	return app.makeSingleInstance(() => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
			mainWindow.show();
		}
	});
}

/**
 * Select proper windows icon file type
 * @returns {string} icon complete filepath
 */
function windowsIcon() {
	if (process.platform === 'win32') {
		return path.join(__dirname, '/assets/icons/icon.ico');
	} else {
		return path.join(__dirname, '/assets/icons/512x512.png');
	}
}

/**
 * Select proper tray image file
 * @returns {string} icon complete filepath
 */
function trayImage() {
	if (process.platform === 'win32') {
		return path.join(__dirname, 'assets', 'trayicons', 'traywin-color.ico');
	} else if (process.platform === 'linux') {
		return path.join(__dirname, 'assets', 'trayicons', 'traylinux.png');
	} else if (process.platform === 'darwin') {
		return path.join(__dirname, 'assets', 'trayicons', 'iconTemplate.png');
	} else {
		return null; // default
	}
}

/**
 * Create main window
 */
function createWindow() {
	if (makeSingleInstance()) {
		return app.quit();
	}

	const windowOptions = {
		autoHideMenuBar: true,
		defaultEncoding: 'utf-8',
		//useContentSize: true,
		//closable: false,
		maximizable: false,
		resizable: false,
		movable: true,
		show: false,
		title: app.getName(), //+ ' v.' + app.getVersion()
		darkTheme: true,
		hasShadow: false, // Whether window should have a shadow. This is only implemented on macOS
		thickFrame: true,
		//thickFrame Boolean (optional) - Use WS_THICKFRAME style for frameless windows on Windows, 
		//which adds standard window frame. Setting it to false will remove window shadow and window animations. Default is true
		//backgroundColor: '#000000',
		icon: windowsIcon(),
		height: 620,
		width: 400,
		webPreferences: {
			//defaultFontFamily: 'sansSerif'
			webaudio: false
		}
	};

	mainWindow = new BrowserWindow(windowOptions);

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'main.html'),
		protocol: 'file:',
		slashes: true
	}));


	// devtools on dev mode
	if (config.ISDEV) {
		// mainWindow.webContents.openDevTools({
		// 	mode: 'detach'
		// });
		//require('devtron').install();
	}

	// Prevent flash of white when starting the application
	// https://github.com/atom/electron/issues/2172
	mainWindow.webContents.on('did-finish-load', () => {
		if (SETTINGS.getR('minimizeToTray')) {
			if (SETTINGS.getR('notifications')) {
				mainWindow.webContents.send('ipcShowNotification', {
					body: 'App is running in background...'
				});
			}
		} else {
			setTimeout(() => {
				mainWindow.show();
			}, 100); // const WEBVIEW_LOAD_TIMEOUT_MS = 100;
		}
	});

	mainWindow.webContents.on('crashed', () => {
		Log.error('Main window crashed!');
		mainWindow.reload();
	});

	mainWindow.webContents.on('unresponsive', () => {
		Log.error('Main window unresponsive!');
		mainWindow.reload();
	});

	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
		app.quit();
	});

	mainWindow.on('minimize', (event) => {
		if (SETTINGS.getR('minimizeToTray')) {
			event.preventDefault();
			mainWindow.hide();
		}
	});
}

/**
 * Create preview Window (modal dialog)
 */
function createPreviewWindow() {
	const windowOptions = {
		parent: mainWindow,
		modal: true,
		show: false,
		autoHideMenuBar: true,
		defaultEncoding: 'utf-8',
		useContentSize: true,
		center: true,
		minimizable: false,
		closable: true,
		maximizable: false,
		resizable: true,
		movable: true,
		title: 'Preview wallpapers',
		darkTheme: true,
		thickFrame: true,
		icon: windowsIcon(),
		height: 480,
		width: 720,
		backgroundColor: '#000000',
		webPreferences: {
			webaudio: false,
			webgl: false
		}
	};

	previewWindow = new BrowserWindow(windowOptions);

	previewWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'preview.html'),
		protocol: 'file:',
		slashes: true
	}));


	// devtools on dev mode
	if (config.ISDEV) {
		// previewWindow.webContents.openDevTools({
		// 	mode: 'detach'
		// });
		//require('devtron').install();
	}

	previewWindow.once('ready-to-show', () => {
		previewWindow.show();
	});

	previewWindow.webContents.on('crashed', () => {
		Log.error('Preview window crashed!');
		previewWindow.reload();
	});

	previewWindow.webContents.on('unresponsive', () => {
		Log.error('Preview window unresponsive!');
		previewWindow.reload();
	});

	previewWindow.on('closed', () => {
		previewWindow = null;
	});
}

/**
 * Create Settings Window (modal dialog)
 */
function createSettingsWindow() {
	const windowOptions = {
		parent: mainWindow,
		modal: true,
		show: false,
		autoHideMenuBar: true,
		defaultEncoding: 'utf-8',
		useContentSize: true,
		center: true,
		minimizable: false,
		closable: true,
		maximizable: false,
		resizable: false,
		movable: true,
		title: 'Settings',
		darkTheme: true,
		thickFrame: true,
		icon: windowsIcon(),
		height: 640,
		width: 400,
		backgroundColor: '#413e56',
		webPreferences: {
			webaudio: false,
			webgl: false
		}
	};

	settingsWindow = new BrowserWindow(windowOptions);

	settingsWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'settings.html'),
		protocol: 'file:',
		slashes: true
	}));

	// devtools on dev mode
	if (config.ISDEV) {
		// settingsWindow.webContents.openDevTools({
		// 	mode: 'detach'
		// });
		//require('devtron').install();
	}

	settingsWindow.once('ready-to-show', () => {
		settingsWindow.show();
	});

	settingsWindow.webContents.on('crashed', () => {
		Log.error('Preview window crashed!');
		settingsWindow.reload();
	});

	settingsWindow.webContents.on('unresponsive', () => {
		Log.error('Preview window unresponsive!');
		settingsWindow.reload();
	});

	settingsWindow.on('closed', () => {
		settingsWindow = null;
	});
}

/**
 * Create tray Icon
 */
function trayIcon() {
	try {
		const trayimage = trayImage();

		tray = new Tray(trayimage);

		if (process.platform === 'darwin') {
			const trayimageHighlight = path.join(__dirname, 'assets', 'trayicons', 'iconTemplate.png');

			tray.setPressedImage(trayimageHighlight);
			tray.setHighlightMode('selection');
			// mode String - Highlight mode with one of the following values:
			// selection - Highlight the tray icon when it is clicked and also when its context menu is open. This is the default.
			// always - Always highlight the tray icon.
			// never - Never highlight the tray icon.

			tray.on('click', () => {
				mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
			});

			mainWindow.on('show', () => {
				tray.setHighlightMode('always');
			}).on('hide', () => {
				tray.setHighlightMode('never');
			});
		}

		tray.setToolTip(app.getName());

		const contextMenu = Menu.buildFromTemplate([{
				label: 'Show',
				type: 'normal',
				click() {
					if (!mainWindow.isVisible()) {
						mainWindow.show();
					}
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Quit',
				type: 'normal',
				accelerator: 'CmdOrCtrl+W',
				role: 'quit'
			}
		]);

		tray.setContextMenu(contextMenu);

		tray.on('double-click', () => {
			if (!mainWindow.isVisible()) {
				mainWindow.show();
			}
		});
	} catch (err) {
		Log.error(`Tray icon: ${err}`);
	}
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
}).on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
}).on('before-quit', () => {
	Log.info('Application exiting...');
}).on('ready', () => {
	init();
});

/**
 * Restarts App
 */
// function restartApp() {
// 	if (config.ISDEV) {
// 		return;
// 	}

// 	try {
// 		app.relaunch({
// 			args: process.argv.slice(1).concat(['--relaunch'])
// 		});
// 		app.exit(0);
// 	} catch (err) {
// 		Log.error(`Restart app: ${err}`);
// 	}
// }


// ----------------- AUTO UPDATE -------------------

const updater = new checkForUpdates.Updater();

/**
 * Check for updates
 */
function checkForUpdatesNow() {
	Log.info('Checking for updates...');

	const updateURL = `${config.UPDATE_URL}?v=${Math.random()}`; // prevent caching

	updater.checkForUpdates(updateURL);
}

updater.on('checking-for-updates', () => {
	if (settingsWindow) {
		settingsWindow.webContents.send('ipcUpdateInfo', 'Checking for updates...');
	}
}).on('update-available', (newVersion) => {
	Log.info(`Update available! New version: ${newVersion}`);

	if (settingsWindow) {
		settingsWindow.webContents.send('ipcUpdateInfo', `Update available. New version: ${newVersion}`);
	}

	// ask dialog
	const options = {
		type: 'info',
		title: 'Update available',
		message: `Do you wish to download the new version:  ${newVersion}?`,
		buttons: ['Yes', 'No']
	};

	dialog.showMessageBox(options, (index) => {
		if (index === 0) {
			shell.openExternal(config.DOWNLOAD_URL);
		}
	});

}).on('update-not-available', () => {
	Log.info('Update not available');

	if (settingsWindow) {
		settingsWindow.webContents.send('ipcUpdateInfo', 'You have the most recent version!');
	}

	if (SETTINGS.getR('notifications') && mainWindow) {
		mainWindow.webContents.send('ipcShowNotification', {
			body: 'You have the most recent version! No updates available.'
		});
	}
}).on('error', (err) => {
	Log.error(`Updater: ${err}`);

	if (settingsWindow) {
		settingsWindow.webContents.send('ipcUpdateInfo', 'Error on checking for updates! Please try again later or visit the official website');
	}
});



// Required to show notifications on Windows 10 most recent versions
app.setAppUserModelId('com.samuelcarreira.windows-dynamic-desktop');
app.setAsDefaultProtocolClient('windows-dynamic-desktop');


// ------------------------ IPC ---------------------------------------
ipcMain.on('ipcSliderChange', (event, arg) => {
	const percentage = arg / 100;
	const file = 'file://' + path.normalize(wallpaperCore.calculateWallpaperFile(percentage));

	event.sender.send('ipcWallpaperFile', file);
}).on('ipcShowLicenses', () => {
	shell.openItem(path.join(path.dirname(app.getPath("exe")), "OPENSOURCELICENSES.txt"));
}).on('ipcSamuelCarreira', () => {
	shell.openExternal('http://www.samuelcarreira.com');
}).on('ipcCheckForUpdates', () => {
	checkForUpdatesNow();
}).on('ipcButtonAddFile', (event) => {
	//mainWindow.hide();
	dialog.showOpenDialog({
		properties: ['openFile'],
		filters: [{
			name: 'Images',
			extensions: ['jpg', 'png', 'jpeg']
		}]
	}, (files) => {
		if (files) {
			Log.debug(`Selected files: ${files}`);

			event.sender.send('ipcAddImages', files);

			wallpaperCore.addWallpapers(files);

			SETTINGS.setR('wallpapers', wallpaperCore.wallpapersList);
			SETTINGS.set('wallpapers', wallpaperCore.wallpapersList);
		}
		//mainWindow.show();
	})
}).on('ipcButtonAddFolder', (event) => {
	dialog.showOpenDialog({
		properties: ['openDirectory']
	}, (folder) => {
		if (!folder) {
			return;
		}

		Log.debug(`Selected folder: ${folder}`);

		fsoperations.globDirPromise(folder[0], {
				includePath: true
			})
			.then(files => {
				Log.debug(`Selected files: ${files}`);

				event.sender.send('ipcAddImages', files);

				wallpaperCore.addWallpapers(files);

				SETTINGS.setR('wallpapers', wallpaperCore.wallpapersList);
				SETTINGS.set('wallpapers', wallpaperCore.wallpapersList);
			})
			.catch(err => {
				Log.error(`Select folder: ${err}`);
			});
	});
}).on('getInitialContent', (event) => {
	event.sender.send('ipcAddImages', SETTINGS.getR('wallpapers'));
}).on('ipcNewWallpaperList', (event, arg) => {
	wallpaperCore.setWallpapers = arg;

	SETTINGS.setR('wallpapers', arg);
	SETTINGS.set('wallpapers', arg);
}).on('ipcButtonPreview', () => {
	if (previewWindow) {
		return;
	}
	createPreviewWindow();
}).on('ipcButtonSettings', () => {
	if (settingsWindow) {
		return;
	}
	createSettingsWindow();
}).on('ipcGetSettings', (event) => {
	event.returnValue = {
		startup: SETTINGS.getR('startup'),
		notifications: SETTINGS.getR('notifications'),
		updates: SETTINGS.getR('updates'),
		tray: SETTINGS.getR('minimizeToTray')
	}
}).on('ipcSaveSettings', (event, arg) => {
	// const options = {
	// 	type: 'info',
	// 	title: app.getName(),
	// 	message: 'You need to restart the app to apply the changes. Do you want to restart now?',
	// 	buttons: ['Yes', 'No']
	// };
	// dialog.showMessageBox(options, (index) => {
	// 	if (index === 0) {
	// 		restartApp();
	// 	}
	// });
	SETTINGS.setR('startup', arg.startup);
	SETTINGS.setR('notifications', arg.notifications);
	SETTINGS.setR('minimizeToTray', arg.tray);
	SETTINGS.setR('updates', arg.updates);

	SETTINGS.set('startup', arg.startup);
	SETTINGS.set('notifications', arg.notifications);
	SETTINGS.set('minimizeToTray', arg.tray);
	SETTINGS.set('updates', arg.updates);

	startup.autoLaunchApp(arg.startup, app.getName(), true);

	if (arg.notifications && tray === null) {
		trayIcon();
	}

	if (!arg.notifications && tray !== null) {
		tray = null;
	}
});

wallpaperCore.on('wallpaperChanged', () => {
	if (SETTINGS.getR('notifications') && mainWindow) {
		mainWindow.webContents.send('ipcShowNotification', {
			body: 'Wallpaper changed'
		});
	}
});

/**
 * Startup actions
 */
function init() {
	Log.info(`========= Welcome to ${app.getName()} v.${app.getVersion()} =========`);

	createWindow();

	startup.autoLaunchApp(SETTINGS.getR('startup'), app.getName(), true);

	if (SETTINGS.getR('minimizeToTray')) {
		trayIcon();
	}

	if (SETTINGS.getR('updates')) {
		setTimeout(() => {
			checkForUpdatesNow();
		}, 30000);
	}

	console.timeEnd('start'); // check startup time
}