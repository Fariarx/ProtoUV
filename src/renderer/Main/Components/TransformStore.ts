import { makeAutoObservable } from 'mobx';
import { TransformEnum } from '../../Shared/Libs/Types';

export class TransformStore {
	public state: TransformEnum;

	public constructor() {
		this.state = TransformEnum.None;
		makeAutoObservable(this);
	}
}
