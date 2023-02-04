import { Euler, Matrix4, Mesh, Vector3 } from 'three';
import { SceneObject } from '../../Main/Scene/Entities/SceneObject';

export enum AppEventEnum {
  SELECT_TRANSFORM_MODE,
  SELECT_MENU_STEP,
  ADD_OBJECT,
  DELETE_OBJECT,
  SELECTION_CHANGED,
  TRANSFORM_OBJECT,
  SELECT_SUPPORTS_MODE,
  EDIT_SUPPORTS
}

export declare const AppEventArguments:
  AppEventAddObject
  | AppEventMoveObject
  | AppEventSelectionChanged
  | AppEventDeleteObject
  | AppEventEditSupports
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
  meshBefore: {
    rotation: Euler;
    position: Vector3;
    scale: Vector3;
  } | undefined;
  supportsBefore: Mesh[] | undefined;
  supportsDisabled: true | undefined;
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

export enum SupportsEnum {
  None = 'none',
  Add = 'add',
  Remove = 'remove',
}

export type AppEventEditSupports = {
  object: SceneObject;
  supports: Mesh[] | undefined;
  oldSupports: Mesh[] | undefined;
};
