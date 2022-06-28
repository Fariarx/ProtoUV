import {
	AmbientLight, ArrowHelper,
	DirectionalLight,
	Group, Object3D, OrthographicCamera, PerspectiveCamera, Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Log } from '../../AppStore';
import { Config } from '../../Shared/Config';
import { SubscribersWindowResize } from '../../Shared/Libs/Listerners';
import { SceneBase } from './SceneBase';

export class SceneInitializer extends SceneBase{
	private temp: any = {};

	public constructor() {
		super();

		this.setupWindowResize();
		this.setupLight();
		this.setupAxes();
		this.setupCameraRig();
		this.setupOrbitController();
		this.setupTransformControls();
		this.setupCameraType(true);
		this.updateCameraLookPosition();
		this.updateWindowResize();

		Log('SceneComponents loaded!');
	}

	private setupLight() {
		this.lightGroup = new Group();
		this.lightShadow = new DirectionalLight(0xffffff, 0.2);
		this.lightFromCamera = new DirectionalLight(0xffffff, 0.3);

		this.lightFromCamera.castShadow = false;
		this.lightGroup.attach( this.lightFromCamera );

		const light1 = new AmbientLight( 0xffffff , 0.3); // soft white light
		this.lightGroup.attach( light1 );

		this.lightShadow.position.set( this.gridSize.x / 2, 10, this.gridSize.z / 2 ); //default; light shining from top
		this.lightShadow.castShadow = true; // default false

		const target = new Object3D();

		target.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);

		this.lightShadow.target = target;
		this.lightFromCamera.target = target;

		this.lightGroup.attach(target);

		const value = this.gridSize.x > this.gridSize.z ? this.gridSize.x : this.gridSize.z;

		this.lightShadow.shadowCameraLeft = -value;
		this.lightShadow.shadowCameraRight = value;
		this.lightShadow.shadowCameraTop = value;
		this.lightShadow.shadowCameraBottom = -value;

		this.lightFromCamera.shadowCameraLeft = -value;
		this.lightFromCamera.shadowCameraRight = value;
		this.lightFromCamera.shadowCameraTop = value;
		this.lightFromCamera.shadowCameraBottom = -value;

		this.lightGroup.attach(this.lightShadow);

