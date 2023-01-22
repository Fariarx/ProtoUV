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

	new THREE.Box3().setFromObject(new THREE.Mesh(printer.workerData.geometry)).getSize(printer.workerData.geometrySize);

	printer.workerData.voxelSize = calculateVoxelSizes(scene.printer as Printer);

	const maxLayers = Math.ceil((printer.workerData.geometrySize.y / printer.workerData.voxelSize.voxelSizeY));
	const printerJson = JSON.stringify(scene.printer);

	const runWorker = (startLayerNum: number, stopLayerNum: number) => {
		new Promise((resolve, reject) => {
			bridge.ipcRenderer.send('worker-slice',
				printerJson, startLayerNum,  stopLayerNum
			);
			bridge.ipcRenderer.receive('worker-slice-message', (x: string) => {
				resolve(x);
			});
			bridge.ipcRenderer.receive('worker-slice-message-progress', (progress: number) => {
				job.onState(progress);
			});
		}).then(x => {
			const result = x as SliceResult[];
			job.onResult(result);
			finishJob();
		});
	};

	runWorker(0, maxLayers);
};
