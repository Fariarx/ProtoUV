import { makeAutoObservable } from 'mobx';
import { TransformEnum } from '../../../../Shared/Libs/Types';

export class TransformStore {
	public state: TransformEnum;

	private static instance: TransformStore;

	public static getInstance(): TransformStore {
		if (!TransformStore.instance)
		{
			TransformStore.instance = new TransformStore();
		}

		return TransformStore.instance;
	}

	private constructor() {
		this.state = TransformEnum.None;
		makeAutoObservable(this);
	}
}
