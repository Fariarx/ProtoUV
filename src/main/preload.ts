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

			// From render to main.
			send: (channel: any, ...args: any) => {
				ipcRenderer.send(channel, ...args);
			},
			// From main to render.
			receive: (channel: any, listener: any) => {
				// Show me the prototype (use DevTools in the render thread)
				console.log(ipcRenderer);

				// Deliberately strip event as it includes `sender`.
				ipcRenderer.on(channel, (event, ...args) => {
					console.log(...args);
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
