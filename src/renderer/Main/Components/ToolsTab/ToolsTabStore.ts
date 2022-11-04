import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

@singleton()
export class ToolsTabStore {
	public constructor() {
		makeAutoObservable(this);
	}

	public width = 215;
	public resize = false;
}
