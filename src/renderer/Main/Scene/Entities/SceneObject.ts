import { AppEventEnum, TransformEnum } from 'renderer/Shared/Libs/Types';
import {
	Box3,
	BoxHelper,
	BufferGeometry,
	Group,
	LineSegments,
	Matrix4,
	Mesh,
	Vector3,
	WireframeGeometry
} from 'three';
import { AppStore } from '../../../AppStore';
import { Dispatch } from '../../../Shared/Events';
import { MoveObject } from '../../../Shared/Scene/MoveObject';
import { SceneStore } from '../SceneStore';

export class SceneObject {
	name: string;

	obj: Group;
	mesh: Mesh;
	bbox: BoxHelper;
	wireframe: LineSegments;

	min: Vector3;
	max: Vector3;
	center: Vector3;
	size: Vector3 = new Vector3();
	sceneStore: SceneStore;
	scaleFactor: number;
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

		this.mesh = new Mesh(geometry, sceneStore.materialForObjects.normal);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		this.mesh.scale.set(0.1, 0.1, 0.1);

		const nullVector = new Vector3();

		this.min = nullVector;
		this.max = nullVector;
		this.center = nullVector;

		this.Update(true);
		this.UpdateGeometryCenter(true);

		this.wireframe = this.SetupWireframe(geometry);
		this.wireframe.visible = false;

		this.bbox = new BoxHelper(this.mesh, 0xffff00);
		this.bbox.visible = false;

		this.obj = new Group();
		this.obj.add(this.mesh);
		this.obj.add(this.bbox);
		this.obj.add(this.wireframe);

		this.isSelected = this.wasSelected = selected;
		this.SetSelection();

		this.scaleFactor = (0.1 / this.size.x + 0.1 / this.size.y + 0.1 / this.size.z) / 3;
	}

	private SetupWireframe(geometry: BufferGeometry) {
		const wireframe = new WireframeGeometry( geometry );
		const line = new LineSegments( wireframe );
		const lineMaterial = line.material as any;
		lineMaterial.opacity = 0.25;
		lineMaterial.transparent = true;
		lineMaterial.color = '#000';
		// lineMaterial.depthTest = false;
		line.scale.multiplyScalar( 0.1 );
		return  line;
	}

	SetSelection() {
		let wasSelectedChanged: undefined | boolean;

		if (this.wasSelected !== this.isSelected) {
			wasSelectedChanged = this.wasSelected;
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
			was: wasSelectedChanged
		};
	}

	Update(init = false) {
		if (!init) {
			this.SetSelection();
			this.wireframe.updateMatrixWorld();
			this.bbox.update();
		}

		this.UpdateSize();

		this.mesh.updateMatrixWorld();

		// this.mesh.geometry.computeBoundsTree();
		this.mesh.geometry.computeBoundingBox();
		this.mesh.geometry.computeBoundingSphere();

		this.min = (this.mesh.geometry.boundingBox as Box3).min;
		this.max = (this.mesh.geometry.boundingBox as Box3).max;
		this.center = (this.mesh.geometry.boundingSphere as THREE.Sphere).center;
	}

	UpdateSize() {
		new Box3().setFromObject(this.mesh).getSize(this.size);
	}

	UpdateGeometryCenter(init = false) {
		this.mesh.geometry.applyMatrix4(new Matrix4().makeTranslation(-this.center.x, -this.center.y, -this.center.z));
		this.Update(init);
	}

	AddToScene(withWireframe?: boolean, withBoxHelper?: boolean) {
		if (withBoxHelper) {
			this.bbox.visible = true;
			this.settings.bbox = true;
		}
		if (withWireframe) {
			this.wireframe.visible = true;
			this.settings.wireframe = true;
		}

		this.sceneStore.scene.add(this.obj);
	}

	AlignToPlaneY() {
		this.Update();

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: this.mesh.position.clone().setY(this.size.y / 2),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as MoveObject);
	}

	AlignToPlaneXZ(gridVec: Vector3) {
		this.Update();

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: this.mesh.position.clone().setX(gridVec.x / 2).setZ(gridVec.z / 2),
			sceneObject: this as SceneObject,
			instrument: TransformEnum.Move
		} as MoveObject);
	}

	IsEqual3dObject(_mesh: THREE.Mesh) {
		return _mesh === this.mesh;
	}

	static SearchIndexByMesh(objs: SceneObject[], _mesh: THREE.Mesh) {
		let _index = -1;

		objs.every(function (element, index) {
			if (element.mesh === _mesh) {
				_index = index;
				return false;
			}

			return true;
		});

		return _index;
	}

	static SearchSceneObjByMesh(objs: SceneObject[], _mesh: THREE.Mesh) : SceneObject | null {
		const result = this.SearchIndexByMesh(objs, _mesh);

		if(result > -1)
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
			if(b.indexOf(element) === -1)
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
}
