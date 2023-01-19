import { type } from 'process';
import { AppStore } from 'renderer/AppStore';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { ThreeHelper } from 'renderer/Shared/Helpers/Three';
import { BoxGeometry, Matrix4, Mesh, MeshStandardMaterial, Raycaster, Vector3, Vector3Tuple } from 'three';
import * as THREE from 'three';
import { MeshBVH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

export const VoxelizationFreeSpace = (printer: Printer, mesh: Mesh) => {
	const voxelSize = 0.2;
	const voxelSizeRayPaddingCof = 0.4;
	const voxelSizeMultiplyY = 3;
	const voxelSizes = new Vector3(voxelSize, voxelSize * voxelSizeMultiplyY, voxelSize);
	const printerCubeSize = new Vector3(
		Math.ceil(printer.Workspace.SizeX * 0.1) + voxelSizes.x,
		printer.Workspace.Height * 0.1,
		Math.ceil(printer.Workspace.SizeY * 0.1) + voxelSizes.z);
	const material = new MeshStandardMaterial( {
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

	if (!mesh.geometry.boundsTree)
	{
		mesh.geometry.computeBoundsTree = computeBoundsTree;
		mesh.geometry.disposeBoundsTree = disposeBoundsTree;
		mesh.raycast = acceleratedRaycast;
		mesh.geometry.computeBoundsTree();
	}

	AppStore.sceneStore.scene.add(probeMeshBox);

	const result: VoxelizationResult = {
		VoxelSize: voxelSizes,
		PositionsProbe: []
	};

	for (let y = 0; y <= printerCubeSize.y; y += voxelSizes.y)
	{
		for (let x = 0; x <= printerCubeSize.x; x += voxelSizes.x)
		{
			for (let z = 0; z <= printerCubeSize.z; z += voxelSizes.z)
			{

				probeMeshBox.position.set(x, y, z);
				probeMeshBox.updateMatrixWorld();

				const transformMatrix = new Matrix4()
					.copy(mesh.matrixWorld)
					.invert()
					.multiply(probeMeshBox.matrixWorld);

				const probe = mesh.geometry.boundsTree!.intersectsBox(probeBox, transformMatrix);

				if (probe)
				{
					let distance = 0;
					let point: Vector3 | null = null;

					for (let q = x - voxelSizes.x *voxelSizeRayPaddingCof / 2; q <= x + voxelSizes.x* voxelSizeRayPaddingCof/ 2; q += voxelSizes.x*voxelSizeRayPaddingCof / 10)
					{
						for (let w = z - voxelSizes.z* voxelSizeRayPaddingCof / 2; w <= z + voxelSizes.z* voxelSizeRayPaddingCof / 2; w += voxelSizes.z* voxelSizeRayPaddingCof / 10)
						{
							raycaster.ray.origin.set(q, y - voxelSizes.y / 2, w);

							const intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];

							mesh.raycast(raycaster, intersection);

							intersection.every(x => {
								if (!point || x.distance < distance)
								{
									distance = x.distance;
									point = x.point;
								}
							});
						}
					}

					if (point)
					{
						ThreeHelper.DrawPoint(point);
					}

					if (!point)
					{
						result.PositionsProbe.push({
							Position: new Vector3(x, y, z),
							IsIntersecting: false
						});
						continue;
					}

					AppStore.sceneStore.scene.add(probeMeshBox.clone());
					AppStore.sceneStore.animate();
				}

				result.PositionsProbe.push({
					Position: new Vector3(x, y, z),
					IsIntersecting: probe
				});
			}
		}
	}
};

type VoxelizationResult = {
  VoxelSize: Vector3;
  PositionsProbe: PositionProbe[];
};

type PositionProbe = {
  Position: Vector3;
  IsIntersecting: boolean;
};
