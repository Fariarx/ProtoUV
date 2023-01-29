import {
	makeObservable,
	observable,
	runInAction,
} from 'mobx';
import { toUnits } from 'renderer/Shared/Globals';
import {
	AppEventDeleteObject,
	AppEventEnum,
	AppEventMoveObject,
	TransformEnum,
} from 'renderer/Shared/Libs/Types';
import {
	AlwaysStencilFunc,
	BackSide,
	BufferAttribute,
	BufferGeometry,
	DecrementWrapStencilOp,
	DynamicDrawUsage,
	FrontSide,
	Group,
	IncrementWrapStencilOp,
	LineBasicMaterial,
	LineSegments,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Vector3
} from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { MeshBVH } from 'three-mesh-bvh';

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
	public clippingSnapshot?: Matrix4;

	constructor(geometry: BufferGeometry,
		filePath: string,
		selected = false,
		sceneStore: SceneStore = AppStore.sceneStore)
	{
		geometry = geometry.deleteAttribute('color');

		this.name = (filePath.split('\\').pop()?.split('.').shift() ?? 'undefined');
		this.sceneStore = sceneStore;
		this.geometry = geometry;
		this.geometry.scale(0.1, 0.1, 0.1);
		this.mesh = new Mesh(geometry, sceneStore.materialForObjects.select);
		this.mesh.renderOrder = 3;

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

	static CreateClippingGroup = () => {
		const store = AppStore.sceneStore;

		const _create = (geometry: BufferGeometry) => {
			const frontSideModel = new Mesh(geometry);
			frontSideModel.updateMatrixWorld( true );
			const surfaceModel = frontSideModel.clone();
			surfaceModel.material = AppStore.sceneStore.materialForObjects.select.clone();
			surfaceModel.material .transparent = true;
			surfaceModel.material .opacity = 0;
			surfaceModel.renderOrder = 1;

			const lineGeometry = new BufferGeometry();
			const linePosAttr = new BufferAttribute( new Float32Array( 300000 ), 3, false );
			linePosAttr.setUsage( DynamicDrawUsage );
			lineGeometry.setAttribute( 'position', linePosAttr );
			const clippingLineMin = new  LineSegments( lineGeometry, new LineBasicMaterial() );
			clippingLineMin.material.color.set( AppStore.sceneStore.clippingLineColor ).convertSRGBToLinear();
			clippingLineMin.frustumCulled = false;
			clippingLineMin.renderOrder = 3;

			clippingLineMin.scale.copy( frontSideModel.scale );
			clippingLineMin.position.set( 0, 0, 0 );
			clippingLineMin.quaternion.identity();

			const matSet = new Set();
			const materialMap = new Map();
			frontSideModel.traverse((c: Mesh | any) => {
				if ( materialMap.has( c.material ) ) {
					c.material = materialMap.get( c.material );
					return;
				}

				matSet.add( c.material );

				const material = c.material.clone();
				material.roughness = 1.0;
				material.metalness = 0.1;
				material.side = FrontSide;
				material.stencilWrite = true;
				material.stencilFail =  DecrementWrapStencilOp;
				material.stencilZFail = DecrementWrapStencilOp;
				material.stencilZPass =  DecrementWrapStencilOp;
				material.depthWrite = false;
				material.depthTest = false;
				material.colorWrite = false;
				material.stencilWrite = true;
				material.stencilFunc = AlwaysStencilFunc;
				material.clippingPlanes = [AppStore.sceneStore.clippingPlaneMin];

				materialMap.set( c.material, material );
				c.material = material;
			});

			materialMap.clear();

			const backSideModel = frontSideModel.clone();
			backSideModel.traverse((c: Mesh | any) => {
				if (c.isMesh) {
					if ( materialMap.has( c.material ) ) {
						c.material = materialMap.get( c.material );
						return;
					}

					const material = c.material.clone();
					material.side =  BackSide;
					material.stencilFail = IncrementWrapStencilOp;
					material.stencilZFail = IncrementWrapStencilOp;
					material.stencilZPass = IncrementWrapStencilOp;
					material.depthWrite = false;
					material.depthTest = false;
					material.colorWrite = false;
					material.stencilWrite = true;
					material.clippingPlanes = [AppStore.sceneStore.clippingPlaneMin];

					materialMap.set( c.material, material );
					c.material = material;
				}
			});

			const colliderBvh = new MeshBVH( frontSideModel.geometry, { maxLeafTris: 3 } );
			frontSideModel.geometry.boundsTree = colliderBvh;

			const colliderMesh = new Mesh( frontSideModel.geometry,  new MeshBasicMaterial( {
				wireframe: true,
				transparent: true,
				opacity: 0.01,
				depthWrite: false,
			}));
			colliderMesh.renderOrder = 2;
			colliderMesh.position.copy( frontSideModel.position );
			colliderMesh.rotation.copy( frontSideModel.rotation );
			colliderMesh.scale.copy( frontSideModel.scale );

			const group = new Group();

			group.add(frontSideModel,
				backSideModel,
				surfaceModel,
				colliderMesh,
				clippingLineMin);

			group.children[3].visible = false;
			group.children[2].visible = false;

			return {
				group: group,
				colliderMesh : colliderMesh,
				outlineLines:clippingLineMin,
				colliderBvh :colliderBvh
			};
		};

		if (store.clippingBuffer.sceneGeometryCount !== store.objects.length
      || store.objects.some(x => !x.clippingSnapshot || !x.clippingSnapshot.equals(x.mesh.matrixWorld))
      || store.objects.length !== 0 && store.clippingBuffer.sceneGeometryGrouped === null)
		{
			store.clippingBuffer.sceneGeometryCount = store.objects.length;

			store.objects.forEach(x => {
				x.clippingSnapshot = x.mesh.matrixWorld.clone();
			});

			const created = _create(mergeBufferGeometries(store.objects
				.map(o => o.mesh.geometry.clone().applyMatrix4(o.mesh.matrixWorld))));

			if(store.clippingBuffer?.sceneGeometryGrouped)
			{
				store.scene.remove(store.clippingBuffer.sceneGeometryGrouped);
			}

			AppStore.sceneStore.scene.add(created.group);

			const result = {
				sceneGeometryGrouped: created.group,

				intersectionMesh: {
					colliderMesh : created.colliderMesh,
					outlineLines: created.outlineLines,
					colliderBvh : created.colliderBvh
				},
			};

			AppStore.sceneStore.clippingBuffer = {
				...AppStore.sceneStore.clippingBuffer,
				...result
			};
		}
	};

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
		this.mesh.updateMatrixWorld(true);

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
		const fromCenter = new Vector3(
			(gridVec.x / 2) - this.center.x,
			this.mesh.position.y,
			(gridVec.z / 2) - this.center.z);

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: this.mesh.position.clone(),
			to: fromCenter,
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
		this.UpdateSize();
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
			const mesh = element;

			if (index === 0) {
				delta = mesh.center.clone();
			} else {
				delta.x = (delta.x + mesh.center.x) / 2;
				delta.y = (delta.y +  mesh.center.y) / 2;
				delta.z = (delta.z +  mesh.center.z) / 2;
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
