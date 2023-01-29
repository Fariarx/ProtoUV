import { runInAction } from 'mobx';
import { clearSupportCreateBuffer } from 'renderer/Main/Components/ToolsRight/Supports/Shared/SupportsGen';
import { Mesh, Vector3 } from 'three';
import { SceneObject } from './../Main/Scene/Entities/SceneObject';
import { config } from './Config';
import { AppEvent, AppEventAddObject, AppEventArguments, AppEventDeleteObject, AppEventEditSupports, AppEventEnum, AppEventMoveObject, TransformEnum } from './Libs/Types';
import { AppStore } from '../AppStore';

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
		case AppEventEnum.DELETE_OBJECT:
			objectDelete(message);
			break;
		case AppEventEnum.TRANSFORM_OBJECT:
			objectTransform(message);
			break;
		case AppEventEnum.EDIT_SUPPORTS:
			editSupports(message);
			break;
	}

	if (message.name !== AppEventEnum.EDIT_SUPPORTS)
	{
		clearSupportCreateBuffer();
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
	args!.object.AlignToPlanePreparedToPrint();
	args!.object.AlignToPlaneY();
  args!.object.AlignByOtherSceneItems();
  scene.updateSelectionChanged();
  scene.updateTransformControls();

  setTimeout(() => {
  	scene.clippingReset();
  	scene.animate();
  });

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

const objectDelete = (message: AppEvent) => {
	const args = message.args as AppEventDeleteObject;

	args.object.Dispose();
};

const objectTransform = (message: AppEvent) => {
	const event = message.args as AppEventMoveObject;
	const mesh: Mesh = event.sceneObject.mesh;

	if (!event.actionBreak) {
		if (!event.instrument) {
			event.instrument = AppStore.transform.state;
		}

		if (event.sceneObject.supports?.length && !event.deletedSupportsDisabled)
		{
			event.deletedSupports = event.sceneObject.supports;
			AppStore.sceneStore.removeSupports(event.sceneObject);
		}

		const minScale = config.scene.sharpness;

		switch (event.instrument) {
			case TransformEnum.Move:
				if (event.to.isDifferent)
				{
					mesh.position.add(event.to as Vector3);
				}
				else {
					mesh.position.set(event.to.x, event.to.y, event.to.z);
				}
				break;
			case TransformEnum.Rotate:
				if (event.to.isDifferent)
				{
					mesh.rotation.setFromVector3(event.to as Vector3);
				}
				else {
					mesh.rotation.set(event.to.x, event.to.y, event.to.z);
				}
				break;
			case TransformEnum.Scale:
				if(event.to.x < minScale)
				{
					event.to.x = minScale;
				}
				if(event.to.y < minScale)
				{
					event.to.y = minScale;
				}
				if(event.to.z < minScale)
				{
					event.to.z = minScale;
				}

				if (event.to.isDifferent)
				{
					mesh.scale.add(event.to as Vector3);
				}
				else {
					mesh.scale.set(event.to.x, event.to.y, event.to.z);
				}
				break;
		}
	}

	console.log('Move');

	if(!event.renderBreak)
	{
		mesh.updateMatrixWorld(true);
		AppStore.sceneStore.clippingReset();
		AppStore.sceneStore.clippingSomeShit();
		AppStore.sceneStore.animate();
	}
};

const editSupports = (message: AppEvent) => {
	const event = message.args as AppEventEditSupports;

	event.oldSupports = event.object.supports;

	AppStore.sceneStore.removeSupports(event.object);

	if (event.supports?.length)
	{
		event.object.supports = event.supports;
		AppStore.sceneStore.scene.add(...event.supports);
	}
	else {
		event.object.supports = undefined;
	}

	event.object.AlignToPlaneY(true);
	AppStore.sceneStore.animate();
};
