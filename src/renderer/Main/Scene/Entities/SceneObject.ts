import { Box3, BoxHelper, BufferGeometry, Matrix4, Mesh, Vector3 } from 'three';
import { AppEventEnum } from '../../../Shared/Enum/AppEventEnum';
import { TransformEnum } from '../../../Shared/Enum/TransformEnum';
import { Dispatch } from '../../../Shared/Events';
import { MoveObject } from '../../../Shared/Scene/MoveObject';
import { SceneStore } from '../SceneStore';

export class SceneObject {
	name: string;
	mesh: Mesh;
	bbox: BoxHelper;
	min: Vector3;
	max: Vector3;
	center: Vector3;
	size: Vector3 = new Vector3();
	sceneStore: SceneStore;
	scaleFactor: number;
	isSelected: boolean;

	private _wasSelected: boolean;

	constructor(geometry: BufferGeometry,
		name: string,
		objs: SceneObject[],
		sceneStore: SceneStore,
		selected = false)
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
		this.bbox = new BoxHelper(this.mesh, 0xffff00);

		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		this.mesh.scale.set(0.1, 0.1, 0.1);

		const nullVector = new Vector3();

		this.min = nullVector;
		this.max = nullVector;
		this.center = nullVector;

		this.Update();
		this.UpdateGeometryCenter();

		this.isSelected = selected;
		this._wasSelected = selected;
		this.SetSelection();

		this.scaleFactor = (0.1 / this.size.x + 0.1 / this.size.y + 0.1 / this.size.z) / 3;
	}

	SetSelection() {
		let wasSelectedChanged: undefined | boolean;

		if (this._wasSelected !== this.isSelected) {
			wasSelectedChanged = this._wasSelected;
			this._wasSelected = this.isSelected;
		}

		if (this.isSelected) {
			this.mesh.material = this.sceneStore.materialForObjects.select;
		} else {
			this.mesh.material = this.sceneStore.materialForObjects.normal;
		}

		return {
			now: this.isSelected,
			was: wasSelectedChanged
		};
	}

	Update() {
		this.SetSelection();

		this.UpdateSize();

		this.mesh.updateMatrixWorld();
		this.bbox.update();

		this.mesh.geometry.computeBoundsTree();
		this.mesh.geometry.computeBoundingBox();
		this.mesh.geometry.computeBoundingSphere();

		this.min = (this.mesh.geometry.boundingBox as Box3).min;
		this.max = (this.mesh.geometry.boundingBox as Box3).max;
		this.center = (this.mesh.geometry.boundingSphere as THREE.Sphere).center;
	}

	UpdateSize() {
		new Box3().setFromObject(this.mesh).getSize(this.size);
	}

	UpdateGeometryCenter() {
		this.mesh.geometry.applyMatrix4(new Matrix4().makeTranslation(-this.center.x, -this.center.y, -this.center.z));
		this.Update();
	}

	AddToScene(scene: THREE.Scene, withBoxHelper?: boolean) {
		if (withBoxHelper) {
			scene.add(this.bbox);
		}

		scene.add(this.mesh);
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
