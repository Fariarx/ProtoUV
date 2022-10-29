import { ArrowHelper, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector3 } from 'three';
import { AppStore } from '../../AppStore';

export class ThreeHelper {
	static DrawDirLine(origin: Vector3, dir: Vector3, length  = 100, scene: Scene = AppStore.sceneStore.scene)
	{
		const _dir = dir.clone().normalize();
		const _origin = origin.clone().normalize();

		const hex = 0xf27f00;

		const arrowHelper = new ArrowHelper( _dir, _origin, length, hex );

		scene.add( arrowHelper );
	}

	static DrawPoint(origin: Vector3, color = 0xf27f00, size  = 0.05, deleteAfterMs = 60000, scene: Scene = AppStore.sceneStore.scene)
	{
		const geometry = new SphereGeometry( size, 16, 16 );
		const material = new MeshBasicMaterial( { color: color } );
		const sphere = new Mesh( geometry, material );

		sphere.position.set(origin.x,origin.y,origin.z);

		scene.add(sphere);

		if (deleteAfterMs)
		{
			setTimeout(() => scene.remove(sphere), deleteAfterMs);
		}
	}
}
