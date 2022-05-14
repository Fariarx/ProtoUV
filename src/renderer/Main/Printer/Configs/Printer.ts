import fs from 'fs';
import * as path from 'path';
import { Config } from '../../../Shared/Config';
import { Bridge } from '../../../Shared/Globals';
import { Log } from '../../Console/StoreConsole';

export class Printer {
	name:string;

	Workspace: Workspace;
	Resolution: Resolution;
	PrintSettings: PrintSettings;

	workerData: any = {};

	constructor(_name?: string, _settings?: PrinterConfig) {
		if(_name) {
			this.name = _name;
		}
		else {
			this.name = '';
		}

		if(!_settings) {
			this.Workspace = {
				sizeX: 0,
				sizeY: 0,
				height: 0
			};
			this.Resolution = {
				X: 0,
				Y: 0
			};
			this.PrintSettings = {
				LayerHeight: 0,
				BottomLayers: 0,
				ExposureTime: 0,
				BottomExposureTime: 0,
				LiftingHeight: 0,
				LiftingSpeed: 0,
			};
		}
		else {
			this.Workspace = _settings.Workspace;
			this.Resolution = _settings.Resolution;
			this.PrintSettings = _settings.PrintSettings;
		}
	}

	static DEFAULT_CONFIG_NAME = 'Voxelab Proxima_6_0';
	static CHANGED_DIR = '/ChangedConfigsV';
	static CONFIG_DIR = './src/Engine/App/Configs/Default/';

	static LoadDefaultConfigFromFile = function () {
		try {
			return new Printer(path.basename('Voxelab Proxima 6.json'),
				JSON.parse(fs.readFileSync(Printer.CONFIG_DIR +Printer.DEFAULT_CONFIG_NAME+'.json', 'utf8')));
		}
		catch (e) {
			Log.Add('Error read config: ' + e);
		}

		return null;
	};
	static SaveToFile = function (config: Printer) {
		try {
			const dir = Bridge.window.userData() + Printer.CHANGED_DIR + Config.versionPrinterConfigs;
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			fs.writeFileSync(Bridge.window.userData() + Printer.CHANGED_DIR +
        Config.versionPrinterConfigs + '/' + config.name + '.json',
			JSON.stringify(config),{ encoding:'utf8',flag:'w' });
			return true;
		}
		catch (e) {
			Log.Add('Error save config to file: ' + e);
			return false;
		}
	};
	static LoadConfigFromFile = function (modelName: string) {
		try {

			let config: PrinterConfig;

			try {
				config = JSON.parse(fs.readFileSync(Bridge.window.userData() + Printer.CHANGED_DIR
          + Config.versionPrinterConfigs + '/' + modelName + '.json', 'utf8'));
			} catch (e) {
				config  = JSON.parse(fs.readFileSync(Printer.CONFIG_DIR + modelName + '.json', 'utf8'));
			}

			const obj = new Printer(path.basename(modelName), config);

			Log.Add('Printer \'' + modelName + '\' loaded.');

			return obj;
		}
		catch (e) {
			Log.Add('Error read config: ' + e);
		}

		return null;
	};
	static ParseConfigFileNames = function () {
		let files: string[] = [];

		try {
			const dir = Bridge.window.userData() + Printer.CHANGED_DIR + Config.versionPrinterConfigs;
			if (fs.existsSync(dir)) {
				files = [...fs.readdirSync(dir)];
			}
			if (fs.existsSync(Printer.CONFIG_DIR)) {
				files = [...fs.readdirSync(Printer.CONFIG_DIR), ...files];
			}

			files = files.filter(function(item, pos) {
				if(item.indexOf('.json') === -1)
				{
					return false;
				}

				return files.indexOf(item) === pos;
			});

			files = files.map(function (t) {
				return t.replace('.json', '');
			});

			files.sort();

			return files;
		} catch (e) {
			Log.Add('Error read config files: ' + e);
		}

		return files;
	};
}

export interface PrinterConfig {
  Resolution: Resolution;
  Workspace: Workspace;
  PrintSettings: PrintSettings;
}
export type Workspace = {
  sizeX: number;
  sizeY: number;
  height: number;
};
export type Resolution = {
  X: number;
  Y: number;
};
export type PrintSettings = {
  LayerHeight: number;
  BottomLayers: number;
  ExposureTime: number;
  BottomExposureTime: number;
  LiftingHeight: number;
  LiftingSpeed: number;
};
