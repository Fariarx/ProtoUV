import * as THREE from 'three';
import { Vector3 } from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import { Job, WorkerType } from './Job';
import { AppStore } from '../../../AppStore';
import { Printer } from '../../../Main/Printer/Configs/Printer';
import { SceneObject } from '../../../Main/Scene/Entities/SceneObject';
import { bridge } from '../../Globals';

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
		new Promise(resolve => {
			bridge.ipcRenderer.send('capture-page'
			);
		}).then(x => {
			job.onResult(x);
			finishJob();
		});
	};

	runWorker(0, maxLayers);
};

export const calculateVoxelSizes = (printer: Printer) => {
	return {
		voxelSizeX: .1 * printer.Workspace.SizeX / printer.Resolution.X,
		voxelSizeY: .1 * printer.PrintSettings.LayerHeight,
		voxelSizeZ: .1 * printer.Workspace.SizeY / printer.Resolution.Y,
	};
};
