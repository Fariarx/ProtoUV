import { AppStore } from '../../AppStore';
import { SceneStore } from './SceneStore';

export class SceneInitializer {
	constructor(public props: { scene: SceneStore }) {
		AppStore.log.Add('SceneComponent loaded!');
	}

	public setupCanvas(canvas: HTMLDivElement | null)
	{
		canvas?.appendChild(this.props.scene.renderer.domElement);
		canvas?.appendChild(this.props.scene.stats.domElement);
	}
}
