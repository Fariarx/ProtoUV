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
import { SceneObject } from './Entities/SceneObject';

export class SceneStore {
	public static instance: SceneStore;

	public renderer: WebGLRenderer = new WebGLRenderer({
		antialias: true,
		alpha:true,
	});
	public outlineEffectRenderer: OutlineEffect = new OutlineEffect( this.renderer, {
		defaultThickness:0.001
	});
	public materialForPlaneShadow: Material = new ShadowMaterial({
		color: '#444444',
		side: FrontSide,
	});
	public materialForPlane: Material = new MeshBasicMaterial({
		color: colors.scene.workingPlaneColor,
		side: FrontSide
	});
	public materialForPlaneLimit: Material = new MeshBasicMaterial({
		color: colors.scene.workingPlaneLimitColor,
		side: FrontSide
	});
	public materialForObjects: SceneMaterial = SceneMaterials.default;
	public perspectiveCamera = new PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		0.01,
		1000
	);
	public orthographicCamera = new OrthographicCamera(
		window.innerWidth / - 2,
		window.innerWidth / 2,
		window.innerHeight / 2,
		window.innerHeight / - 2,
		0.01,
		1000,
	);

	public activeCamera: Camera = this.perspectiveCamera;
	public scene: Scene = new Scene();
	public decorations: Group = new Group();
	public objects: SceneObject[] = [];

	constructor() {
	}
}
