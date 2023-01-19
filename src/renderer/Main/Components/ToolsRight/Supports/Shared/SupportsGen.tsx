import _ from 'lodash';
import { AppStore } from 'renderer/AppStore';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { ThreeHelper } from 'renderer/Shared/Helpers/Three';
import { BoxGeometry, Matrix4, Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three';
import * as THREE from 'three';
import {  acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

export const VoxelizationFreeSpace = (query: VoxelizationQuery) => {
	const preset = query.Printer.SupportPreset;
	const padding = preset.Padding;
	const density = preset.Density;
	const body = preset.Body;
	const voxelSizes = new Vector3(body * density, body * 2, body * density);
	const printerCubeSize = new Vector3(
		Math.ceil(query.Printer.Workspace.SizeX * 0.1) + voxelSizes.x,
		query.Printer.Workspace.Height * 0.1,
		Math.ceil(query.Printer.Workspace.SizeY * 0.1) + voxelSizes.z);
	const material = new MeshStandardMaterial({
		metalness: 0.1,
		transparent: true,
		opacity: 0.4,
		premultipliedAlpha: true
	});
	const probeBox = new THREE.Box3();
	const raycaster = new Raycaster();
	const probeMeshBox = new Mesh(new BoxGeometry(voxelSizes.x, voxelSizes.y, voxelSizes.z), material);
	probeMeshBox.updateMatrixWorld();
	probeBox.setFromObject(probeMeshBox);
	raycaster.ray.direction.set(0, 1, 0);

	if (!query.Mesh.geometry.boundsTree)
	{
		query.Mesh.geometry.computeBoundsTree = computeBoundsTree;
		query.Mesh.geometry.disposeBoundsTree = disposeBoundsTree;
		query.Mesh.raycast = acceleratedRaycast;
		query.Mesh.geometry.computeBoundsTree();
	}

	AppStore.sceneStore.scene.add(probeMeshBox);

	const result: VoxelizationResult = {
		VoxelizationQuery: query,
		PositionsProbe: []
	};

	const performVoxel = (x: number, y: number, z: number) => {
		probeMeshBox.position.set(x, y, z);
		probeMeshBox.updateMatrixWorld();

		const transformMatrix = new Matrix4()
			.copy(query.Mesh.matrixWorld)
			.invert()
			.multiply(probeMeshBox.matrixWorld);

		const probe = query.Mesh.geometry.boundsTree!.intersectsBox(probeBox, transformMatrix);

		if (probe)
		{
			let distance = 0;
			let point: Vector3 | null = null;

			for (let q = x - voxelSizes.x *padding / 2; q <= x + voxelSizes.x* padding/ 2; q += voxelSizes.x*padding / preset.Rays)
			{
				for (let w = z - voxelSizes.z*padding / 2; w <= z + voxelSizes.z*padding / 2; w += voxelSizes.z*padding / preset.Rays)
				{
					raycaster.ray.origin.set(q, y - voxelSizes.y / 2, w);

					const intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];

					query.Mesh.raycast(raycaster, intersection);

					intersection.every(x => {
						if (!point || x.distance < distance)
						{
							distance = x.distance;
							point = x.point;
						}
					});
				}
			}

			AppStore.sceneStore.scene.add(probeMeshBox.clone());
			AppStore.sceneStore.animate();

			if (point)
			{
				ThreeHelper.DrawPoint(point);
				result.PositionsProbe.push({
					Touchpoint: point,
					Position: new Vector3(x, y, z),
					IsIntersecting: probe
				});
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

	const clearConflictPoints = (positionsProbe: PositionProbe[]) => {
		positionsProbe.forEach(x => {
			if (x.Touchpoint !== undefined)
			{
				const min = _.minBy(positionsProbe, y => y.Touchpoint ? y.Touchpoint.distanceTo(x.Touchpoint!) : 99999999999);
				if (min && min.Touchpoint!.distanceTo(x.Touchpoint) < Math.max(preset.Head, preset.ConnectionSphere))
				{
					x.Touchpoint = undefined;
					return;
				}
			}
		});
	};

	clearConflictPoints(result.PositionsProbe);

	return result;
};

type VoxelizationQuery = {
	Mesh: Mesh;
	Printer: Printer;
};

type VoxelizationResult = {
	VoxelizationQuery: VoxelizationQuery;
	PositionsProbe: PositionProbe[];
};

type PositionProbe = {
  Touchpoint?: Vector3;
  Position: Vector3;
  IsIntersecting: boolean;
};
