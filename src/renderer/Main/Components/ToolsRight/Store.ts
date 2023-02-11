import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';
import { config } from '../../../Shared/Config';

@singleton()
export class ToolsRightStore {
	public constructor() {
		makeAutoObservable(this);
	}

	public width = config.ui.sizes.toolsTab;
	public resize = false;
}
