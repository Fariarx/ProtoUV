import { Log } from 'renderer/AppStore';
import { SceneObject } from 'renderer/Main/Scene/Entities/SceneObject';
import { Vector3 } from 'three';
import { config } from '../../../Shared/Config';
import { Dispatch } from '../../../Shared/Events';
import { AppEventEnum, AppEventMoveObject } from '../../../Shared/Libs/Types';

export const scaleToMetric = (number: number, element: SceneObject, change: (vector: Vector3, to: number) => Vector3) => {
	element.UpdateSize();

	let size = element.size.x;
	let count = 500;

	while (size < number)
	{
		element.UpdateSize();
		size = element.size.x;

		const diff = Math.abs(number - size);
		const sharpness = .1 * diff + config.scene.sharpness;

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: element.mesh.scale.clone(),
			to: change(element.mesh.scale.clone(), sharpness),
			sceneObject: element
		} as AppEventMoveObject);

		count--;

		if (count <= 0)
		{
			Log('there was a problem with scaling');
			break;
		}
	}
	while (size > number)
	{
		element.UpdateSize();
		size = element.size.x;

		const diff = Math.abs(number - size);
		const sharpness = .1 * diff + config.scene.sharpness;

		Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
			from: element.mesh.scale.clone(),
			to: change(element.mesh.scale.clone(), -sharpness),
			sceneObject: element
		} as AppEventMoveObject);

		count--;

		if (count <= 0)
		{
			Log('there was a problem with scaling');
			break;
		}
	}
};
