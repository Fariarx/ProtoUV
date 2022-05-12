import {
	FrontSide,
	Group,
	Material,
	MeshBasicMaterial,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	ShadowMaterial,
	WebGLRenderer
} from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
import { Camera } from 'three/src/cameras/Camera';
import { colors } from '../../Shared/Colors';
import { SceneMaterial, SceneMaterials } from '../../Shared/Globals';
import { SceneObject } from './SceneObject';

export class Store {
	public static instance: Store;

	renderer: WebGLRenderer = new WebGLRenderer({
		antialias: true,
		alpha:true,
	});
	outlineEffectRenderer: OutlineEffect = new OutlineEffect( this.renderer, {
		defaultThickness:0.001
	});
	materialForPlaneShadow: Material = new ShadowMaterial({
		color: '#444444',
		side: FrontSide,
	});
	materialForPlane: Material = new MeshBasicMaterial({
		color: colors.scene.workingPlaneColor,
		side: FrontSide
	});
	materialForPlaneLimit: Material = new MeshBasicMaterial({
		color: colors.scene.workingPlaneLimitColor,
		side: FrontSide
	});
	materialForObjects: SceneMaterial = SceneMaterials.default;
	perspectiveCamera = new PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		0.01,
		1000
	);
	orthographicCamera = new OrthographicCamera(
		window.innerWidth / - 2,
		window.innerWidth / 2,
		window.innerHeight / 2,
		window.innerHeight / - 2,
		0.01,
		1000,
	);

	activeCamera: Camera = this.perspectiveCamera;
	scene: Scene = new Scene();
	decorations: Group = new Group();
	objects: SceneObject[] = [];

	constructor() {
	}
}
