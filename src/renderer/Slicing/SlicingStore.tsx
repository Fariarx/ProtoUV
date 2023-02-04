import _ from 'lodash';
import { makeAutoObservable } from 'mobx';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { singleton } from 'tsyringe';
import { AppStore, Log, Pages } from '../AppStore';
import { SliceType } from '../Main/Scene/SceneInitializer';
import { config, saveConfig } from '../Shared/Config';
import { bridge } from '../Shared/Globals';

@singleton()
export class SlicingStore {
	constructor() {
		makeAutoObservable(this);
	}

	public isWorking = false;
	public sliceCount = 0;
	public sliceCountMax = 0;
	public sliceTo = 0;
	public image = '';

	public imageLargest = 0;
	public imageLargestSize = 0;
	public workerCount = 0;

	public gcode = '';

	public run = () => {
		this.isWorking = true;

		Log('run prepare to slicing...');

		bridge.ipcRenderer.send('prepare-to-slicing');

		const store = AppStore.sceneStore;
		const printer = AppStore.sceneStore.printer!;

		bridge.ipcRenderer.receive('prepare-to-slicing', () => {
			this.reset();
			Log('prepare to slicing done!');
			this.isWorking = true;
			const maxObjectsPoint =  _.maxBy(store.objects, (x: SceneObject) => x.maxY.y);
			this.sliceTo = Math.min(store.gridSize.y, maxObjectsPoint!.maxY.y);
			this.sliceCountMax =  Math.ceil(this.sliceTo / (printer.PrintSettings.LayerHeight * 0.1));
			this.sliceCount = 0;
			this.gcode = `;fileName:${store.objects[0].name}
;machineType:${store.printer?.Name}
;estimatedPrintTime:${printer.PrintSettings.BottomExposureTime * printer.PrintSettings.BottomLayers
      + printer.PrintSettings.ExposureTime * this.sliceCountMax
      + printer.PrintSettings.DelayTime * this.sliceCountMax}
;volume:1
;resin:normal
;weight:1
;price:1
;layerHeight:${printer.PrintSettings.LayerHeight}
;resolutionX:${printer.Resolution.X}
;resolutionY:${printer.Resolution.Y}
;machineX:${printer.Workspace.SizeX}
;machineY:${printer.Workspace.SizeY}
;machineZ:${printer.Workspace.Height}
;projectType:LCD_mirror
;normalExposureTime:${printer.PrintSettings.ExposureTime}
;bottomLayExposureTime:${printer.PrintSettings.BottomExposureTime}
;bottomLayerExposureTime:${printer.PrintSettings.BottomExposureTime}
;normalDropSpeed:${printer.PrintSettings.LiftingSpeed}
;normalLayerLiftHeight:${printer.PrintSettings.LiftingHeight}
;zSlowUpDistance:0
;normalLayerLiftSpeed:${printer.PrintSettings.LiftingSpeed}
;bottomLayCount:${printer.PrintSettings.BottomLayers}
;bottomLayerCount:${printer.PrintSettings.BottomLayers}
;mirror:1
;totalLayer:${this.sliceCountMax}
;bottomLayerLiftHeight:${printer.PrintSettings.LiftingHeight}
;bottomLayerLiftSpeed:${printer.PrintSettings.LiftingSpeed}
;bottomLightOffTime:0
;lightOffTime:0`;
			this.gcode += '\n\n;START_GCODE_BEGIN';
			this.gcode += '\n' + AppStore.sceneStore.printer!.GCode.Start;
			this.gcode += '\n;START_GCODE_END';
			this.animate();
			Log('slice layers max: ' + this.sliceCountMax);
		});

		//bridge.ipcRenderer.receive('worker-info', (x: number) => {
		//	Log(x+'');
		//	this.workerCount = x;
		//});
	};

	public reset = () => {
		AppStore.instance.progressPercent = 0;
		this.gcode = '';
		this.isWorking = false;
		this.sliceCount = 0;
		this.sliceCountMax = 0;
		this.sliceTo = 0;
		this.image = '';
		this.imageLargest = 0;
		this.imageLargestSize = 0;
	};

	public save = (saveAutomatically: boolean) => {
		bridge.ipcRenderer.send('sliced-finalize',
			this.gcode, config.pathToUVTools, AppStore.sceneStore.printer!.Export.Encoder,
      AppStore.sceneStore.printer!.Export.Extencion, AppStore.sceneStore.objects[0].name,
      config.pathToSave, saveAutomatically);
	};

