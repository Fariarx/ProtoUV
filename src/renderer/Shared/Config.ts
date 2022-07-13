import { Restore } from './Libs/Restore';

export const _default = {
	version: 3,
	versionPrinterConfigs: 3,
	settings: {
		ui: {
			opacity: 0.5,
		},
		scene:{
			transformAlignToPlane: true,
			setStartupPerspectiveCamera: false,
			sharpness:.0001
		},
		workerCount: 10,
		printerName: ''
	}
};

const storage = new Restore({
	configName: 'main',
	defaults: _default
});

export const saveConfig = () => storage.fullSave();
export const config = storage.get('settings') as typeof _default.settings;

