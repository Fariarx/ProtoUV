import { action, makeObservable, observable, runInAction } from 'mobx';
import { toUnits } from 'renderer/Shared/Globals';
import { AppEventDeleteObject, AppEventEnum, AppEventMoveObject, TransformEnum } from 'renderer/Shared/Libs/Types';
import {
	BufferGeometry,
	Mesh,
	Vector3,
} from 'three';
import { AppStore } from '../../../AppStore';
import { Dispatch } from '../../../Shared/Events';
import { SceneStore } from '../SceneStore';

export class SceneObject {
	name: string;

	geometry: BufferGeometry;
	mesh: Mesh;

	minY: Vector3;
	maxY: Vector3;
	minX: Vector3;
	maxX: Vector3;
	minZ: Vector3;
	maxZ: Vector3;
	center: Vector3;
	size: Vector3 = new Vector3();
	sceneStore: SceneStore;
	supports?: Mesh[];

	@observable
		isSelected: boolean;

	public settings = {
		wireframe: false,
		bbox: false
	};

	private wasSelected: boolean;

	constructor(geometry: BufferGeometry,
		filePath: string,
		selected = false,
		sceneStore: SceneStore = AppStore.sceneStore)
	{
		this.name = (filePath.split('\\').pop()?.split('.').shift() ?? 'undefined');
		this.sceneStore = sceneStore;
		this.geometry = geometry;
		this.geometry.scale(0.1, 0.1, 0.1);
		this.mesh = new Mesh(geometry, sceneStore.materialForObjects.normal);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		this.mesh.geometry.center();

		this.minY = new Vector3();
		this.maxY = new Vector3();
		this.minX = new Vector3();
		this.maxX = new Vector3();
		this.minZ = new Vector3();
		this.maxZ = new Vector3();
		this.center = new Vector3();

		this.isSelected = this.wasSelected = selected;
		this.Update();

		makeObservable(this);
	}

	UpdateSelection = () => {
		if (this.wasSelected !== this.isSelected) {
			this.wasSelected = this.isSelected;
		}

		if (this.isSelected) {
			this.mesh.material = this.sceneStore.materialForObjects.select;
		} else {
			this.mesh.material = this.sceneStore.materialForObjects.normal;
		}

		return {
			now: this.isSelected,
			was: this.wasSelected
		};
	};

	Update = () => {
		this.UpdateSelection();
		this.UpdateSize();
	};

	UpdateSize = () => {
		this.mesh.updateMatrixWorld();

		const geometry = this.mesh.geometry;
		const vertices = geometry.attributes.position.array;
		const deltaMax = 999999;

		const minXPoint = new Vector3(deltaMax, 0, 0);
		const maxXPoint = new Vector3(-deltaMax, 0, 0);
		const minYPoint = new Vector3(0, deltaMax, 0);
		const maxYPoint = new Vector3(0, -deltaMax, 0);
		const minZPoint = new Vector3(0, 0, deltaMax);
		const maxZPoint = new Vector3(0, 0, -deltaMax);

		const vector3 = new Vector3();

		for (let i = 0; i < vertices.length; i=i+3) {
			const vertex = this.mesh.localToWorld(vector3.set(vertices[i], vertices[i+1], vertices[i+2]));

			if (vertex.y < minYPoint.y)
			{
				minYPoint.set(vertex.x, vertex.y, vertex.z);
			}
			if (vertex.y > maxYPoint.y)
			{
				maxYPoint.set(vertex.x, vertex.y, vertex.z);
			}
			if (vertex.x < minXPoint.x)
			{
				minXPoint.set(vertex.x, vertex.y, vertex.z);
			}
			if (vertex.x > maxXPoint.x)
			{
				maxXPoint.set(vertex.x, vertex.y, vertex.z);
			}
			if (vertex.z < minZPoint.z)
			{
				minZPoint.set(vertex.x, vertex.y, vertex.z);
			}
			if (vertex.z > maxZPoint.z)
			{
				maxZPoint.set(vertex.x, vertex.y, vertex.z);
			}
		}

		this.minX = minXPoint;
		this.maxX = maxXPoint;
		this.minY = minYPoint;
		this.maxY = maxYPoint;
		this.minZ = minZPoint;
		this.maxZ = maxZPoint;

		this.center.set(
			(maxXPoint.x + minXPoint.x) / 2,
			(maxYPoint.y + minYPoint.y) / 2,
			(maxZPoint.z + minZPoint.z) / 2,
		);

		this.size.set(
			Math.abs(maxXPoint.x - minXPoint.x),
			Math.abs(maxYPoint.y - minYPoint.y),
			Math.abs(maxZPoint.z - minZPoint.z),
		);
	};

