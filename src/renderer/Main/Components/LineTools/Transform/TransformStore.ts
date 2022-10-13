import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';
import { TransformEnum } from '../../../../Shared/Libs/Types';

@singleton()
export class TransformStore {
	public state: TransformEnum;

	public constructor() {
		this.state = TransformEnum.None;
		makeAutoObservable(this);
	}
}
