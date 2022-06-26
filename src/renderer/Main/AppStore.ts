import { TransformStore } from './Components/TransformStore';
import { ConsoleStore } from './Console/ConsoleStore';
import { SceneStore } from './Scene/SceneStore';

export abstract class AppStore {
	static log = new ConsoleStore();
	static scene = new SceneStore();
	static transform = new TransformStore();
}

export const Log = AppStore.log.Add;
