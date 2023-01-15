import { makeAutoObservable } from 'mobx';
import { AppStore } from 'renderer/AppStore';
import { SupportsEnum } from 'renderer/Shared/Libs/Types';
import { singleton } from 'tsyringe';

@singleton()
export class PerformSupportsStore {
	public constructor() {
		makeAutoObservable(this);
		this._state = SupportsEnum.None;
	}

	private _state: SupportsEnum;

	public get state() {
		return this._state;
	}

	public changeState = (state: SupportsEnum, disableUpdate: boolean) => {
		AppStore.sceneStore.resetAnyTools();

		this._state = state === this._state
			? SupportsEnum.None
			: state;

		if (disableUpdate) {
			AppStore.sceneStore.updateSupportsControls();
		}
	};
}
