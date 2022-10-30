import { AppEventEnum, AppEventMoveObject, TransformEnum } from 'renderer/Shared/Libs/Types';
import {
	Box3,
	BoxHelper,
	BufferGeometry,
	LineSegments,
	Matrix4,
	Mesh,
	Vector3,
	WireframeGeometry
} from 'three';
import { AppStore } from '../../../AppStore';
import { Dispatch } from '../../../Shared/Events';
import { ThreeHelper } from '../../../Shared/Helpers/Three';
import { SceneStore } from '../SceneStore';

export class SceneObject {
	name: string;

	geometry: BufferGeometry;
	mesh: Mesh;

	minY: Vector3;
	maxY: Vector3;
	center: Vector3;
	size: Vector3 = new Vector3();
	sceneStore: SceneStore;
	isSelected: boolean;

	public settings = {
		wireframe: false,
		bbox: false
	};

	private wasSelected: boolean;

	constructor(geometry: BufferGeometry,
		name: string,
		objs: SceneObject[],
		selected = false,
		sceneStore: SceneStore = AppStore.sceneStore)
	{
		let index = 0;
		let sceneName = index + ' : ' + name;

		while (SceneObject.GetByName(objs, sceneName) !== null) {
			objs[index].name = sceneName;
			sceneName = ++index + ' : ' + name;
		}

		this.name = sceneName;
		this.sceneStore = sceneStore;
		this.geometry = geometry;
		this.geometry.scale(0.1, 0.1, 0.1);
		this.mesh = new Mesh(geometry, sceneStore.materialForObjects.normal);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		this.mesh.geometry.center();

		this.minY = new Vector3();
		this.maxY = new Vector3();
		this.center = new Vector3();

		this.isSelected = this.wasSelected = selected;
		this.Update();
	}

	UpdateSelection() {
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
	}

	Update() {
		this.UpdateSelection();
		this.UpdateSize();
	}

	UpdateSize() {
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

		this.minY = minYPoint;
		this.maxY = maxYPoint;

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
	}

	AddToScene(withBoxHelper?: boolean) {
		if (withBoxHelper) {
			this.settings.bbox = true;
		}

		this.sceneStore.scene.add(this.mesh);
	}

	AlignToPlaneY() {
		this.mesh.position.setY(0);
		this.UpdateSize();

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: this.mesh.position.clone().setY(-this.minY.y),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as AppEventMoveObject);

		this.UpdateSize();
	}

	AlignToPlaneXZ(gridVec: Vector3) {
		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: this.mesh.position.clone().setX(gridVec.x / 2).setZ(gridVec.z / 2),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as AppEventMoveObject);

		this.UpdateSize();
	}

	IsEqual3dObject(_mesh: THREE.Mesh) {
		return _mesh === this.mesh;
	}

	Dispose() {
		this.sceneStore.groupSelected.splice(this.sceneStore.objects.findIndex(x => x.name === this.name), 1);
		this.sceneStore.objects.splice(this.sceneStore.objects.findIndex(x => x.name === this.name), 1);
		this.mesh.clear();
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
				sceneObject.Dispose();
			}
		}

		AppStore.sceneStore.transformControls.detach();
		AppStore.sceneStore.animate();
	};

	static DeselectAllObjects = () => {
		if (AppStore.sceneStore.groupSelected.length) {
			for (const sceneObject of AppStore.sceneStore.groupSelected) {
				sceneObject.isSelected = false;
				sceneObject.UpdateSelection();
			}
		}

		AppStore.sceneStore.updateSelectionChanged();
		AppStore.sceneStore.animate();
	};
}
