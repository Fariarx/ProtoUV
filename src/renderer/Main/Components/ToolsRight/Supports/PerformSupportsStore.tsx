import { makeAutoObservable } from 'mobx';
import { AppStore } from 'renderer/AppStore';
import { SupportsEnum } from 'renderer/Shared/Libs/Types';
import { singleton } from 'tsyringe';
import { SupportsGenerator } from './Shared/SupportsGen';
import { VoxelizationFreeSpace } from './Shared/SupportsVoxelization';

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

		AppStore.sceneStore.updateSupportsControls();
	};
}
