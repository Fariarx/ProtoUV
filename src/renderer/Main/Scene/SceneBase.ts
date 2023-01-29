import {
	computed,
	observable,
} from 'mobx';
import * as THREE from 'three';
import {
	BackSide,
	DirectionalLight,
	DoubleSide,
	FrontSide,
	Group,
	LineSegments,
	Material,
	MeshLambertMaterial,
	MeshStandardMaterial,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	Plane,
	Scene,
	ShaderMaterial,
	ShadowMaterial,
	Vector3,
	WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
	TransformControls,
} from 'three/examples/jsm/controls/TransformControls';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
import Stats from 'three/examples/jsm/libs/stats.module';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { NotEqualDepth } from 'three/src/constants';

import { SceneObject } from './Entities/SceneObject';
import {
	colors,
	config,
} from '../../Shared/Config';
import { toNormalizedRGBArray } from '../../Shared/Libs/Tools';
import { Printer } from '../Printer/Configs/Printer';

export abstract class SceneBase {
	public renderer: WebGLRenderer = new WebGLRenderer({
		antialias: true,
		alpha:true
	});
	public stencilRenderer: WebGLRenderer = new WebGLRenderer({
		// warn! this enabled setting give some ghost pixels
		antialias: false,
		alpha:false,
		depth: false
	});
	public sliceOrthographicCamera = new OrthographicCamera(
		window.innerWidth / - 2,
		window.innerWidth / 2,
		window.innerHeight / 2,
		window.innerHeight / - 2,
		0.0001,
	);
	public outlineEffectRenderer: OutlineEffect = new OutlineEffect( this.renderer, {
		defaultThickness:0.0015
	});
	public materialForSupports = {
		normal: new MeshLambertMaterial({ transparent: true, opacity: 0.6, color: '#5bc3fc' }),
		preview: new MeshLambertMaterial({ transparent: true, opacity: 0.3, color: '#80ffaa' })
	};

	public materialLine = new LineMaterial({
		color: 0xa1a1a1,
		linewidth: 1.5
	});

  @observable
	public clippingScenePercent = 0;
  @observable
  public clippingSceneWorking = false;
  public clippingSceneDirectionDown = true;

  public clippingPlaneMin = new Plane();
  public clippingInnerColor = '#388816';
  public clippingLineColor = '#41ff00';
  public clippingPlaneMeshMin = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial ({
  	color: this.clippingInnerColor,  side: BackSide,
  	transparent: true,
  	stencilWrite: true,
  	depthTest: true,
  	depthWrite: true,
  	depthFunc: NotEqualDepth,
  	reflectivity: 0,
  	stencilRef: 0,
  	stencilFunc: THREE.NotEqualStencilFunc,
  	stencilFail: THREE.ReplaceStencilOp,
  	stencilZFail: THREE.ReplaceStencilOp,
  	stencilZPass: THREE.ReplaceStencilOp,
  }));

  public materialsForScene = {
  	default: {
  		normal: new MeshLambertMaterial( {  color: '#ffa600', side: DoubleSide,
  			 metalness: 0.1,
  			clippingPlanes: [this.clippingPlaneMin]
  		} ),
  		select: new MeshLambertMaterial( { color: '#98de9c', side: DoubleSide,
  			 metalness: 0.1,
  			clippingPlanes: [this.clippingPlaneMin]
  		} ),
  	} as MaterialForScene,
  };

  public materialForPlaneShadow: Material = new ShadowMaterial({
  	color: '#444444',
  	side: FrontSide,
  });
  public materialForPlane?: Material;
  public materialForObjects: MaterialForScene = this.materialsForScene.default;
  public perspectiveCamera = new PerspectiveCamera(
  	60,
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
  );
  public activeCamera: OrthographicCamera | PerspectiveCamera = this.perspectiveCamera;

  public stats = Stats();

  public printerName: string = config.printerName;
  public printer?: Printer;

  public scene: Scene = new Scene();

	@observable
  public groupSelected: SceneObject[] = [];

  @computed
	public get groupSelectedLast () {
		return this.groupSelected[this.groupSelected.length - 1];
	}

  public decorations: Group = new Group();
  public transformObjectGroup: Object3D = new Object3D();
  public transformGroupMarker: Object3D = new Object3D();

	@observable
  public objects: SceneObject[] = [];

	public grid!: SceneGrid;
	public gridSize: Vector3 = new Vector3(1, 1, 1);

	public lightGroup!: Group;
	public lightShadow!: DirectionalLight;
	public lightFromCamera!: DirectionalLight;
	public orbitControls!: OrbitControls;
	public transformControls!: TransformControls;
	public transformControlsUpdate!: () => void;
	public transformControlsDragging!: (event: { value: boolean } | any) => void;
	public orientationHelperPerspective: any;
	public orientationHelperOrthographic: any;

	public cameraRig!: Group;
	public axes!: Object3D;

	public static CreatePlaneMaterial = (paddingX: number, paddingY: number) => {
		return new ShaderMaterial({
			uniforms: {
				//eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				u_color: { type: 'v3', value: new Vector3(...toNormalizedRGBArray(colors.scene.workingPlaneColor)) },
				//eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				u_color_limit: { type: 'v3', value: new Vector3(...toNormalizedRGBArray(colors.scene.workingPlaneLimitColor)) },
				//eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				u_padding_x: { type: 'f', value: paddingX },
				//eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				u_padding_y: { type: 'f', value: paddingY }
			},
			vertexShader: `varying vec2 vUv;

		void main() {
				vUv = uv;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
			fragmentShader: `varying vec2 vUv;
		uniform vec3 u_color;
		uniform vec3 u_color_limit;
		uniform float u_padding_x;
		uniform float u_padding_y;

		void main() {
				if (vUv.x < u_padding_x || vUv.y < u_padding_y || vUv.x > 1. - u_padding_x || vUv.y > 1. - u_padding_y) {
						gl_FragColor = vec4(u_color_limit, 1.0);
				} else {
						gl_FragColor = vec4(u_color, 1.0);
				}
		}`
		});
	};
}

export type SceneGrid = {
	obj: any;
	mat: LineMaterial;
	dispose: Function;
};

export type MaterialForScene = {
	normal: Material;
	select: Material;
};
