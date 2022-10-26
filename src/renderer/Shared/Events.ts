import { runInAction } from 'mobx';
import { BufferGeometry, LineSegments, Mesh, Vector3 } from 'three';
import { AppStore } from '../AppStore';
import { config } from './Config';
import { AppEvent, AppEventAddObject, AppEventArguments, AppEventEnum, AppEventMoveObject, TransformEnum } from './Libs/Types';

export const Dispatch = (name: AppEventEnum, args: typeof AppEventArguments) => {
	const message = {
		name: name,
		args: args ?? undefined
	} as AppEvent;

	for(let index = 0; index < eventListeners.length; index++)
	{
		eventListeners[index](message.name, message.args);
	}

	if (Handler(message)) {
		eventList.push(message);
	}
};

const Handler = (message: any) => {
	switch (message.name) {
		case AppEventEnum.ADD_OBJECT:
			objectAdd(message);
			break;
		case AppEventEnum.TRANSFORM_OBJECT:
			objectTransform(message);
			break;
	}

	return true;
};

export const AddListener = (listener: (message: AppEventEnum, args?: object) => void) => {
	eventListeners.push(listener);
	return listener;
};

export const DeleteListener = (listener: object) => {
	for(let index = 0; index < eventListeners.length; index++)
	{
		if (eventListeners[index] === listener)
		{
			eventListeners.splice(Number(index), 1);
			index--;
		}
	}
};

const eventList = new Array<AppEvent>();
const eventListeners: ((message: AppEventEnum, args?: object) => void)[] = [];

const objectAdd = (message: AppEvent) => {
	const args = message.args as AppEventAddObject;
	const app = AppStore.instance;
	const scene = AppStore.sceneStore;

	scene.objects.push(args!.object);
	args!.object.AlignToPlaneXZ(scene.gridSize);
	args!.object.AlignToPlaneY();
	args!.object.AddToScene(true);
	scene.animate();

	runInAction(() => {
		if (args?.source && !app.projectFolder)
		{
			const path = (args.source as string).split('\\');
			path.pop();
			app.projectFolder = path.join('\\');
		}

		app.fileCount = scene.objects.length;
	});
};

const objectTransform = (message: AppEvent) => {
	const moveObject = message.args as AppEventMoveObject;
	const mesh: Mesh = moveObject.sceneObject.mesh;

	moveObject.different = moveObject.different.clone();
	moveObject.from = moveObject.from.clone();

	if (!moveObject.actionBreak) {
		if (!moveObject.instrument) {
			moveObject.instrument = AppStore.transform.state;
		}

		const minScale = config.scene.sharpness;

		switch (moveObject.instrument) {
			case TransformEnum.Move:
				mesh.position.add(moveObject.different as Vector3);
				break;
			case TransformEnum.Rotate:
				mesh.rotation.setFromVector3(moveObject.different as Vector3);
				break;
			case TransformEnum.Scale:
				if(moveObject.different.x < minScale)
				{
					moveObject.different.x = minScale;
				}
				if(moveObject.different.y < minScale)
				{
					moveObject.different.y = minScale;
				}
				if(moveObject.different.z < minScale)
				{
					moveObject.different.z = minScale;
				}

				mesh.scale.add(moveObject.different as Vector3);
				break;
		}
	}

	if(!moveObject.renderBreak)
	{
		AppStore.sceneStore.animate();
	}
};
