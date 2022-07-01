import { BufferGeometry, DoubleSide, Material, Mesh, MeshLambertMaterial, MeshPhongMaterial } from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export const bridge = window.electron.ipcRenderer.window;

export const AppName = 'protouv';

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

export const materialForSupports = {
	normal: new MeshLambertMaterial({ transparent: true, opacity: 0.6, color: '#5bc3fc' }),
	preview: new MeshLambertMaterial({ transparent: true, opacity: 0.2, color: '#80caff' })
};

export const materialLine = new LineMaterial({
	color: 0xa1a1a1,
	linewidth: 3
});

export type MaterialForScene = {
  normal: Material;
  select: Material;
};

export const materialsForScene = {
	default: {
		normal: new MeshPhongMaterial( { color: '#f8a745', emissive:'#ffd4d4',
			emissiveIntensity: 0.2 , flatShading: true, side: DoubleSide, shininess: 20, opacity: 0.7, transparent: true } ),
		select: new MeshPhongMaterial( { color: '#858dff', emissive:'#ffd4d4',
			emissiveIntensity: 0.2 , flatShading: true, side: DoubleSide, shininess: 20 } ),
	} as MaterialForScene,
};
