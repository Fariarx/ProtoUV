import { Euler, Object3D, Vector3 } from 'three';
import { SceneObject } from '../../Main/Scene/Entities/SceneObject';
import { TransformEnum } from '../Enum/TransformEnum';

export type MoveObject = {
  instrument?: TransformEnum;
  from: Vector3 | Euler;
  to: Vector3 | Euler;
  sceneObject: SceneObject | Object3D;
  actionBreak: true | undefined;
  renderBreak: true | undefined;
  id: number | undefined;
};
