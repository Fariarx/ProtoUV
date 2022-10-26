import { AppEventEnum, AppEventMoveObject, TransformEnum } from 'renderer/Shared/Libs/Types';
import {
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
	wireframe: LineSegments;

	min: Vector3;
	max: Vector3;
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
		sceneStore: SceneStore = AppStore.sceneStore) {
		let index = 0;
		let sceneName = index + ' : ' + name;

		while (SceneObject.GetByName(objs, sceneName) !== null) {
			objs[index].name = sceneName;
			sceneName = ++index + ' : ' + name;
		}

		this.name = sceneName;
		this.sceneStore = sceneStore;
		this.geometry = geometry;

		this.mesh = new Mesh(geometry, sceneStore.materialForObjects.normal);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		this.mesh.scale.set(0.1, 0.1, 0.1);

		const nullVector = new Vector3();

		this.min = nullVector;
		this.max = nullVector;
		this.center = nullVector;

		this.wireframe = this.SetupWireframe(geometry);
		this.wireframe.visible = false;
		this.mesh.add(this.wireframe);

		this.isSelected = this.wasSelected = selected;
		this.SetSelection();

		this.Update(true);
		this.UpdateGeometry(true);
	}

	private SetupWireframe(geometry: BufferGeometry) {
		const wireframe = new WireframeGeometry( geometry );
		const line = new LineSegments( wireframe );
		const lineMaterial = line.material as any;
		lineMaterial.opacity = 0.25;
		lineMaterial.transparent = true;
		lineMaterial.color = '#000';
		line.scale.multiplyScalar( 0.1 );
		return  line;
	}

	SetSelection() {
		if (this.wasSelected !== this.isSelected) {
			this.wasSelected = this.isSelected;
		}

		if (this.isSelected) {
			this.mesh.material = this.sceneStore.materialForObjects.select;
			this.wireframe.visible = this.settings.wireframe;
		} else {
			this.mesh.material = this.sceneStore.materialForObjects.normal;
			this.wireframe.visible = false;
		}

		return {
			now: this.isSelected,
			was: this.wasSelected
		};
	}

	Update(init = false) {
		if (!init) {
			this.SetSelection();
		}

		this.mesh.updateMatrixWorld();
		this.wireframe.matrix = this.mesh.matrix.clone();
		this.wireframe.updateMatrixWorld();

		this.UpdateSize();
	}

	UpdateSize() {
		const geometry = this.mesh.geometry;
		const vertices = geometry.attributes.position.array;

		let minPoint = new Vector3(0, 9999, 0);
		let maxPoint = new Vector3(0, -9999, 0);
		for (let i = 0; i < vertices.length; i=i+3) {
			if (vertices[i+1] < minPoint.y)
			{
				minPoint = new Vector3(vertices[i], vertices[i+1], vertices[i+2]);
			}
			if (vertices[i+1] > maxPoint.y)
			{
				maxPoint = new Vector3(vertices[i], vertices[i+1], vertices[i+2]);
			}
		}

		this.min = this.mesh.localToWorld(minPoint);
		this.max = this.mesh.localToWorld(maxPoint);
		this.center = this.max.clone().sub(this.min).normalize();
	}

	UpdateGeometry(init = false) {
		this.mesh.geometry.applyMatrix4(new Matrix4().makeTranslation(-this.center.x, -this.center.y, -this.center.z));
		this.Update(init);
	}

	AddToScene(withWireframe?: boolean, withBoxHelper?: boolean) {
		if (withBoxHelper) {
			this.settings.bbox = true;
		}
		if (withWireframe) {
			this.wireframe.visible = true;
			this.settings.wireframe = true;
		}

		this.sceneStore.scene.add(this.mesh);
		this.sceneStore.scene.add(this.wireframe);
	}

	AlignToPlaneY() {
		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			different: this.mesh.position.clone().setY(this.size.y / 2),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as AppEventMoveObject);

		this.Update();
	}

	AlignToPlaneXZ(gridVec: Vector3) {
		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			different: this.mesh.position.clone().setX(gridVec.x / 2).setZ(gridVec.z / 2),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as AppEventMoveObject);

		this.Update();
	}

	IsEqual3dObject(_mesh: THREE.Mesh) {
		return _mesh === this.mesh;
	}

	Dispose() {
		this.sceneStore.groupSelected.splice(this.sceneStore.objects.findIndex(x => x.name === this.name), 1);
		this.sceneStore.objects.splice(this.sceneStore.objects.findIndex(x => x.name === this.name), 1);

		this.mesh.clear();
		this.wireframe.clear();
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
		if (AppStore.sceneStore.groupSelected.length ) {
			for (const sceneObject of AppStore.sceneStore.groupSelected) {
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
}
