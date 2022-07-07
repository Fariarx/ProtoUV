import {
	DirectionalLight,
	FrontSide, Group,
	Material,
	MeshBasicMaterial, Object3D,
	OrthographicCamera,
	PerspectiveCamera, Scene,
	ShadowMaterial, Vector3,
	WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
import Stats from 'three/examples/jsm/libs/stats.module';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { config } from '../../Shared/Config';
import { MaterialForScene, materialsForScene } from '../../Shared/Globals';
import { colors } from '../../Shared/Theme';
import { Printer } from '../Printer/Configs/Printer';
import { SceneObject } from './Entities/SceneObject';

export abstract class SceneBase {
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
	public materialForObjects: MaterialForScene = materialsForScene.default;
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
		0.0001,
		1000,
	);
	public activeCamera: OrthographicCamera | PerspectiveCamera = this.perspectiveCamera;

	public stats = Stats();

	public printerName: string = config.printerName;
	public printer?: Printer;

	public scene: Scene = new Scene();
	public objects: SceneObject[] = [];
	public decorations: Group = new Group();

	public grid!: SceneGrid;
	public gridSize: Vector3 = new Vector3(1, 1, 1);

	public lightGroup!: Group;
	public lightShadow!: DirectionalLight;
	public lightFromCamera!: DirectionalLight;
	public orbitControls!: OrbitControls;
	public transformControls!: TransformControls;

	public cameraRig!: Group;
	public axes!: Object3D;
}

export type SceneGrid = {
  obj: any;
  mat: LineMaterial;
  dispose: Function;
};
