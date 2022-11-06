import { Euler, Vector3 } from 'three';
import { SceneObject } from '../../Main/Scene/Entities/SceneObject';

export enum AppEventEnum {
  SELECT_TRANSFORM_MODE,
  SELECT_MENU_STEP,
  ADD_OBJECT,
  DELETE_OBJECT,
  SELECTION_CHANGED,
  TRANSFORM_OBJECT,
  SELECT_SUPPORTS_MODE
}

export declare const AppEventArguments:
  AppEventAddObject
  | AppEventMoveObject
  | AppEventSelectionChanged
  | AppEventDeleteObject
  | undefined;

export type AppEvent = {
  name: AppEventEnum;
  args: typeof AppEventArguments;
};

export type AppEventSelectionChanged = {
  uuid: string;
  state: {
    now:boolean;
    was: boolean;
  };
};

export type AppEventMoveObject = {
  instrument?: TransformEnum;
  from: Vector3 | Euler;
  to: (Vector3 | Euler) & { isDifferent?: boolean };
  sceneObject: SceneObject;
  actionBreak: true | undefined;
  renderBreak: true | undefined;
  id: number | undefined;
};

export type AppEventAddObject = {
  object: SceneObject;
  source: string | undefined;
};

export type AppEventDeleteObject = {
  object: SceneObject;
};

export enum TransformEnum {
  None = 'none',
  Move = 'translate',
  Rotate = 'rotate',
  Scale = 'scale'
}
