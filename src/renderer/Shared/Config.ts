import { Restore } from './Libs/Restore';

export const _default = {
	version: 10,
	versionPrinterConfigs: 10,
	settings: {
		ui: {
			opacity: 0.8,
			sizes: {
				toolsTab: 170,
				sceneItemList: 200
			}
		},
		scene:{
			transformAlignToPlane: true,
			setStartupPerspectiveCamera: false,
			isFixedCenter: false,
			sharpness:.0001
		},
		colors: {
			typography:{
				background:'#aaaaaa'
			},
			background:{
				black:'#0e0e0e',
				darkest:'#242424',
				dark:'#2d2d2d',
				heavy:'#3a3b3b',
				common:'#444444',
				commonest:'#565656',
				warm:'#808080',
				light:'#cbcbcb',
				white: '#fff'
			},
			interact:{
				touch:'#4984fd',
				neutral:'#4168c0',
				touch1:'#614ed3',
				neutral1:'#4738a5',
				neutral2:'#5241c0',
				warning:'#ffbd39',
				danger:'#fb594f',
			},
			scene:{
				colorBackgroundScene:'#4b4b4b',
				colorBackgroundSceneBottom:'#6c6c6c',
				colorBackground:'#1d1d1d',
				color1:'#2a2a2a',
				workingPlaneLimitColor:'rgba(169, 110, 105, 1)',
				workingPlaneColor:'rgba(109, 112, 117, 1)',
				x: '#8f4747',
				y: '#548540',
				z: '#444b88',
			},
			logo: {
				main: '#5e48ff'
			}
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
export const colors = (storage.get('settings') as typeof _default.settings).colors;
