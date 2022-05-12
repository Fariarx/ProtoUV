export const Config = {
	version: 7,
	versionPrinterConfigs: 3,
	settings: {
		ui: {
			opacity: 0.8,
		},
		scene:{
			transformAlignToPlane: true,
			setStartupPerspectiveCamera: true,
			sharpness:.0001
		},
		workerCount: 10,
		printerName: ''
	}
};

export const StoreConfig = {
	configName: 'main',
	defaults: Config
};
