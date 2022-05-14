import { Euler, Object3D, Vector3 } from 'three';
import { SceneObject } from '../../Main/Scene/Entities/SceneObject';

export type MoveObject = {
  instrument?: TransformInstrumentEnum;
  from: Vector3 | Euler;
  to: Vector3 | Euler;
  sceneObject: SceneObject | Object3D;
  actionBreak: true | undefined;
  renderBreak: true | undefined;
  id: number | undefined;
};
