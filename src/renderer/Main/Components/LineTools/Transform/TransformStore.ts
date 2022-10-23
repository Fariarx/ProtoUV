import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';
import { AppStore } from '../../../../AppStore';
import { TransformEnum } from '../../../../Shared/Libs/Types';

@singleton()
export class TransformStore {
	private _state: TransformEnum;

	public get state() {
		return this._state;
	}

	public changeState = (state: TransformEnum) => {
		AppStore.transform._state = state === AppStore.transform._state
			? TransformEnum.None
			: state;
		AppStore.sceneStore.updateTransformControls();
	};

	public constructor() {
		this._state = TransformEnum.None;
		makeAutoObservable(this);
	}
}
