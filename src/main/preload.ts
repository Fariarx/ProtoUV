import { contextBridge, ipcRenderer } from 'electron';

const body = {
	window:{
		maximize: () => {
			ipcRenderer.send('electron.maximize');
		},
		minimize: () => {
			ipcRenderer.send('electron.minimize');
		},
		close: () => {
			ipcRenderer.send('electron.closeWindow');
		},
	}
};

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: body
});

export const bridgeTypeOf = body;
