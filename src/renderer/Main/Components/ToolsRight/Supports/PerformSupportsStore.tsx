import { makeAutoObservable } from 'mobx';
import { AppStore } from 'renderer/AppStore';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { Dispatch } from 'renderer/Shared/Events';
import { AppEventEnum, SupportsEnum } from 'renderer/Shared/Libs/Types';
import { Mesh, Raycaster, Vector3 } from 'three';
import { singleton } from 'tsyringe';

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

		AppStore.sceneStore.orbitControls.enableRotate = this._state !== SupportsEnum.Remove;
		AppStore.sceneStore.updateSupportsControls();
	};

	private raycaster = new Raycaster();
	private vectorMouse = new Vector3();

	public MouseMove = (event: MouseEvent, isPressed: boolean) => {
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
}