	AddToScene = (withBoxHelper?: boolean) => {
		if (withBoxHelper) {
			this.settings.bbox = true;
		}
		this.sceneStore.scene.add(this.mesh);
	};

	AlignToPlaneY = (deletedSupportsDisabled?: boolean) => {
		this.mesh.position.setY(0);
		this.UpdateSize();

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: this.mesh.position.clone().setY(this.supports !== undefined && this.sceneStore.printer
				? -this.minY.y + toUnits(this.sceneStore.printer.SupportPreset.Lifting)
				: -this.minY.y),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move,
			deletedSupportsDisabled: deletedSupportsDisabled
		} as AppEventMoveObject);

		this.UpdateSize();
	};

	AlignToPlaneXZ = (gridVec: Vector3) => {
		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: this.mesh.position.clone().setX(gridVec.x / 2).setZ(gridVec.z / 2),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as AppEventMoveObject);

		this.UpdateSize();
	};

	AlignToPlanePreparedToPrint = () => {
		const size = this.size.clone();
		const rotation = this.mesh.rotation.clone();

		for (let x = 0.5; x <= 4; x+=0.5)
		{
			this.mesh.rotation.set(Math.PI / x, 0, 0);
			this.UpdateSize();

			if (this.size.x > size.x || this.size.z > size.z)
			{
				size.setX(this.size.x).setZ(this.size.z);
				rotation.set(this.mesh.rotation.x, this.mesh.rotation.y, this.mesh.rotation.z);
			}
		}

		this.mesh.rotation.set(-rotation.x, -rotation.y, -rotation.z);
	};

	AlignByOtherSceneItems = () => {
		const randomFactorX = Math.random() > 0.5 ? -1 : 1;
		const randomFactorZ = Math.random() > 0.5 ? -1 : 1;

		const checkIntersectionWithOtherByX = () => {
			return this.sceneStore.objects.find(obj => {
				if (obj.mesh.uuid === this.mesh.uuid)
				{
					return false;
				}

				return (randomFactorX > 0
					? obj.minX.x <= this.minX.x && this.minX.x <= obj.maxX.x
					: obj.minX.x <= this.maxX.x && this.maxX.x <= obj.maxX.x);
			});
		};

		const checkIntersectionWithOtherByZ = () => {
			return this.sceneStore.objects.find(obj => {
				if (obj.mesh.uuid === this.mesh.uuid)
				{
					return false;
				}

				return (randomFactorZ > 0
					? obj.minZ.z <= this.minZ.z && this.minZ.z <= obj.maxZ.z
					: obj.minZ.z <= this.maxZ.z && this.maxZ.z <= obj.maxZ.z);
			});
		};

		if (Math.random() > 0.5)
		{
			while(this.sceneStore.objects.length > 1 && checkIntersectionWithOtherByX())
			{
				this.mesh.position.set(
					this.mesh.position.x + randomFactorX * this.size.x / 7.7,
					this.mesh.position.y,
					this.mesh.position.z
				);
				this.UpdateSize();
			}
		}
		else {
			while(this.sceneStore.objects.length > 1 && checkIntersectionWithOtherByZ())
			{
				this.mesh.position.set(
					this.mesh.position.x,
					this.mesh.position.y,
					this.mesh.position.z + randomFactorZ * this.size.z / 7.7
				);
				this.UpdateSize();
			}
		}
	};

	IsEqual3dObject(_mesh: THREE.Mesh) {
		return _mesh === this.mesh;
	}

	Dispose() {
		runInAction(() => {
			this.sceneStore.scene.remove(this.mesh);
			this.sceneStore.groupSelected.splice(this.sceneStore.objects.findIndex(x => x.mesh.uuid === this.mesh.uuid), 1);
			this.sceneStore.objects.splice(this.sceneStore.objects.findIndex(x => x.mesh.uuid === this.mesh.uuid), 1);
			this.geometry.dispose();
			this.mesh.clear();
		});
	}

	static UpdateSupports(objs: SceneObject[], isVisible: boolean) {
		objs.forEach(obj => obj.supports?.forEach(support => support.children[0].visible = isVisible));
	}

	static SearchIndexByMesh(objs: SceneObject[], _mesh: THREE.Mesh) {
		let _index = -1;

		objs.every((element, index) => {
			if (element.mesh.uuid === _mesh.uuid) {
				_index = index;
				return false;
			}
			return true;
		});

		return _index;
	}

	static SearchSceneObjByMesh(objs: SceneObject[], _mesh: THREE.Mesh) : SceneObject | null {
		const result = this.SearchIndexByMesh(objs, _mesh);

		if (result > -1)
		{
			return objs[result];
		}
		else
		{
			return null;
		}
	}

	static UpdateObjs(objs: SceneObject[]) {
		objs.every(function (element) {
			element.Update();
		});
	}

	static GetUniqueInA(a: SceneObject[], b: SceneObject[]): SceneObject[] {
		const result:SceneObject[] = [];

		a.forEach((element) => {
			if (b.indexOf(element) === -1)
			{
				result.push(element);
			}
		});

		return result;
	}

	static GetMeshesFromObjs(objs: SceneObject[]): THREE.Mesh[] {
		const arr: THREE.Mesh[] = objs.map(function (element) {
			return element.mesh;
		});

		return arr;
	}

	static GetSupportMeshesFromObjs(objs: SceneObject[]): THREE.Mesh[] {
		const arr: THREE.Mesh[] = objs.flatMap(function (element) {
			return element.supports ?? [];
		});

		return arr;
	}

	static GetByName(objs: SceneObject[], name: string): SceneObject | null {
		let _element: SceneObject | null = null;

		objs.every(function (element) {
			if (element.name === name) {
				_element = element;
				return false;
			}

			return true;
		});

		return _element;
	}

	static CalculateGroupMaxSize(objs: SceneObject[]): Vector3 {
		let deltaSize: Vector3 = new Vector3();

		objs.every(function (element, index) {
			const size = element.size;

			if (index === 0) {
				deltaSize = size.clone();
			} else {
				deltaSize.x = (deltaSize.x + size.x) / 2;
				deltaSize.y = (deltaSize.y + size.y) / 2;
				deltaSize.z = (deltaSize.z + size.z) / 2;
			}
		});

		return deltaSize;
	}

	static CalculateGroupCenter(objs: SceneObject[]): Vector3 {
		let delta: Vector3 = new Vector3();

		objs.every(function (element, index) {
			const position = element.mesh.position;

			if (index === 0) {
				delta = position.clone();
			} else {
				delta.x = (delta.x + position.x) / 2;
				delta.y = (delta.y + position.y) / 2;
				delta.z = (delta.z + position.z) / 2;
			}
		});

		return delta;
	}

	static CalculateGeometry(objs: SceneObject[]): BufferGeometry {
		if (!objs.length) {
			throw('CalculateGeometry objs is null length');
		}

		const geometry = objs[0].mesh.geometry.clone().applyMatrix4(objs[0].mesh.matrix);

		objs.forEach(function (element, index) {
			if (index !== 0) {
				geometry.merge(element.mesh.geometry.clone().applyMatrix4(objs[index].mesh.matrix));
			}
		});

		return geometry;
	}

	static SelectObjsAlignY = () => {
		if (AppStore.sceneStore.groupSelected.length) {
			for (const sceneObject of AppStore.sceneStore.groupSelected) {
				sceneObject.Update();
				sceneObject.AlignToPlaneY();
			}
		}

		AppStore.sceneStore.animate();
	};

	static SelectObjsDelete = () => {
		if (AppStore.sceneStore.groupSelected.length ) {
			for (const sceneObject of AppStore.sceneStore.groupSelected) {
				Dispatch(AppEventEnum.DELETE_OBJECT, {
					object: sceneObject,
				} as AppEventDeleteObject);
			}
		}

		if (AppStore.sceneStore.objects.length > 0)
		{
			AppStore.sceneStore.objects[0].isSelected = true;
			AppStore.sceneStore.updateSelectionChanged();
		}
		else {
			AppStore.sceneStore.transformControls.detach();
		}

		AppStore.sceneStore.animate();
	};

	static DeselectAllObjects = () => {
		if (AppStore.sceneStore.groupSelected.length) {
			for (const sceneObject of AppStore.sceneStore.groupSelected) {
				sceneObject.isSelected = false;
			}
		}

		AppStore.sceneStore.updateSelectionChanged();
		AppStore.sceneStore.animate();
	};

	static SelectAllObjects = () => {
		for (const sceneObject of AppStore.sceneStore.objects) {
			sceneObject.isSelected = true;
		}

		AppStore.sceneStore.updateSelectionChanged();
		AppStore.sceneStore.animate();
	};
}
