import _ from 'lodash';
import { Printer } from 'renderer/Main/Printer/Configs/Printer';
import { toUnits } from 'renderer/Shared/Globals';
import { ThreeHelper } from 'renderer/Shared/Helpers/Three';
import { CircleGeometry, Float32BufferAttribute, Group, Intersection, Mesh, Object3D, Raycaster, Vector3 } from 'three';
import { PositionProbe } from './SupportsVoxelization';

const down = new Vector3(Math.PI / 2, 0, Math.PI / 2);
const toAngle = (normal: Vector3) => normal!.angleTo(new Vector3(0, -1, 0)) * (180 / Math.PI);
const getRayDirection = (ray: Object3D) => {
	const dir = new Vector3();
	ray.getWorldDirection(dir);
	return dir;
};

export const SupportsRays = (meshes: Mesh[], printer: Printer, probe: PositionProbe) => {
	const body = toUnits(printer.SupportPreset.Body);
	const indent = toUnits(printer.SupportPreset.Indent);
	const retreatFromTheWalls = toUnits(printer.SupportPreset.RetreatFromTheWalls);

	rays = !rays || printer.SupportPreset.Body !== rays.size_mm + retreatFromTheWalls
		? defineRaysObj(printer.SupportPreset.Body + retreatFromTheWalls)
		: rays;

	const endpointPointIndent = probe.Touchpoint!.clone().add(probe.TouchpointNormal!.multiplyScalar(body + indent));

	const findPathToPlane = (from: Vector3, path: Vector3[]) => {
		path.push(from);

		rays!.groupBeam.position.set(from.x, from.y, from.z);
		rays?.groupFocused.position.set(from.x, from.y, from.z);

		const goodRay = rays?.arrayBeam.find(ray => {
			if (Math.ceil(ray.angle) > printer.SupportPreset.Angle)
			{
				return false;
			}

			const nextPoint = from.clone().add(getRayDirection(ray.ray).multiplyScalar(body));

			rays?.groupFocused.lookAt(nextPoint);

			if (calculateIntersects(meshes).some(x => x.distance <= body + retreatFromTheWalls))
			{
				return false;
			}

			return true;
		});

		if (goodRay)
		{
			const nextPoint = from.clone().add(getRayDirection(goodRay.ray).multiplyScalar(body));

			if (nextPoint.y > 0) {
				findPathToPlane(nextPoint, path);
			}
			else {
				nextPoint.setY(0);
				path.push(nextPoint);
			}
		}
	};

	const path: Vector3[] = [];

	findPathToPlane(endpointPointIndent, path);

	if (path.length !== 0 && path[path.length - 1].y <= 0) {
		return path;
	}

	return undefined;
};

const calculateIntersects = (
	meshes: Mesh[]
) => {
	let intersects: Intersection[] = [];

	for(const obj of rays!.arrayFocused)
	{
		const dir = new Vector3();
		const pos = new Vector3();

		obj.getWorldDirection(dir);
		obj.getWorldPosition(pos);

		raycaster.ray.direction = dir;
		raycaster.ray.origin = pos;

		//for debug
		//ThreeHelper.DrawDirLine(pos, dir);

		const arr = raycaster.intersectObjects(meshes);
		if(arr.length) {
			intersects = [...intersects, ...arr];
		}
	}

	return intersects;
};

const defineRaysObj = (size_mm: number) => {
	const rayFocusedDirections: Object3D[] = [];
	const rayBeamDirections: Object3D[] = [];
	const groupFocusedRays = new Group();
	const groupBeamRays = new Group();

	const geometry = new CircleGeometry(toUnits( size_mm ), 12);

	const buffer: Float32BufferAttribute = geometry.attributes.position as Float32BufferAttribute;
	const array: Float32Array = buffer.array as Float32Array;

	for(let i = 0; i < array.length; i += 3)
	{
		if (!array[i] && !array[i+1] && !array[i+2])
		{
			continue;
		}

		const obj = new Object3D();
		obj.position.set(array[i], array[i+1], array[i+2]);
		rayFocusedDirections.push(obj);
		groupFocusedRays.add(obj);
	}

	for (let i = 0; i <= Math.PI * 4; i+= Math.PI / 2) {
		for (const ray of rayFocusedDirections)
		{
			const _ray = ray.clone();
			_ray.rotation.set(ray.position.x * Math.PI * i, ray.position.y * Math.PI * i, ray.position.z * Math.PI * i);
			rayBeamDirections.push(_ray);
			groupBeamRays.add(_ray);
		}
	}

	groupBeamRays.rotation.setFromVector3(down);

	const groupBeam = _.sortBy(rayBeamDirections.map(ray => {
		const dir = new Vector3();
		ray.getWorldDirection(dir);
		return {
			ray: ray,
			angle:toAngle(dir)
		};
	}), obj => obj.angle);

	const visualizeBeam = () => {
		for(const obj of groupBeam)
		{
			const dir = new Vector3();
			const pos = new Vector3();

			obj.ray.getWorldDirection(dir);
			obj.ray.getWorldPosition(pos);

			ThreeHelper.DrawDirLine(pos, dir);
		}
	};

	const visualizeRays = () => {

		for(const obj of groupFocusedRays.children)
		{
			const dir = new Vector3();
			const pos = new Vector3();

			obj.getWorldDirection(dir);
			obj.getWorldPosition(pos);

			ThreeHelper.DrawDirLine(pos, dir);
		}
	};

	//visualizeBeam();

	return {
		visualizeRays: visualizeRays,
		visualizeBeam: visualizeBeam,

		arrayFocused: rayFocusedDirections,
		groupFocused: groupFocusedRays,

		arrayBeam: groupBeam,
		groupBeam: groupBeamRays,

		size_mm:size_mm
	};
};

const raycaster = new Raycaster();

let rays: {
	visualizeRays: () => void;
	visualizeBeam: () => void;
	arrayFocused: Object3D[];
	groupFocused: Object3D;
	arrayBeam: Beam[];
	groupBeam: Object3D;
	size_mm: number;
} | undefined;

export type SupportsRaysQuery = {
	Mesh: Mesh;
	Printer: Printer;
};

type Beam = {
	ray: Object3D;
	angle: number;
};
