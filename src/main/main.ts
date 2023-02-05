import archiver from 'archiver';
import axios from 'axios';
import child_process from 'child_process';
import electron, { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';

import { resolveHtmlPath } from './util';

const userData = electron.app.getPath('userData');

let mainWindow: BrowserWindow | null = null;
let mainWindowIsFocused: boolean | undefined;
const workers = [] as BrowserWindow[];

const RESOURCES_PATH = app.isPackaged
	? path.join((process as any).resourcesPath, 'assets')
	: path.join(__dirname, '../../assets');

ipcMain.on('electron.assetsPath', (event: any) => {
	event.returnValue = RESOURCES_PATH;
});
ipcMain.on('electron.userData', (event: any) => {
	event.returnValue = userData;
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
ipcMain.on('electron.isWorker', (_) => {
	const worker = workers.find(x => _.sender === x.webContents);
	_.returnValue = !!worker;
});

if (process.env.NODE_ENV === 'production') {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

ipcMain.on('electron.isDebug', (event: any) => {
	event.returnValue = isDebug;
});

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
			forceDownload)
		.catch(console.log);
};

const createWindow = async () => {
	if (isDebug) {
		await installExtensions();
	}

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1200,
		height: 728,
		minWidth:700,
		minHeight:500,
		icon: getAssetPath('icon.png'),
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
			webSecurity: false,
			sandbox: false,
			nodeIntegration: true,
			devTools: isDebug,
			nodeIntegrationInWorker: true,
			nodeIntegrationInSubFrames: true
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

			axios.get('https://img.shields.io/github/v/release/fariarx/ProtoUV')
				.then(res => {
					const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
					console.log('Status Code:', res.status);
					console.log('Date in Response header:', headerDate);

					if (res.status === 200)
					{
						mainWindow?.webContents.send('version-info', res.data);
					}
				})
				.catch(err => {
					console.log('Error: ', err.message);
				});
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

	ipcMain.on('prepare-to-slicing', (_) => {
		if (fs.existsSync(userData + '/slicing'))
		{
			fs.rmSync(userData + '/slicing', { recursive: true, force: true });
		}

		fs.mkdirSync(userData + '/slicing');

		mainWindow?.webContents.send('prepare-to-slicing-ready');
	});
	ipcMain.on('prepare-to-slicing-run-worker', (_, json: string, workerJobs: { layer: number, percent: number }[]) => {

		console.log('create worker');

		const createWorker = () => {
			const worker = new BrowserWindow({
				//show: false,
				//titleBarStyle: 'hidden',
				webPreferences: {
					preload: app.isPackaged
						? path.join(__dirname, 'preload.js')
						: path.join(__dirname, '../../.erb/dll/preload.js'),
					webSecurity: false,
					sandbox: false,
					nodeIntegration: true,
					devTools: isDebug,
					nodeIntegrationInWorker: true,
					nodeIntegrationInSubFrames: true
				}
			});

			workers.push(worker);

			worker.loadURL(resolveHtmlPath('index.html'));

			const listener = (_: any) => {
        workers.find(x => _.sender === x.webContents)!
        	.webContents.send('prepare-to-slicing-worker-take-job', json, workerJobs);
        ipcMain.removeListener('prepare-to-slicing-worker-ready', listener);
			};

			ipcMain.on('prepare-to-slicing-worker-ready', listener);
		};

		createWorker();
	});
	ipcMain.on('sliced-layer-save', (_, screenshot: string, path: string) => {
		fs.writeFileSync(userData + '/slicing/' + path, atob(screenshot), 'binary' );
	});
	ipcMain.on('sliced-layer-worker-done', (_) => {
    workers.find(x => _.sender === x.webContents)!.close();
	});
	ipcMain.on('sliced-finalize-cancelled', _ => {

	});
	ipcMain.on('sliced-finalize-done', (_,
		gcode: string, pathToUVTools: string,
		encoder: string, extencion: string
	) => {

		try {
			fs.writeFileSync(userData + '/slicing/run.gcode', gcode);

			const output = fs.createWriteStream(userData + '/target.zip');
			const archive = archiver('zip');
			archive.pipe(output);
			archive.directory(userData + '/slicing', false);
			archive.finalize().then(() => {
				const child = child_process.execFile;
				const executablePath = pathToUVTools;
				const parameters = ['convert', userData + '\\target.zip', encoder, userData + '\\target.' + extencion];

				const _process = child(executablePath, parameters);

        _process.stdout!.on('data', (data) => console.log(`stdout: ${data}`));
        _process.stderr!.on('data', (data) => console.error(`stderr: ${data}`));
        _process.on('close', (code) => {
        	if (code === 1) {
        		mainWindow?.webContents.send('sliced-finalize-result', 'done');
        	}
        	else {
        		mainWindow?.webContents.send('sliced-finalize-result', 'error code from uvtools: ' + code);
        	}
        });
			});
		}
		catch (e)
		{
			mainWindow?.webContents.send('sliced-finalize-result', 'finalize error: ' + e);
		}
	});
	ipcMain.on('sliced-finalize-save', (_, __: string, ___: string,
		encoder: string, extencion: string, fileNameToSave: string, filePath: string,
		saveAutomatically: boolean
	) => {
		try {
			const options = {
				title: 'Save file',
				defaultPath: filePath + '\\' + fileNameToSave + '.' + extencion,
				buttonLabel: 'Save',
				filters: [
					{ name: encoder, extensions: [extencion] }
				]
			};

			const save = ({ filePath }: any) => {
				try {
					if (filePath) {
						if (fs.existsSync(filePath)) {
							fs.rmSync(filePath, { force: true });
						}
						fs.copyFileSync(userData + '\\target.' + extencion, filePath);
						mainWindow?.webContents.send('sliced-finalize-result-save', null, 'done, file successfully written', path.dirname(filePath));
					} else {
						mainWindow?.webContents.send('sliced-finalize-result-save', 'file to save not selected');
					}
				} catch (e) {
					mainWindow?.webContents.send('sliced-finalize-result-save', 'save error: ' + e);
				}
			};

			if (saveAutomatically && fs.existsSync(filePath))
			{
				save({
					filePath: options.defaultPath
				});
			}
			else {
				dialog.showSaveDialog(mainWindow!, options).then(save as any);
			}
		}
		catch (e)
		{
			mainWindow?.webContents.send('sliced-finalize-result-save', 'finalize error: ' + e);
		}
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

app.whenReady()
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
