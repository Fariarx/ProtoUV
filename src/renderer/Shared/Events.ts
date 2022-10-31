import { runInAction } from 'mobx';
import { Mesh, Vector3 } from 'three';
import { AppStore } from '../AppStore';
import { SceneObject } from './../Main/Scene/Entities/SceneObject';
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

	SceneObject.DeselectAllObjects();
	scene.objects.push(args!.object);
	args!.object.AddToScene(true);
	args!.object.AlignToPlaneXZ(scene.gridSize);
	args!.object.AlignToPlaneY();
  args!.object.AlignToPlanePreparedToPrint();
  scene.updateSelectionChanged();
  scene.updateTransformControls();
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

	if (!moveObject.actionBreak) {
		if (!moveObject.instrument) {
			moveObject.instrument = AppStore.transform.state;
		}

		const minScale = config.scene.sharpness;

		switch (moveObject.instrument) {
			case TransformEnum.Move:
				if (moveObject.to.isDifferent)
				{
					mesh.position.add(moveObject.to as Vector3);
				}
				else {
					mesh.position.set(moveObject.to.x, moveObject.to.y, moveObject.to.z);
				}
				break;
			case TransformEnum.Rotate:
				if (moveObject.to.isDifferent)
				{
					mesh.rotation.setFromVector3(moveObject.to as Vector3);
				}
				else {
					mesh.rotation.set(moveObject.to.x, moveObject.to.y, moveObject.to.z);
				}
				break;
			case TransformEnum.Scale:
				if(moveObject.to.x < minScale)
				{
					moveObject.to.x = minScale;
				}
				if(moveObject.to.y < minScale)
				{
					moveObject.to.y = minScale;
				}
				if(moveObject.to.z < minScale)
				{
					moveObject.to.z = minScale;
				}

				if (moveObject.to.isDifferent)
				{
					mesh.scale.add(moveObject.to as Vector3);
				}
				else {
					mesh.scale.set(moveObject.to.x, moveObject.to.y, moveObject.to.z);
				}
				break;
		}
	}

	if(!moveObject.renderBreak)
	{
		AppStore.sceneStore.animate();
	}
};
