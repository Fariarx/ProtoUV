import _ from 'lodash';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { toUnits } from 'renderer/Shared/Globals';
import { BoxGeometry, Intersection, Matrix4, Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three';
import * as THREE from 'three';
import {  acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

export const VoxelizationFreeSpace = (mesh: Mesh, printer: Printer) => {
	const preset = printer.SupportPreset;
	const body = toUnits(preset.Body) ;
	const voxelSizes = new Vector3(body * preset.Density, Math.min(toUnits(preset.Density), 1), body * preset.Density);

	const printerCubeSize = new Vector3(
		Math.ceil(printer.Workspace.SizeX * 0.1) + voxelSizes.x,
		printer.Workspace.Height * 0.1,
		Math.ceil(printer.Workspace.SizeY * 0.1) + voxelSizes.z);
	const material = new MeshStandardMaterial({
		metalness: 0.1,
		transparent: true,
		opacity: 0.4,
		premultipliedAlpha: true
	});
	const probeBox = new THREE.Box3();
	const raycaster = new Raycaster();
	raycaster.params.Line = {
		threshold: 0.05
	};
	raycaster.params.Points = {
		threshold: 0.05
	};

	const probeMeshBox = new Mesh(new BoxGeometry(voxelSizes.x, voxelSizes.y, voxelSizes.z), material);
	probeMeshBox.updateMatrixWorld();
	probeBox.setFromObject(probeMeshBox);
	raycaster.ray.direction.set(0, 1, 0);

	if (!mesh.geometry.boundsTree)
	{
		mesh.geometry.computeBoundsTree = computeBoundsTree;
		mesh.geometry.disposeBoundsTree = disposeBoundsTree;
		mesh.raycast = acceleratedRaycast;
		mesh.geometry.computeBoundsTree();
	}

	//AppStore.sceneStore.scene.add(probeMeshBox);

	const result: VoxelizationResult = {
		PositionsProbe: []
	};

	const performVoxel = (x: number, y: number, z: number) => {
		probeMeshBox.position.set(x, y, z);
		probeMeshBox.updateMatrixWorld();

		const transformMatrix = new Matrix4()
			.copy(mesh.matrixWorld)
			.invert()
			.multiply(probeMeshBox.matrixWorld);

		const probe = mesh.geometry.boundsTree!.intersectsBox(probeBox, transformMatrix);

		if (probe)
		{
			let minIntersection: Intersection | undefined;

			for (let q = x - voxelSizes.x / 2; q <= x + voxelSizes.x / 2; q += voxelSizes.x / preset.Rays)
			{
				for (let w = z - voxelSizes.z / 2; w <= z + voxelSizes.z / 2; w += voxelSizes.z / preset.Rays)
				{
					raycaster.ray.origin.set(q, y - voxelSizes.y / 2, w);

					const intersection: Intersection[] = [];

					mesh.raycast(raycaster, intersection);

					if (intersection.length)
					{
						const min = _.minBy(intersection
							.filter(s => !!s.face && !result.PositionsProbe.some(y => y.Touchpoint && y.Touchpoint.distanceTo(s.point) < body * 4)), r => r.distance);
						if (min)
						{
							if (!minIntersection || minIntersection?.distance > min.distance)
							{
								minIntersection= min;
							}
						}
					}
				}
			}

			//AppStore.sceneStore.scene.add(probeMeshBox.clone());
			//AppStore.sceneStore.animate();

			//angle = normal!.angleTo(new Vector3(0, -1, 0)) * (180 / Math.PI);

			if (minIntersection && minIntersection.face)
			{
				//ThreeHelper.DrawPoint(minIntersection.point);

				const normalMatrix = new THREE.Matrix3().getNormalMatrix( mesh.matrixWorld );
				const normalAngle = minIntersection.face.normal.clone().applyMatrix3( normalMatrix ).normalize().angleTo(new Vector3(0, -1, 0)) * (180 / Math.PI);

				if (normalAngle <= preset.Angle) {
					result.PositionsProbe.push({
						TouchpointAngle: normalAngle,
						Touchpoint: minIntersection.point,
						Position: new Vector3(x, y, z),
						IsIntersecting: probe,
						TouchpointNormal: minIntersection.face!.normal
					});
				}

				return;
			}
		}

		result.PositionsProbe.push({
			Position: new Vector3(x, y, z),
			IsIntersecting: probe
		});
	};

	for (let y = 0; y <= printerCubeSize.y; y += voxelSizes.y)
	{
		for (let x = 0; x <= printerCubeSize.x; x += voxelSizes.x )
		{
			for (let z = 0; z <= printerCubeSize.z; z += voxelSizes.z )
			{
				performVoxel(x, y, z);
			}
		}
	}

	return result;
};

export type VoxelizationResult = {
	PositionsProbe: PositionProbe[];
};

export type PositionProbe = {
  TouchpointAngle?: number;
  TouchpointNormal?: Vector3;
  Touchpoint?: Vector3;
  Position: Vector3;
  IsIntersecting: boolean;
  Path?: Vector3[];
};
