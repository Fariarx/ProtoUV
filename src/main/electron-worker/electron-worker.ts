import electron, { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import { resolveHtmlPath } from '../util';

export class ElectronWorkerPool {
	private workers = [] as {
    window: BrowserWindow;
    ready: boolean;
  }[];
	private jobs = [] as {
    window: BrowserWindow;
    ready: boolean;
  }[];

	constructor(public props: {
    name: string;
    spawnCount: number;
  }) {
		this.spawnChildren();

		ipcMain.on(this.props.name, (_) => {
			const worker = this.workers.find(x => _.sender === x.window.webContents);
			if (worker)
			{
				worker.ready = true;
			}
		});
	}

	private spawnChildren = () => {
		let spawnCount = this.props.spawnCount;
		while (spawnCount > 0)
		{
			spawnCount--;
			this.spawn();
		}
	};
	private spawn = () => {
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
				devTools: true,
				nodeIntegrationInWorker: true,
				nodeIntegrationInSubFrames: true
			}
		});

		this.workers.push({
			window: worker,
			ready: false
		});

		worker.loadURL(resolveHtmlPath('index.html'));
	};
}
