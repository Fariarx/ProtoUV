import { ConsoleStore } from './Main/Console/Console.store';
import { SceneStore } from './Main/Scene/Scene.store';

export abstract class AppStore {
	static scene = new SceneStore();
	static log = new ConsoleStore();
}

export const Log: ConsoleStore = AppStore.log;
export const Scene: SceneStore = AppStore.scene;
