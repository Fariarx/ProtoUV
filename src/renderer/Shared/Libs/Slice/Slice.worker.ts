
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { bridge } from 'renderer/Shared/Globals';
import { BufferGeometryLoader, Raycaster } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { SliceResult, slice } from './Slice';

export const sliceLayers = async (printerJson: string, numLayerFrom: number, numLayerTo: number) => {
	const array: SliceResult[] = [];
	const start = numLayerFrom;

	const printer = JSON.parse(printerJson) as Printer;
	const raycaster = new Raycaster();
	const geometry = new BufferGeometryLoader().parse(printer.workerData.geometry);
	const mesh = new MeshBVH(geometry, {
		maxLeafTris: 20
	});

	while (numLayerFrom <= numLayerTo) {
		array.push(slice(printer, numLayerFrom, geometry, mesh, raycaster));
		bridge.ipcRenderer.send('worker-slice-message-progress', (numLayerFrom - start)/(numLayerTo - start));
		numLayerFrom++;
	}

	return array;
};
