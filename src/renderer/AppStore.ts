import { makeAutoObservable } from 'mobx';
import { HeaderStore } from './HeaderStore';
import { TransformStore } from './Main/Components/TransformStore';
import { ConsoleStore } from './Main/Console/ConsoleStore';
import { SceneStore } from './Main/Scene/SceneStore';

const consoleStore = new ConsoleStore();
export const Log = consoleStore.Add;

export class AppStore {
	public static console = consoleStore;
	public static sceneStore: SceneStore;
	public static transform: TransformStore;
	public static inits: (() => void)[] = [];

	private static instance: AppStore;
	public static header: HeaderStore;

	public static load = () => {
		this.sceneStore = SceneStore.getInstance();
		this.transform = TransformStore.getInstance();
		this.inits.forEach((item) => item());
		this.instance.ready = true;
	};
	public static setState = (state: Pages) => {
		AppStore.getInstance().setState(state);
	};
	public static isState = (state: Pages) => {
		return AppStore.getInstance().getState() === state;
	};

	public static getInstance(): AppStore {
		if (!AppStore.instance)
		{
			AppStore.instance = new AppStore();
		}

		return AppStore.instance;
	}

	private constructor() {
		AppStore.instance = this;
		makeAutoObservable(this);
	}

	private _state = Pages.Main;

	public getState() {
		return this._state;
	}
	public setState(state: Pages) {
		this._state = state;
	}

	public ready = false;
	public dropFile = false;
	public fileCount = 0;
	public projectFolder?: string;
}

setTimeout(AppStore.load, 50);

export enum Pages {
  None,
  Main,
  Configurator,
  ConfiguratorManually
}
