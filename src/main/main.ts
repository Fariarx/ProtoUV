// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
import electron, { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import { resolveHtmlPath } from './util';

let mainWindow: BrowserWindow | null = null;
let mainWindowIsFocused: boolean | undefined;

ipcMain.on('electron.userData', (event: any) => {
	event.returnValue = electron.app.getPath('userData');
});
ipcMain.on('electron.checkFocus', (event: any) => {
	event.returnValue = mainWindowIsFocused;
});
ipcMain.on('electron.minimize', () => {
	const _window = BrowserWindow.getFocusedWindow();
	// eslint-disable-next-line no-unused-expressions
	_window && _window.isMinimized() ? _window.restore() : _window?.minimize();
});
ipcMain.on('electron.maximize', () => {
	const _window = BrowserWindow.getFocusedWindow();
	// eslint-disable-next-line no-unused-expressions
	_window && _window.isMaximized() ? _window.unmaximize() : _window?.maximize();
});
ipcMain.on('electron.closeWindow', () => {
	const _window = BrowserWindow.getFocusedWindow();
	// eslint-disable-next-line no-unused-expressions
	_window && _window.close();
});
ipcMain.on('electron.openFileDialog', (event: any) => {
	if (mainWindow) {
		dialog.showOpenDialog(mainWindow, {
			properties: ['openFile']
		}).then((result: any) => {
			event.returnValue = result;
		});
	}
});

if (process.env.NODE_ENV === 'production') {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('electron-debug')();
}

const installExtensions = async () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log);
};

const createWindow = async () => {
	if (isDebug) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join((process as any).resourcesPath, 'assets')
		: path.join(__dirname, '../../assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1200,
		height: 728,
		icon: getAssetPath('icon.png'),
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
			webSecurity: false,
			sandbox: false,
		},
		titleBarStyle: 'hidden',
	});

	mainWindow.setMenu(null);

	mainWindow.loadURL(resolveHtmlPath('index.html'));

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
		}
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((data: any) => {
		shell.openExternal(data.url);
		return { action: 'deny' };
	});
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app
	.whenReady()
	.then(() => {
		createWindow();
		app.on('activate', () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) {createWindow();}
		});
	})
	.catch(console.log);

app.on('browser-window-focus', () => {
	if (mainWindow) {
		//console.log('browser-window-focus');
		mainWindowIsFocused = true;
	}
});

app.on('browser-window-blur', () => {
	if (mainWindow) {
		//console.log('browser-window-blur');
		mainWindowIsFocused = false;
	}

});
