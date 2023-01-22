
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { BufferGeometry, Raycaster } from 'three';
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';

const material = new THREE.MeshPhongMaterial( { color: '#f8a745', emissive:'#ffd4d4', emissiveIntensity:0.3 , flatShading: true, side: THREE.DoubleSide, shininess: 60 } );

export const calculateVoxelSizes = (printer: Printer) => {
	return {
		voxelSizeX: .1 * printer.Workspace.SizeX / printer.Resolution.X,
		voxelSizeY: .1 * printer.PrintSettings.LayerHeight,
		voxelSizeZ: .1 * printer.Workspace.SizeY / printer.Resolution.Y,
	};
};

export type SliceResult = {
        image: Uint8Array;
        voxelCount: number;
};

export const slice = (printer: Printer, layer: number, geometry: BufferGeometry, mesh: MeshBVH, raycaster: Raycaster) => {
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

	return {
		image:imageBuffer,
		voxelCount: voxelDrawCount
	} as SliceResult;
};
