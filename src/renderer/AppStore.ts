import { makeObservable, observable } from 'mobx';
import { HeaderStore } from './HeaderStore';
import { TransformStore } from './Main/Components/TransformStore';
import { ConsoleStore } from './Main/Console/ConsoleStore';
import { SceneStore } from './Main/Scene/SceneStore';

const consoleStore = new ConsoleStore();
export const Log = consoleStore.Add;

export class AppStore {
	public static console = consoleStore;
	public static scene: SceneStore;
	public static transform = new TransformStore();
	public static inits: (() => void)[] = [];

	public static instance: AppStore;
	public static header: HeaderStore;

	public static load = () => {
		this.scene = new SceneStore();
		this.transform = new TransformStore();
		this.inits.forEach((item) => item());
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
		this.state = Pages.None;

		makeObservable(this, {
			state: observable,
		});
	}

	public state: Pages;
}

setTimeout(AppStore.load, 100);

export enum Pages {
  None,
  Main,
  Configurator,
  ConfiguratorManually
}