		this.scene.add(this.lightGroup);
	}

	private setupAxes() {
		const origin = new Vector3();
		const size = 1;

		const axesHelper = new Object3D();
		axesHelper.add(new ArrowHelper(new Vector3(1, 0.01, 0.01), origin, size, '#b80808'));
		axesHelper.add(new ArrowHelper(new Vector3(0.01, 1, 0.01), origin, size, '#09b111'));
		axesHelper.add(new ArrowHelper(new Vector3(0.01, 0.01, 1), origin, size, '#091ab1'));

		this.scene.add(axesHelper);
		this.axes = axesHelper;
	}

	private setupCameraRig() {
		this.cameraRig = new Group();
		this.cameraRig.attach( this.perspectiveCamera );
		this.cameraRig.attach( this.orthographicCamera );
		this.perspectiveCamera.position.set(this.gridSize.x , this.gridSize.y , this.gridSize.z );
		this.orthographicCamera.position.set(this.gridSize.x * 2 , this.gridSize.y * 2 , this.gridSize.z * 2 );
		this.orthographicCamera.zoom = 70;
		this.orthographicCamera.updateProjectionMatrix();
	}

	public setupOrbitController() {
		this.temp.wasChangeLook = false;
		this.orbitControls = new OrbitControls(this.activeCamera, this.renderer.domElement);
		this.orbitControls.enableDamping = true;
		this.orbitControls.update();
		this.orbitControls.addEventListener( 'change', () => {
			this.temp.wasChangeLook = true;
			this.animate();
		});
	}

	public setupTransformControls() {
		this.transformControls = new TransformControls(this.activeCamera, this.renderer.domElement);
	}

	public setupCameraType (isInit = false) {
		if(Config.settings.scene.setStartupPerspectiveCamera)
		{
			this.activeCamera = this.perspectiveCamera;
		}
		else
		{
			this.activeCamera = this.orthographicCamera;
		}

		this.orbitControls.object = this.activeCamera;
		this.orbitControls.target = new Vector3(this.gridSize.x / 3, 0, this.gridSize.z / 3);
		this.orbitControls.update();

		this.transformControls.camera = this.activeCamera;

		this.updateCameraWindowSize();

		if(!isInit)
		{
			this.animate();
		}
	}

	private setupWindowResize() {
		this.temp.windowHeight = window.innerHeight;
		SubscribersWindowResize.push(this.updateWindowResize);
	}

	private updateWindowResize = () => {
		this.updateCameraWindowSize();

		this.activeCamera.lookAt(this.scene.position);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.render(this.scene, this.activeCamera);

		this.orbitControls.update();

		this.animate();
	};

	public updateCameraLookPosition() {
		this.orbitControls.target = new Vector3(this.gridSize.x / 3, 0, this.gridSize.z / 3);
		this.orbitControls.update();
	}

	public updateCameraWindowSize () {
		if(this.activeCamera instanceof PerspectiveCamera) {
			this.activeCamera.aspect = window.innerWidth / window.innerHeight;
			this.activeCamera.fov = (360 / Math.PI) * Math.atan(Math.tan(((Math.PI / 180) * this.perspectiveCamera.fov / 2)) * (window.innerHeight / this.temp.windowHeight));
			this.activeCamera.updateMatrix();
		}
		if(this.activeCamera instanceof OrthographicCamera) {
			this.activeCamera.left = window.innerWidth / -2;
			this.activeCamera.right = window.innerWidth / 2;
			this.activeCamera.top = window.innerHeight / 2;
			this.activeCamera.bottom = window.innerHeight / -2;
			this.activeCamera.updateProjectionMatrix();
		}
	}

	public setupCanvas(canvas: HTMLDivElement | null)
	{
		this.stats.domElement.style.marginTop = '30px';
		this.stats.domElement.style.marginLeft = '4px';
		this.stats.domElement.style.zIndex = '1';

		canvas?.appendChild(this.renderer.domElement);
		canvas?.appendChild(this.stats.domElement);
	}

	public animate () {
		if(this.temp.needAnimateTimer)
		{
			clearTimeout(this.temp.needAnimateTimer);
			this.temp.needAnimateTimer = null;
		}

		if(this.temp.lastFrameTime && Date.now() - this.temp.lastFrameTime < 8)
		{
			this.temp.needAnimateTimer = setTimeout(()=>{
				this.animate();
			}, 8);
			return;
		}
		else {
			this.temp.lastFrameTime = Date.now();
		}

		const _animate = () => {
			this.grid?.mat.resolution.set(window.innerWidth, window.innerHeight);

			this.renderer.clearDepth(); // important!

			this.lightFromCamera.position.set(this.activeCamera.position.x, this.activeCamera.position.y, this.activeCamera.position.z);

			/*if(this.activeCamera.position.y >= 0)
			{
				SceneObject.UpdateSupportRender(this.groupSelected, true);
				SceneObject.UpdateSupportRender(SceneObject.GetUniqueInA(this.objects,this.groupSelected), false);
			}
			else {
				SceneObject.UpdateSupportRender(this.objects, false);
			}*/

			this.renderer.render(this.scene, this.activeCamera);

			if (this.temp.outlineTimer) {
				clearTimeout(this.temp.outlineTimer);
				delete this.temp.outlineTimer;
			}

			this.temp.outlineTimer = setTimeout(() => {
				this.renderer.render(this.scene, this.activeCamera);

				if(this.activeCamera.position.y >= 0)
				{
					this.outlineEffectRenderer.renderOutline(this.scene, this.activeCamera);
				}
			}, 700);

			this.stats.update();

			/*if (this.isTransformWorking) {
				requestAnimationFrame(_animate);
			}*/
		};

		requestAnimationFrame(_animate);
	}
}
