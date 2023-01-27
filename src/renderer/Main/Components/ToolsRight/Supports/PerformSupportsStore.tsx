import _ from 'lodash';
import { makeAutoObservable } from 'mobx';
import { AppStore, Log } from 'renderer/AppStore';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { Dispatch } from 'renderer/Shared/Events';
import { toUnits } from 'renderer/Shared/Globals';
import { AppEventEditSupports, AppEventEnum, SupportsEnum } from 'renderer/Shared/Libs/Types';
import { Mesh, Raycaster, SphereGeometry, Vector3 } from 'three';
import { singleton } from 'tsyringe';
import { SupportSingleGenerator } from './Shared/SupportsGen';

@singleton()
export class PerformSupportsStore {
	public constructor() {
		this._state = SupportsEnum.None;
		makeAutoObservable(this);
	}

	private _state: SupportsEnum;

	public get state() {
		return this._state;
	}

	public changeState = (state: SupportsEnum, disableReset?: boolean) => {
		const isReset = state === this._state;

		if (!disableReset) {
			AppStore.sceneStore.resetAnyTools();
		}

		this._state = isReset
			? SupportsEnum.None
			: state;

		if (AppStore.sceneStore.groupSelectedLast)
		{
			if (state === SupportsEnum.Add)
			{
				if (! AppStore.sceneStore.groupSelectedLast.supports)
				{
					AppStore.sceneStore.groupSelectedLast.supports = [];
					AppStore.sceneStore.groupSelectedLast.AlignToPlaneY();
				}
			}
			else {
				if (AppStore.sceneStore.groupSelectedLast.supports
          && AppStore.sceneStore.groupSelectedLast.supports.length === 0)
				{
					AppStore.sceneStore.groupSelectedLast.supports = undefined;
					AppStore.sceneStore.groupSelectedLast.AlignToPlaneY();
				}
			}
		}

		if (state !== SupportsEnum.Add)
		{
			this.addCursor.visible = false;
			if (this.preview)
			{
				AppStore.sceneStore.scene.remove(this.preview);
				this.preview = undefined;
			}
		}

		AppStore.sceneStore.orbitControls.enableRotate = this._state !== SupportsEnum.Remove;
		AppStore.sceneStore.updateSupportsControls();
	};

	private raycaster = new Raycaster();
	private vectorMouse = new Vector3();
	private addCursor = new Mesh();
	private target?: SceneObject;
	private preview?: Mesh;
	private isInited = false;

	public addCursorToScene = () => {
		if (!this.isInited)
		{
			this.addCursor.geometry = new SphereGeometry(toUnits(AppStore.sceneStore.printer!.SupportPreset.Body));
			this.addCursor.material = AppStore.sceneStore.materialForSupports.preview;
			this.addCursor.visible = false;
			AppStore.sceneStore.scene.add(this.addCursor);
			this.isInited = true;
		}
	};

	public MouseMoveToRemove = (event: MouseEvent, isPressed: boolean) => {
		if (isPressed) {
			this.vectorMouse.set((event.clientX / window.innerWidth) * 2 - 1,
				- (event.clientY / window.innerHeight) * 2 + 1,
				0.5);

			this.raycaster.setFromCamera(this.vectorMouse, AppStore.sceneStore.activeCamera);

			const intersects = this.raycaster.intersectObjects(SceneObject.GetSupportMeshesFromObjs(AppStore.sceneStore.groupSelected), false);
			const objs = AppStore.sceneStore.groupSelected.map(x => ({
				sceneObj: x,
				supports: [] as Mesh[]
			}));

			for (const intersect of intersects) {
				let isBreak = false;

				for (const obj of objs)
				{
					if (!obj.sceneObj.supports)
					{
						continue;
					}

					for (const mesh of obj.sceneObj.supports)
					{
						if (mesh.uuid === intersect.object.uuid)
						{

							obj.supports.push(mesh);
							isBreak = true;
							break;
						}
					}

					if (isBreak) {
						break;
					}
				}
			}

			objs.forEach(obj => {
				if (obj.sceneObj.supports && obj.supports.length > 0) {
					Dispatch(AppEventEnum.EDIT_SUPPORTS, {
						object: obj.sceneObj,
						supports: obj.sceneObj.supports.filter(x =>
							!obj.supports.some(y => x.uuid === y.uuid))
					});
				}
			});
		}
	};

	public MouseMoveToAdd = (event?: MouseEvent, randomize?: boolean) => {
		if (event) {
			this.vectorMouse.set((event.clientX / window.innerWidth) * 2 - 1,
				- (event.clientY / window.innerHeight) * 2 + 1,
				0.5);
		}

		this.raycaster.setFromCamera(this.vectorMouse, AppStore.sceneStore.activeCamera);

		const meshes = SceneObject.GetMeshesFromObjs(AppStore.sceneStore.groupSelected);
		const intersects = this.raycaster.intersectObjects(meshes, false);
		const intersect = _.minBy(intersects.filter(x => x.face), x=> x.distance);

		if (this.preview)
		{
			AppStore.sceneStore.scene.remove(this.preview);
			AppStore.sceneStore.animate();
			this.preview = undefined;
		}

		if (intersect) {
			const objIndex = SceneObject.SearchIndexByMesh(AppStore.sceneStore.groupSelected, intersect.object as Mesh);
			if(objIndex === -1)
			{
				this.addCursor.visible = false;
				AppStore.sceneStore.animate();
				return;
			}

			this.addCursor.position.set(intersect.point.x, intersect.point.y, intersect.point.z);
			this.addCursor.visible = true;

			this.target = AppStore.sceneStore.groupSelected[objIndex];

			const supports = SupportSingleGenerator(AppStore.sceneStore.printer!,
				this.target.mesh, meshes, intersect.face!.normal, intersect.point, randomize);

			if (!supports.length) {
				//Log('generation result is empty');
			}
			else {
				this.preview = supports.shift();

				if (this.preview)
				{
					this.preview.material = AppStore.sceneStore.materialForSupports.preview;
					this.preview.children.forEach((child: any) =>
						child.material = AppStore.sceneStore.materialForSupports.preview);
					AppStore.sceneStore.scene.add(this.preview);
				}
			}
		}
		else {
			this.addCursor.visible = false;
		}

		AppStore.sceneStore.animate();
	};

	public MouseClickToAdd = () => {
		if (this.preview)
		{
			this.preview.material = AppStore.sceneStore.materialForSupports.normal;
			this.preview.children.forEach((child: any) =>
				child.material = AppStore.sceneStore.materialForSupports.normal);
			Dispatch(AppEventEnum.EDIT_SUPPORTS, {
				object: this.target,
				supports: this.target?.supports
					? [...this.target.supports, this.preview]
					: [this.preview]
			} as AppEventEditSupports);
			this.preview = undefined;
		}
	};
}
