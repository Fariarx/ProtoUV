import fs from 'fs';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { BufferGeometryLoader, Raycaster } from 'three';
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { parentPort, workerData } from 'worker_threads';
import * as zlib from 'zlib';

const slice = async (printer: Printer, layer: number, mesh: MeshBVH, raycaster: Raycaster) => {
	const voxelSizes = printer.workerData.voxelSize;

	const startPixelPositionX = printer.workerData.gridSize.x / 2 - voxelSizes.voxelSizeX * printer.Resolution.X / 2;
	const startPixelPositionY = layer * voxelSizes.voxelSizeY;
	const startPixelPositionZ = printer.workerData.gridSize.z / 2 - .1 * printer.Workspace.SizeY / 2;

	const imageBuffer = new Uint8Array(printer.Resolution.X * printer.Resolution.Y );

	imageBuffer.fill(0x00);

	let voxelDrawCount = 0;
	let indexPixelX = 0;

	raycaster.ray.direction.set(0, 0, 1);

	while (indexPixelX < printer.Resolution.X) {
		const newPixelPositionX = startPixelPositionX + voxelSizes.voxelSizeX * indexPixelX;

		raycaster.ray.origin.set(newPixelPositionX, startPixelPositionY, startPixelPositionZ);

		const intersection: any[] = mesh.raycast(raycaster.ray, THREE.DoubleSide);

		//DrawDirLine(raycaster.ray.origin, raycaster.ray.direction, sceneStore.scene)

		intersection.sort((a, b) => {
			return a.distance < b.distance ? -1 : 1;
		});

		//console.log(intersection)

		for (let i = 0; i < intersection.length; i++) {

			const isFrontFacing = intersection[i].face.normal.dot(raycaster.ray.direction) < 0;

			if (!isFrontFacing) {
				continue;
			}

			let numSolidsInside = 0;
			let j = i + 1;

			while (j < intersection.length) {
				const isFrontFacing = intersection[j].face.normal.dot(raycaster.ray.direction) < 0;

				if (!isFrontFacing) {
					if (numSolidsInside === 0) {
						// Found it
						break;
					}
					numSolidsInside--;
				} else {
					numSolidsInside++;
				}

				j++;
			}

			if (j >= intersection.length) {
				continue;
			}

			const indexStartZ = Math.floor((intersection[i].point.z - (startPixelPositionZ)) / voxelSizes.voxelSizeZ);
			const indexFinishZ = Math.ceil((intersection[j].point.z - (startPixelPositionZ)) / voxelSizes.voxelSizeZ);
			const bufferStartIndexX = printer.Resolution.X * indexPixelX;

			voxelDrawCount += indexFinishZ - indexPixelX;

			imageBuffer.fill(0xff, bufferStartIndexX + indexStartZ, bufferStartIndexX +  indexFinishZ);

			i = j;
		}

		indexPixelX += 1;
	}

	fs.writeFileSync(userData +'/slice/' + layer +'.layer',  zlib.gzipSync(imageBuffer), 'binary');
};

export const sliceLayers = async (printerJson: string, numLayerFrom: number, numLayerTo: number) => {
	const start = numLayerFrom;

	const printer = JSON.parse(printerJson) as Printer;
	const raycaster = new Raycaster();
	const geometry = new BufferGeometryLoader().parse(printer.workerData.geometry);
	const mesh = new MeshBVH(geometry, {
		maxLeafTris: 20
	});

	const _w = printer.Resolution.X;
	const _h = printer.Resolution.Y;

	const _slice = (layer: number) => {
		slice(printer, layer, mesh, raycaster);
	};

	while (numLayerFrom <= numLayerTo) {
		_slice(numLayerFrom);

		parentPort?.postMessage((numLayerFrom - start)/(numLayerTo - start));

		numLayerFrom++;
	}
};

const userData = workerData[3];

if (fs.existsSync(userData +'/slice'))
{
	fs.rmSync(userData +'/slice', { recursive: true, force: true });
}
fs.mkdirSync(userData +'/slice');

parentPort?.postMessage(userData);
sliceLayers(workerData[0], workerData[1], workerData[2]).then(x => {
	parentPort?.postMessage('slice finished from worker');
});

parentPort?.postMessage('slice started from worker');
