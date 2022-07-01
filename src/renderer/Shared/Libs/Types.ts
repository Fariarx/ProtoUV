import { SceneObject } from '../../Main/Scene/Entities/SceneObject';

export enum AppEventEnum {
  SELECT_TRANSFORM_MODE,
  SELECT_MENU_STEP,
  ADD_OBJECT,
  SELECTION_CHANGED,
  TRANSFORM_OBJECT,
  SELECT_SUPPORTS_MODE
}

export declare const AppEventArguments: AppEventAddObject | undefined;

export type AppEvent = {
  name: AppEventEnum;
  args: typeof AppEventArguments;
  last: any;
};

export type AppEventAddObject = {
  object: SceneObject;
  source: string | undefined;
};

export enum TransformEnum {
  None = 'none',
  Move = 'translate',
  Rotate = 'rotate',
  Scale = 'scale'
}
