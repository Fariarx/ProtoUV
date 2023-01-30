// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
import { contextBridge, ipcRenderer, shell  } from 'electron';
import fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const body = {
	window: {
		maximize: () => ipcRenderer.send('electron.maximize'),
		openFileDialog: () => ipcRenderer.sendSync('electron.openFileDialog'),
		minimize: () => ipcRenderer.send('electron.minimize'),
		close: () => ipcRenderer.send('electron.closeWindow'),
		userData: () => ipcRenderer.sendSync('electron.userData'),
		isDebug: () => ipcRenderer.sendSync('electron.isDebug'),
		ipcRenderer: {
			...ipcRenderer,
			send: (channel: any, ...args: any) => {
				ipcRenderer.send(channel, ...args);
			},
			sendSync: (channel: any, ...args: any) => {
				ipcRenderer.sendSync(channel, ...args);
			},
			receive: (channel: any, listener: any) => {
				ipcRenderer.on(channel, (event, ...args) => {
					console.log(args);
					listener(...args);
				});
			},
		},
		fs: fs,
		path: path,
		url: url,
		shell: shell,
	}
};

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: body,
});

export const bridgeTypeOf = body;
