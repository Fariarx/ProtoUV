import _ from 'lodash';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { Vector3 } from 'three';
import { singleton } from 'tsyringe';
import { AppStore, Log, Pages } from '../AppStore';
import { bridge } from '../Shared/Globals';

@singleton()
export class SlicingStore {
	constructor() {

	}

	public sliceCount = 0;
	public sliceCountMax = 0;
	public sliceTo = 0;

	public run = () => {
		bridge.ipcRenderer.send('prepare-to-slicing');
		Log('run prepare to slicing...');
		bridge.ipcRenderer.receive('prepare-to-slicing', () => {
			Log('prepare to slicing done!');
			const maxObjectsPoint =  _.maxBy(AppStore.sceneStore.objects, (x: SceneObject) => x.maxY.y);
			this.sliceTo = Math.min(AppStore.sceneStore.gridSize.y, maxObjectsPoint!.maxY.y);
			this.sliceCountMax =  Math.ceil(this.sliceTo / (AppStore.sceneStore.printer!.PrintSettings.LayerHeight * 0.1));
			this.sliceCount = 1;
			console.log('slice layers: ' + this.sliceCountMax);
			this.animate();
		});
	};

	private animate = () => {
		if (AppStore.getState() !== Pages.Slice)
		{
			return;
		}

		AppStore.instance.progressPercent = (this.sliceCount/this.sliceCountMax);

		AppStore.sceneStore.sliceLayer(
			(this.sliceCount/this.sliceCountMax) * this.sliceTo / AppStore.sceneStore.gridSize.y,
			this.sliceCount);

		this.sliceCount += 1;

		if (this.sliceCount <= this.sliceCountMax) {
			requestAnimationFrame(this.animate);
		}
		else {
			Log('Slicing done!');
		}
	};
}