	private animate = () => {
		if (AppStore.getState() !== Pages.Slice || !this.isWorking)
		{
			Log('slice not ready');
			this.isWorking = false;
			return;
		}

		const sharpness = config.scene.sharpness.toString().length - 2;
		const layerHeight = (AppStore.sceneStore.printer!.PrintSettings.LayerHeight * 0.1);
		const printer = AppStore.sceneStore.printer!;

		let rendersCount = 1;

		while (this.sliceCount <= this.sliceCountMax)
		{
			this.image = AppStore.sceneStore.sliceLayer(
				(this.sliceCount/this.sliceCountMax) * this.sliceTo / AppStore.sceneStore.gridSize.y,
				this.sliceCount, SliceType.Normal);

			Log('slice: ' + ((this.sliceCount/this.sliceCountMax)*100).toFixed(1) + '%');

			const moveTo = (layerHeight * this.sliceCount)* 10;

			this.gcode += '\n\n;LAYER_START:' + this.sliceCount;
			this.gcode += '\n' + printer.GCode.ShowImage.replace('*x', this.sliceCount.toString());
			this.gcode += '\n' + printer.GCode.MoveTo
				.replace('*x', (moveTo + printer.PrintSettings.LiftingHeight).toFixed(sharpness))
				.replace('*y', printer.PrintSettings.LiftingSpeed.toString());
			this.gcode += '\n' + printer.GCode.MoveTo
				.replace('*x', (moveTo).toFixed(sharpness))
				.replace('*y', printer.PrintSettings.LiftingSpeed.toString());
			this.gcode += '\n' + printer.GCode.Delay
				.replace('*x', (printer.PrintSettings.DelayTime*1000).toString());
			this.gcode += '\n' + printer.GCode.LightOn;
			this.gcode += '\n' + printer.GCode.Delay
				.replace('*x', (printer.PrintSettings.BottomLayers >= this.sliceCount
					? printer.PrintSettings.BottomExposureTime * 1000
					: printer.PrintSettings.ExposureTime * 1000)
					.toString());
			this.gcode += '\n' + printer.GCode.LightOff;
			this.gcode += '\n;LAYER_END';

			this.sliceCount += 1;

			if (this.sliceCount > this.sliceCountMax) {
				AppStore.instance.progressPercent = 1;
				break;
			}
			else {
				AppStore.instance.progressPercent = (this.sliceCount/this.sliceCountMax);
			}

			rendersCount--;

			if (rendersCount < 1)
			{
				break;
			}

			if (!this.isWorking)
			{
				Log('slicing cancelled!');
				return;
			}
		}

		if (this.image.length > this.imageLargestSize
      && this.sliceCount > printer.PrintSettings.BottomLayers)
		{
			this.imageLargest = this.sliceCount;
			this.imageLargestSize = this.image.length;
		}

		if (this.sliceCount <= this.sliceCountMax) {
			requestAnimationFrame(this.animate);
		}
		else {
			this.isWorking = false;
			this.gcode += '\n\n;END_GCODE_BEGIN';
			this.gcode += '\n' + AppStore.sceneStore.printer!.GCode.End
				.replace('*x', printer.Workspace.Height.toString());
			this.gcode += '\n;END_GCODE_END';

			AppStore.sceneStore.sliceLayer(
				(this.imageLargest/this.sliceCountMax) * this.sliceTo / AppStore.sceneStore.gridSize.y,
				this.imageLargest, SliceType.Preview);
			AppStore.sceneStore.sliceLayer(
				(this.imageLargest/this.sliceCountMax) * this.sliceTo / AppStore.sceneStore.gridSize.y,
				this.imageLargest, SliceType.PreviewCropping);

			if (config.saveAutomatically)
			{
				this.save(true);
			}

			bridge.ipcRenderer.receive('sliced-finalize-result', (error: string | null, success: string | null, filePath?: string) => {
				if (error)
				{
					Log(error);
				}
				if (success)
				{
					config.pathToSave = filePath ?? config.pathToSave;
					saveConfig();
					Log(success + ' to: ' + filePath);
					AppStore.changeState(Pages.Main);
				}
			});

			Log('slicing done!');
		}
	};
}
