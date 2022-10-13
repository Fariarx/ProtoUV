import { runInAction } from 'mobx';
import { AppStore } from '../AppStore';
import { AppEvent, AppEventArguments, AppEventEnum } from './Libs/Types';

export const Dispatch = (name: AppEventEnum, args: typeof AppEventArguments) => {
	const message = {
		name: name,
		args: args ?? undefined
	} as AppEvent;

	for(let index = 0; index < eventListeners.length; index++)
	{
		eventListeners[index](message.name, message.args);
	}

	if(Handler(message)) {
		eventList.push(message);
	}
};

const Handler = (message: any) => {

	switch (message.name) {
		case AppEventEnum.ADD_OBJECT:
			objectAdd(message);
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
		if(eventListeners[index] === listener)
		{
			eventListeners.splice(Number(index), 1);
			index--;
		}
	}
};

const eventList = new Array<AppEvent>();
const eventListeners: ((message: AppEventEnum, args?: object) => void)[] = [];

const objectAdd = (message: AppEvent) => {
	const args = message.args as typeof AppEventArguments;
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
			const path = args.source.split('\\');
			path.pop();
			app.projectFolder = path.join('\\');
		}

		app.fileCount = scene.objects.length;
	});
};
