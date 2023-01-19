import { makeAutoObservable } from 'mobx';
import { AppStore } from 'renderer/AppStore';
import { SupportsEnum } from 'renderer/Shared/Libs/Types';
import { singleton } from 'tsyringe';
import { VoxelizationFreeSpace } from './Shared/SupportsGen';

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
		if (!disableReset) {
			AppStore.sceneStore.resetAnyTools();
		}

		this._state = state === this._state
			? SupportsEnum.None
			: state;

		VoxelizationFreeSpace(AppStore.sceneStore.printer!, AppStore.sceneStore.groupSelectedLast.mesh);

		AppStore.sceneStore.updateSupportsControls();
	};
}
