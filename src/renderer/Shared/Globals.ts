import * as THREE from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

export const bridge = window.electron.ipcRenderer.window;

export const AppName = 'protouv';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const MaxNumber = 999999999999999;
export const MinNumber = -999999999999999;

export const toUnits = (mm: number) => mm / 10;
export const toMM = (units: number) => units * 10;
