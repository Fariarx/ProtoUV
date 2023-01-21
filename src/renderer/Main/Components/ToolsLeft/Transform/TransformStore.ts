import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';
import { AppStore } from '../../../../AppStore';
import { TransformEnum } from '../../../../Shared/Libs/Types';

@singleton()
export class TransformStore {
	private _state: TransformEnum;

	public anchorElement: (EventTarget & HTMLElement) | null = null;

	public get state() {
		return this._state;
	}

	public changeState = (state: TransformEnum, disableReset?: boolean) => {
		const isReset = state === this._state;

		if (!disableReset)
		{
			AppStore.sceneStore.resetAnyTools();
		}

		AppStore.transform._state = isReset
			? TransformEnum.None
			: state;

		AppStore.sceneStore.updateTransformControls();
	};

	public constructor() {
		this._state = TransformEnum.None;
		makeAutoObservable(this);
	}
}
