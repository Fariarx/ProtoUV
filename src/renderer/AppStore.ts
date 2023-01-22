import 'reflect-metadata';
import { makeAutoObservable } from 'mobx';
import { container, singleton } from 'tsyringe';
import { HeaderStore } from './HeaderStore';
import { TransformStore } from './Main/Components/ToolsLeft/Transform/TransformStore';
import { PerformSupportsStore } from './Main/Components/ToolsRight/Supports/PerformSupportsStore';
import { ConsoleStore } from './Main/Console/ConsoleStore';
import { SceneStore } from './Main/Scene/SceneStore';

export const Log = container.resolve(ConsoleStore).Add;

@singleton()
export class AppStore {
	public static console = container.resolve(ConsoleStore);
	public static sceneStore = container.resolve(SceneStore);
	public static transform = container.resolve(TransformStore);
	public static performSupports = container.resolve(PerformSupportsStore);
	public static header = container.resolve(HeaderStore);

	public static get instance() {
		return container.resolve(AppStore);
	}

	public constructor() {
		makeAutoObservable(this);
		this.ready = true;
	}

	public static isState = (state: Pages) => {
		return AppStore.getState() === state;
	};

	public static getState() {
		return AppStore.instance.state;
	}

	public static changeState(state: Pages) {
		AppStore.sceneStore.updatePrinter();
		AppStore.instance.state = state;
	}

	protected state = Pages.Main;

	public ready = false;
	public dropFile = false;
	public fileCount = 0;
	public projectFolder?: string;
}

export enum Pages {
	None,
	Main,
	Configurator,
	ConfiguratorManually,
  ConfiguratorSupports
}
