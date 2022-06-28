import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import * as path from 'path';

const body = {
	window: {
		maximize: () => {
			ipcRenderer.send('electron.maximize');
		},
		minimize: () => {
			ipcRenderer.send('electron.minimize');
		},
		close: () => {
			ipcRenderer.send('electron.closeWindow');
		},
		userData: () => {
			return ipcRenderer.sendSync('electron.userData');
		},
		fs: fs,
		path: path
	}
};

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: body
});

export const bridgeTypeOf = body;
