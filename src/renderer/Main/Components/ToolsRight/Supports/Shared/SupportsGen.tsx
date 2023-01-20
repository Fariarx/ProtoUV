import _ from 'lodash';
import { AppStore } from 'renderer/AppStore';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { toUnits } from 'renderer/Shared/Globals';
import { ThreeHelper } from 'renderer/Shared/Helpers/Three';
import { BoxGeometry, BufferGeometry, CatmullRomCurve3, Curve, Group, Material, Matrix4, Mesh, MeshStandardMaterial, Quaternion, Raycaster, TubeGeometry, Vector3 } from 'three';
import * as THREE from 'three';
import {  acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

export const VoxelizationFreeSpace = (query: VoxelizationQuery) => {
	const preset = query.Printer.SupportPreset;
	const body = toUnits(preset.Body) ;
	const voxelSizes = new Vector3(body * preset.Density, 1, body * preset.Density);

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
			let normal: Vector3 | null = null;

			for (let q = x - voxelSizes.x / 2; q <= x + voxelSizes.x / 2; q += voxelSizes.x / preset.Rays)
			{
				for (let w = z - voxelSizes.z / 2; w <= z + voxelSizes.z / 2; w += voxelSizes.z / preset.Rays)
				{
					raycaster.ray.origin.set(q, y - voxelSizes.y / 2, w);

					const intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];

					query.Mesh.raycast(raycaster, intersection);

					intersection.every(x => {
						if (!point || x.distance < distance)
						{
							if (x.face && !result.PositionsProbe.some(y => y.Touchpoint && y.Touchpoint.distanceTo(x.point) < body * 4))
							{
								distance = x.distance;
								point = x.point;
								normal = x.face.normal.applyQuaternion(query.Mesh.quaternion);
								//ThreeHelper.DrawDirLine(x.point, normal);
								//console.log(normal );
							}
						}
					});
				}
			}

			AppStore.sceneStore.scene.add(probeMeshBox.clone());
			AppStore.sceneStore.animate();

			if (point && (360 - normal!.angleTo(new Vector3(0, 1, 0)) * (180 / Math.PI) - 180) < 90)
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

	PerformSupports(result);

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

export const PerformSupports = (query: VoxelizationResult) => {
	const world = query.PositionsProbe;
	const head = toUnits(query.VoxelizationQuery.Printer.SupportPreset.Head);
	const connection = toUnits(query.VoxelizationQuery.Printer.SupportPreset.ConnectionSphere);
	const body = toUnits(query.VoxelizationQuery.Printer.SupportPreset.Body);
	const radiusSearch = 1;

	let callstack = 999;

	const nearest = (vec3: Vector3) => {
		return world.filter(x => {
			return x.Position.distanceTo(vec3) <= radiusSearch
      && x.Position.y <= vec3.y
      && !x.IsIntersecting;
		});
	};
	const getEffectivePath = (node: PositionProbe, result: { path: PositionProbe[] }, path: PositionProbe[] = []) => {
		callstack--;

		if (node.Position.y <= 0)
		{
			if (result.path.length === 0 || result.path.length > path.length) {
				result.path = path;
			}
			return;
		}

		if (result.path.length !== 0 || 0 > callstack)
		{
			return;
		}

		const nodes = _.sortBy(nearest(node.Position), x => x.Position.y).sort((a, b) => a.Position.x === b.Position.x && a.Position.z === b.Position.z ? -1 : 1);
		for (const node of nodes)
		{
			//ThreeHelper.DrawPoint(node.Position);

			if (result.path.length !== 0 || 0 > callstack)
			{
				return;
			}
			getEffectivePath(node, result, [node, ...path]);
		}
	};

	for (const node of world)
	{
		if (node.Touchpoint)
		{
			const result = {
				path: [] as PositionProbe[]
			};

			getEffectivePath(node, result);

			//console.log(result);

			if (result.path.length)
			{
				const headStart = node.Position.clone().setY(- 0.5);
				const headEnd =  node.Touchpoint;
				const headCenter = getPointInBetweenByLen(headStart, headEnd, 0.5);

				const collisionCof = 5;
				const material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );

				const supportMesh = new Mesh();

				// Удаляем точки соединения выше
				const line = [ ...result.path.map(x => x.Position), headStart, headCenter]
					.filter((x, _, self) => x.y <= self[self.length - 2].y);

				line.forEach((point, index, self) => {
					const next = self[index + 1];
					if (next)
					{
						supportMesh.add(createCylinder(
							material, point, next, point.distanceTo(next),
							body * collisionCof,
							body  * collisionCof).mesh);
						supportMesh.add(createContactSphere(
							material, point, connection * collisionCof).mesh);
					}
				});

				supportMesh.add( createContactSphere(material, headCenter, connection * collisionCof).mesh );

				const transformMatrix = new Matrix4()
					.copy(query.VoxelizationQuery.Mesh.matrixWorld)
					.invert();

				const intersectsWithPrint = !supportMesh.children.some((child: Mesh | any)  => {
					child.updateMatrixWorld();
					return query.VoxelizationQuery.Mesh.geometry.boundsTree!.intersectsGeometry(
						child.geometry, transformMatrix.clone().multiply(child.matrixWorld));
				});

				//console.log(intersectsWithPrint);

				if (intersectsWithPrint)
				{
					supportMesh.clear();

					line.push(headEnd);
					line.forEach((point, index, self) => {
						const next = self[index + 1];
						if (next)
						{
							supportMesh.add(createCylinder(
								material, point, next, point.distanceTo(next),
								body,
								head).mesh);
							supportMesh.add(createContactSphere(
								material, point, body).mesh);
						}
					});

					supportMesh.add( createContactSphere(material, headEnd, connection).mesh );
					supportMesh.updateMatrixWorld();

					AppStore.sceneStore.scene.add( supportMesh );
				}
			}
			//break;
		}
	}

};

type PathPoint = {
      // текущая точка
      node: PositionProbe;
      // точка из которой пришли сюда
      cameFrom?: PathPoint;
      deltaAngle?: number;
};

const createCylinder = (
	material: Material,
	positionStart: Vector3,
	positionEnd: Vector3,
	height: number,
	diameterBottom: number,
	diameterTop: number
) => {
	const geometry = new THREE.CylinderGeometry( diameterTop, diameterBottom,  height , 6); //to mm
	const mesh = new THREE.Mesh( geometry, material );
	const center = new Vector3((positionEnd.x + positionStart.x) / 2, (positionEnd.y + positionStart.y) / 2, (positionEnd.z + positionStart.z) / 2);

	mesh.position.set(center.x, center.y, center.z);
	mesh.lookAt(positionStart);
	mesh.rotateX(-Math.PI / 2);

	return {
		mesh: mesh,
	};
};
const createContactSphere = (
	material: Material,
	positionStart: THREE.Vector3,
	diameter: number
) => {
	const geometry = new THREE.SphereGeometry( diameter * 1.05, 9, 9);
	const mesh = new THREE.Mesh( geometry, material );

	mesh.position.set(positionStart.x, positionStart.y, positionStart.z);

	return {
		mesh: mesh
	};
};

const getPointInBetweenByLen = (pointA: Vector3, pointB: Vector3, percentage: number) => {
	let dir = pointB.clone().sub(pointA);
	const len = dir.length();
	dir = dir.normalize().multiplyScalar(len*percentage);
	return pointA.clone().add(dir);
};
