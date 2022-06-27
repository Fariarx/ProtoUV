import { TransformStore } from './Main/Components/TransformStore';
import { ConsoleStore } from './Main/Console/ConsoleStore';
import { SceneStore } from './Main/Scene/SceneStore';

export abstract class AppStore {
	static log = new ConsoleStore();
	static scene = new SceneStore();
	static transform = new TransformStore();
}

export const Log = AppStore.log.Add;
