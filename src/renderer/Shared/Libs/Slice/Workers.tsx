import { AppStore } from 'renderer/AppStore';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { config } from 'renderer/Shared/Config';
import { bridge } from 'renderer/Shared/Globals';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import { Job, WorkerType } from './Job';
import { SliceResult, calculateVoxelSizes } from './Slice';

export let isWorking = false;

const jobList: Array<Job> = [];

export const addJob = (job: Job) =>
{
	if(!isWorking)
	{
		isWorking = true;

		switch (job.name)
		{
			case WorkerType.SliceFullScene:
				_sliceFullScene(job, finishJob);
				break;
		}
	}
	else
	{
		jobList.push(job);
	}
};

const finishJob = () => {
	isWorking = false;

	if(jobList.length > 0)
	{
		addJob(jobList[0]);
		jobList.splice(0, 1);
	}
};

const _sliceFullScene = (job: Job, finish: () => void) => {
	const scene = AppStore.sceneStore;
	const printer = scene.printer as Printer;
	printer.workerData = {};
	printer.workerData.gridSize = scene.gridSize;

	printer.workerData.geometry = SceneObject.CalculateGeometry(scene.objects);
	printer.workerData.geometry.computeBoundsTree = computeBoundsTree;
	printer.workerData.geometry.disposeBoundsTree = disposeBoundsTree;
	printer.workerData.raycast = acceleratedRaycast;
	printer.workerData.geometry.computeBoundsTree();
	printer.workerData.geometrySize = new Vector3();
	console.log(12345);

	new THREE.Box3().setFromObject(new THREE.Mesh(printer.workerData.geometry)).getSize(printer.workerData.geometrySize);

	printer.workerData.voxelSize = calculateVoxelSizes(scene.printer as Printer);

	const maxLayers = Math.ceil((printer.workerData.geometrySize.y / printer.workerData.voxelSize.voxelSizeY));

	const workerCountMax = config.workerCount;
	const workerCountNow = 0;

	const layerIteratorFromThread = 0;
	const layerIterator = 0;
	const layersInterval = 100;

	const result: SliceResult[] = [];

	const printerJson = JSON.stringify(scene.printer);

	//let date = Date.now();

	console.log(1234);
	const runWorker = (startLayerNum: number, stopLayerNum: number) => {
		new Promise((resolve, reject) => {
			bridge.ipcRenderer.send('worker-slice',
				printerJson, startLayerNum,  stopLayerNum
			);
			bridge.ipcRenderer.receive('worker-slice-message', (x: string) => {
				console.log(x);
				resolve('done');
			});
			bridge.ipcRenderer.receive('worker-slice-message-progress', (progress: number) => {
				console.log(progress);
			});
		}).then(x => console.log(x));

	};

	runWorker(0, maxLayers);
	// const updateWorkers = () => {
	// 	while (workerCountNow < workerCountMax)
	// 	{
	// 		if(layerIterator === maxLayers)
	// 		{
	// 			break;
	// 		}

	// 		const startNum = layerIterator;

	// 		layerIterator += layersInterval;

	// 		if(layerIterator >= maxLayers)
	// 		{
	// 			layerIterator = maxLayers;
	// 			runWorker(startNum, maxLayers);
	// 			workerCountNow++;
	// 			break;
	// 		}
	// 		else {
	// 			runWorker(startNum, layerIterator - 1);
	// 		}

	// 		workerCountNow++;
	// 	}
	// };

	// updateWorkers();
};
