import { runInAction } from 'mobx';
import { clearSupportCreateBuffer } from 'renderer/Main/Components/ToolsRight/Supports/Shared/SupportsGen';
import { Mesh, Vector3 } from 'three';
import { Key } from 'ts-keycode-enum';
import { SceneObject } from './../Main/Scene/Entities/SceneObject';
import { config } from './Config';
import { SubscribersKeyPressed, isKeySequencePressed } from './Libs/Keys';
import { AppEvent, AppEventAddObject, AppEventArguments, AppEventDeleteObject, AppEventEditSupports, AppEventEnum, AppEventMoveObject, TransformEnum } from './Libs/Types';
import { AppStore } from '../AppStore';

SubscribersKeyPressed.push(() => {
	if (isKeySequencePressed([Key.Ctrl, Key.Z]))
	{
		RevertLastEvent(false);
	}
});

const isCancelPressed = () => isKeySequencePressed([Key.Ctrl, Key.Shift, Key.Z]);

SubscribersKeyPressed.push(() => {
	if (isCancelPressed())
	{
		RevertLastEvent(true);
	}
});

const RevertLastEvent = (isDoubleReverted: boolean) => {
	const event = (isDoubleReverted ? eventListReverted : eventList).pop();

	if (event) {
		for(let index = 0; index < eventListeners.length; index++)
		{
			eventListeners[index](event.name, event.args);
		}

		if (isDoubleReverted)
		{
			if (Handler(event, undefined, true)) {
				eventList.push(event);
			}
			return;
		}

		if (Handler(event, true)) {
			eventListReverted.push(event);
		}
	}
};

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

		if (!isCancelPressed())
		{
			eventList.push(message);
			eventListReverted = [];
		}
	}
};

const Handler = (message: any, isReversed?: true, isRestored?: true) => {
	AppStore.sceneStore.clippingReset();

	switch (message.name) {
		case AppEventEnum.ADD_OBJECT:
			objectAdd(message, isReversed, isRestored);
			break;
		case AppEventEnum.DELETE_OBJECT:
			objectDelete(message, isReversed);
			break;
		case AppEventEnum.TRANSFORM_OBJECT:
			objectTransform(message, isReversed);
			break;
		case AppEventEnum.EDIT_SUPPORTS:
			editSupports(message, isReversed);
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

let eventListReverted = new Array<AppEvent>();

const objectAdd = (message: AppEvent, isReversed?: true, isRestored?: true) => {
	console.log('Add scene object', isReversed);

	const args = message.args as AppEventAddObject;
	const app = AppStore.instance;
	const scene = AppStore.sceneStore;

	const update = () => {
		setTimeout(() => {
			scene.updateSelectionChanged();
			scene.updateTransformControls();
			scene.clippingReset();
			scene.animate();
		});
	};

	if (isReversed)
	{
    args!.object.Hide();
    update();
    return;
	}

	if (isRestored)
	{
    args!.object.Show();
    update();
    return;
	}

	SceneObject.DeselectAllObjects();
	scene.objects.push(args.object);
	args.object.AddToScene(true);
	args.object.AlignToPlaneXZ(scene.gridSize);
	args.object.AlignToPlanePreparedToPrint();
	args.object.AlignToPlaneY();
	args.object.AlignByOtherSceneItems();

	update();

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

const objectDelete = (message: AppEvent, isReversed?: true) => {
	console.log('Delete scene object', isReversed);

	const args = message.args as AppEventDeleteObject;
	const scene = AppStore.sceneStore;

	const update = () => {
		setTimeout(() => {
			scene.updateSelectionChanged();
			scene.updateTransformControls();
			scene.clippingReset();
			scene.animate();
		});
	};

	if (isReversed)
	{
		args.object.Show();
	}
	else {
		args.object.Hide();
	}

	update();
};

const objectTransform = (message: AppEvent, isReversed?: true) => {
	const event = message.args as AppEventMoveObject;
	const mesh: Mesh = event.sceneObject.mesh;

	if (!event.actionBreak) {

		if (event.sceneObject.supports?.length && !event.supportsDisabled)
		{
			event.supportsBefore = event.sceneObject.supports;
			event.sceneObject.RemoveSupports();
		}

		if (isReversed)
		{
			mesh.position.set(event.meshBefore!.position.x,
        event.meshBefore!.position.y,
        event.meshBefore!.position.z);
			mesh.rotation.set(event.meshBefore!.rotation.x,
        event.meshBefore!.rotation.y,
        event.meshBefore!.rotation.z);
			mesh.scale.set(event.meshBefore!.scale.x,
        event.meshBefore!.scale.y,
        event.meshBefore!.scale.z);
		}
		else
		{
			if (!event.instrument) {
				event.instrument = AppStore.transform.state;
			}

			event.meshBefore =  {
				rotation: mesh.rotation.clone(),
				position: mesh.position.clone(),
				scale: mesh.scale.clone()
			};

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
						if (AppStore.transform.fixedScale)
						{
							const change = (event.to.x - mesh.scale.x) +
                (event.to.y - mesh.scale.y) +
                (event.to.z - mesh.scale.z);

							event.to.set(mesh.scale.x + change,
								mesh.scale.y + change,
								mesh.scale.z + change);
						}

						mesh.scale.set(event.to.x, event.to.y, event.to.z);
					}
					break;
			}
		}
	}

	if(!event.renderBreak)
	{
		mesh.updateMatrixWorld(true);
		AppStore.sceneStore.clippingReset();
		AppStore.sceneStore.clippingSomeShit();
		AppStore.sceneStore.animate();
	}
};

const editSupports = (message: AppEvent, isReversed?: true) => {
	const event = message.args as AppEventEditSupports;

	if (isReversed)
	{
		event.object.RemoveSupports();
		event.object.supports = event.oldSupports;

		if (event.oldSupports?.length)
		{
			AppStore.sceneStore.scene.add(...event.oldSupports);
		}
		else {
			event.object.supports = undefined;
		}

		AppStore.sceneStore.animate();
		return;
	}

	event.oldSupports = event.object.supports;
	event.object.RemoveSupports();

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
