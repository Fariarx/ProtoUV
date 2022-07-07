import { runInAction } from 'mobx';
import {
	AmbientLight, ArrowHelper, BufferGeometry,
	DirectionalLight,
	Group, Object3D, OrthographicCamera, PerspectiveCamera, Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { AppStore, Log } from '../../AppStore';
import { config } from '../../Shared/Config';
import { Dispatch } from '../../Shared/Events';
import { SubscribersWindowResize } from '../../Shared/Libs/Listerners';
import { AppEventEnum } from '../../Shared/Libs/Types';
import { SceneObject } from './Entities/SceneObject';
import { SceneBase } from './SceneBase';

export class SceneInitializer extends SceneBase {
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
		this.updateWindowResize();
		this.setupDropFile();

		Log('SceneComponents loaded!');
	}

	private setupWindowResize() {
		this.temp.windowHeight = window.innerHeight;
		SubscribersWindowResize.push(this.updateWindowResize);
	}

	private updateWindowResize = () => {
		this.updateCameraWindowSize();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.orbitControls.update();
		this.animate();
	};

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
		this.orthographicCamera.position.set(this.gridSize.x * 15, this.gridSize.y * 15, this.gridSize.z * 15);
		this.orthographicCamera.zoom = 40;
		this.activeCamera.lookAt(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orthographicCamera.updateProjectionMatrix();
	}

	private setupDropFile = () => {
		const holder = this.renderer.domElement;

		holder.ondragover = function() {
			runInAction(() => {
				AppStore.getInstance().dropFile = true;
			});
			return false;
		};

		holder.ondragleave = function() {
			runInAction(() => {
				AppStore.getInstance().dropFile = false;
			});
			return false;
		};

		holder.ondrop = function(e) {
			runInAction(() => {
				AppStore.getInstance().dropFile = false;
			});

			if(e.dataTransfer)
			{
				Log('Drop ' + e.dataTransfer.files.length + ' file(s) event');
				Array.from(e.dataTransfer.files).forEach(file =>
					AppStore.sceneStore.handleLoadFile(file.path));
			}
			else {
				Log('DataTransfer is null, skip drag and drop' );
			}
		};
	};

	private file3dLoad = (file: File | string, handler: Function): boolean => {
		const extension: string = (()=>{
			let array;

			if(typeof file === 'string')
			{
				array = file;
			}
			else
			{
				array = file.name;
			}

			array = array.split('.');

			return (array[array.length - 1] as string).toLocaleLowerCase();
		})();

		const url = (typeof file === 'string' ? file : file.path);

		switch (extension) {
			case 'stl':
				new STLLoader().load(url, ( geometry ) => {
					handler(geometry, url);
				});
				return true;
			default:
				return false;
		}
	};

	public handleLoadFile = (file: string) => {
		const result = AppStore.sceneStore.file3dLoad(file, function (geometry: BufferGeometry, path: string) {
			Dispatch(AppEventEnum.ADD_OBJECT, {
				source: path,
				object: new SceneObject(geometry, file, AppStore.sceneStore.objects, true)
			});
		});

		if(result)
		{
			Log('File load ' + file.split('\\').pop());
		}
		else {
			Log('Error file format ' + file.split('\\').pop());
		}
	};

	public onZoom(evt?:  React.WheelEvent<HTMLDivElement>) {
		const zoom = 5;

		if (evt?.deltaY && evt.deltaY > 0)
		{
			if (this.activeCamera instanceof OrthographicCamera)
			{
				this.orbitControls.enableZoom = false;
				this.orthographicCamera.zoom -= (this.orthographicCamera.zoom / 100) * zoom;
				this.orthographicCamera.updateProjectionMatrix();
				this.animate();
			}
			else if (!this.orbitControls.enableZoom)
			{
				this.orbitControls.enableZoom = true;
			}
		}

		if (evt?.deltaY && evt.deltaY < 0)
		{
			if (this.activeCamera instanceof OrthographicCamera)
			{
				this.orbitControls.enableZoom = false;
				this.orthographicCamera.zoom += (this.orthographicCamera.zoom / 100) * zoom;
				this.orthographicCamera.updateProjectionMatrix();
				this.animate();
			}
			else if (!this.orbitControls.enableZoom)
			{
				this.orbitControls.enableZoom = true;
			}
		}
	}

	public setupOrbitController() {
		this.temp.wasChangeLook = false;
		this.orbitControls = new OrbitControls(this.activeCamera, this.renderer.domElement);
		this.orbitControls.enableDamping = true;
		this.orbitControls.rotateSpeed = 0.5;
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
		if(config.scene.setStartupPerspectiveCamera)
		{
			this.activeCamera = this.perspectiveCamera;
		}
		else
		{
			this.activeCamera = this.orthographicCamera;
		}

		this.orbitControls.object = this.activeCamera;
		this.orbitControls.target.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orbitControls.update();

		this.transformControls.camera = this.activeCamera;

		this.updateCameraWindowSize();

		if(!isInit)
		{
			this.animate();
		}
	}

	public updateCameraLookPosition() {
		this.activeCamera.lookAt(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orthographicCamera.updateProjectionMatrix();
		this.orbitControls.target.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
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

	public setupCanvas(canvas: HTMLDivElement | null) {
		this.stats.domElement.style.marginTop = '80%';
		this.stats.domElement.style.marginLeft = '8px';
		this.stats.domElement.style.opacity = '0.3';
		this.stats.domElement.style.zIndex = '1';

		canvas?.appendChild(this.renderer.domElement);
		canvas?.appendChild(this.stats.domElement);
	}

	public animate () {
		const frameLag = () => {
			if(this.temp.needAnimateTimer)
			{
				clearTimeout(this.temp.needAnimateTimer);
				this.temp.needAnimateTimer = null;
			}

			if(this.temp.lastFrameTime && Date.now() - this.temp.lastFrameTime < 5)
			{
				this.temp.needAnimateTimer = setTimeout(() => {
					this.animate();
				});
				return true;
			}
			else {
				this.temp.lastFrameTime = Date.now();
				return false;
			}
		};

		const _animate = () => {
			this.renderer.clearDepth(); // important!

			if (this.grid)
			{
				this.grid.mat.resolution.set(window.innerWidth, window.innerHeight);
			}

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
				/*if (this.grid)
        {
          this.grid.obj.visible = true;
          this.grid.mat.resolution.set(window.innerWidth, window.innerHeight);
        }*/

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

		if (frameLag())
		{
			return;
		}

		requestAnimationFrame(_animate);
	}
}
