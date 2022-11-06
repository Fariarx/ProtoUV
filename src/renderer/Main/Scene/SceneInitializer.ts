import { Transform } from '@mui/icons-material';
import { runInAction } from 'mobx';
import { WheelEvent } from 'React';
import {
	AmbientLight, ArrowHelper, BufferGeometry,
	DirectionalLight,
	Group, MathUtils, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Key } from 'ts-keycode-enum';
import { container } from 'tsyringe';
import { AppStore, Log } from '../../AppStore';
import { APP_HEADER_HEIGHT } from '../../HeaderApp';
import { config, saveConfig } from '../../Shared/Config';
import { Dispatch } from '../../Shared/Events';
import { EnumHelpers } from '../../Shared/Helpers/Enum';
import * as OrientationHelper from '../../Shared/Helpers/OrientationHelper';
import { SubscribersKeyPressed, isKeyPressed } from '../../Shared/Libs/Keys';
import { SubscribersDoubleMouseClick, SubscribersMouseDown, SubscribersMouseUp, SubscribersWindowResize } from '../../Shared/Libs/Listerners';
import { AppEventEnum, AppEventMoveObject, AppEventSelectionChanged, TransformEnum } from '../../Shared/Libs/Types';
import { ToolsTabStore } from '../Components/ToolsTab/ToolsTabStore';
import { SceneObject } from './Entities/SceneObject';
import { SceneBase } from './SceneBase';

export class SceneInitializer extends SceneBase {
	private temp: any = {};

	public constructor() {
		super();

		this.renderer.localClippingEnabled = false;

		this.setupWindowResize();
		this.setupLight();
		this.setupCameraRig();
		this.setupOrbitController();
		this.setupTransformControls();
		this.updateCameraType(config.scene.setStartupPerspectiveCamera, true);
		this.updateWindowResize();
		this.setupDropFile();
		this.setupMouse();
		this.setupKeyboard();

		Log('SceneComponents loaded!');
	}

	private file3dLoad = (file: File | string, handler: Function): boolean => {
		const extension: string = (()=>{
			let array;

			if (typeof file === 'string')
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
	private updateWindowResize = () => {
		this.updateCameraWindowSize();
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		const target = this.orbitControls.target.clone();
		this.orbitControls.dispose();
		this.setupOrbitController();
		this.orbitControls.target.copy(target);
		this.orbitControls.update();

		this.updateCameraWindowSize();
		this.temp.windowResizeAt = Date.now();
	};
	private setupWindowResize = () => {
		this.temp.windowHeight = window.innerHeight;
		SubscribersWindowResize.push(this.updateWindowResize);
	};
	private setupLight = () => {
		this.lightGroup = new Group();
		this.lightShadow = new DirectionalLight(0xffffff, 0.25);
		this.lightFromCamera = new DirectionalLight('#ecd7ff', 0.5);
		this.lightFromCamera.castShadow = false;
		this.lightGroup.attach( this.lightFromCamera );

		const light1 = new AmbientLight( 0xffffff , 0.3); // soft white light
		this.lightGroup.attach( light1 );
		this.lightShadow.position.set( this.gridSize.x / 2, 10, this.gridSize.z / 2 ); //default; light shining from top
		this.lightShadow.castShadow = true; // default false

		const target = new Object3D();

		target.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);

		this.lightFromCamera.target = target;

		this.lightGroup.attach(target);
		this.lightGroup.attach(this.lightShadow);

		this.scene.add(this.lightGroup);
	};
	private setupAxes = () => {
		const origin = new Vector3();
		const size = 2;

		const axesHelper = new Object3D();
		axesHelper.add(new ArrowHelper(new Vector3(1, 0, 0), origin, size, '#b80808'));
		axesHelper.add(new ArrowHelper(new Vector3(0, 1, 0), origin, size, '#09b111'));
		axesHelper.add(new ArrowHelper(new Vector3(0, 0, 1), origin, size, '#091ab1'));
		axesHelper.position.set(0.05,0.05,0.05);

		this.scene.add(axesHelper);
		this.axes = axesHelper;
	};
	private setupCameraRig = () => {
		this.cameraRig = new Group();
		this.cameraRig.attach( this.perspectiveCamera );
		this.cameraRig.attach( this.orthographicCamera );
		this.perspectiveCamera.position.set(this.gridSize.x , this.gridSize.y , this.gridSize.z );
		this.perspectiveCamera.lookAt(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orthographicCamera.position.set(this.gridSize.x * 10, this.gridSize.y * 30, this.gridSize.z * 10);
		this.orthographicCamera.lookAt(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orthographicCamera.zoom = 40;
		this.orthographicCamera.updateProjectionMatrix();
	};
	private setupDropFile = () => {
		const holder = this.renderer.domElement;

		holder.ondragover = function() {
			AppStore.instance.dropFile = true;
			return false;
		};

		holder.ondragleave = function() {
			AppStore.instance.dropFile = false;
			return false;
		};

		holder.ondrop = function(e) {
			runInAction(() => {
				AppStore.instance.dropFile = false;
			});

			if (e.dataTransfer)
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

	public setupOrbitController = () => {
		this.temp.wasChangeLook = false;
		this.orbitControls = new OrbitControls(this.activeCamera, this.renderer.domElement);
		this.orbitControls.object = this.activeCamera;
		this.orbitControls.enableDamping = true;
		this.orbitControls.update();
		this.orbitControls.addEventListener( 'change', () => {
			this.temp.wasChangeLook = true;
			this.animate();
		});
	};
	public setupTransformControls = () => {
		this.transformControls = new TransformControls(this.activeCamera, this.renderer.domElement);
		this.transformControls.setSize(0.8);
		this.transformControls.setSpace('world');
		this.transformControls.setTranslationSnap( 0.25 );
		this.transformControls.setRotationSnap(MathUtils.degToRad( 15 ) );
		this.transformControls.setScaleSnap( 0.0001 );
		this.scene.add(this.transformControls);
		this.scene.add(this.transformObjectGroup);
		this.scene.add(this.transformGroupMarker);

		this.transformControls.addEventListener( 'dragging-changed', function ( event ) {
			AppStore.sceneStore.orbitControls.enabled = !event.value;

			if (event.value) {
				AppStore.sceneStore.transformGroupMarker.position.set(
					AppStore.sceneStore.transformObjectGroup.position.x,
					AppStore.sceneStore.transformObjectGroup.position.y,
					AppStore.sceneStore.transformObjectGroup.position.z);
				AppStore.sceneStore.transformGroupMarker.rotation.set(
					AppStore.sceneStore.transformObjectGroup.rotation.x,
					AppStore.sceneStore.transformObjectGroup.rotation.y,
					AppStore.sceneStore.transformObjectGroup.rotation.z);
				AppStore.sceneStore.transformGroupMarker.scale.set(
					AppStore.sceneStore.transformObjectGroup.scale.x,
					AppStore.sceneStore.transformObjectGroup.scale.y,
					AppStore.sceneStore.transformObjectGroup.scale.z);
			}
			else {
				SceneObject.SelectObjsAlignY();
			}

			AppStore.sceneStore.animate();
		});
		this.transformControls.addEventListener( 'change', () => {
			const transformObj = this.transformObjectGroup;
			const transformMarker = this.transformGroupMarker;

			if (transformObj !== null && this.groupSelected.length) {
				let now, old;

				switch (AppStore.transform.state) {
					case TransformEnum.Move:
						now = transformObj.position;
						old = transformMarker.position;

						if (!now.equals(old)) {
							const differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

							transformObj.position.set(now.x, now.y, now.z);
							transformMarker.position.set(now.x, now.y, now.z);

							for (const sceneObject of this.groupSelected) {
								const oldPosition = sceneObject.mesh.position.clone();
								const newPosition = sceneObject.mesh.position.clone();

								newPosition.x -= differenceVector3.x;
								newPosition.y -= differenceVector3.y;
								newPosition.z -= differenceVector3.z;

								Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
									from: oldPosition,
									to: newPosition,
									sceneObject: sceneObject
								} as AppEventMoveObject);
							}
						}
						break;
					case TransformEnum.Rotate:
						now = transformObj.rotation;
						old = transformMarker.rotation;

						if (!now.equals(old)) {
							const differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

							transformObj.rotation.set(now.x, now.y, now.z);
							transformMarker.rotation.set(now.x, now.y, now.z);

							for (const sceneObject of this.groupSelected) {
								const oldPosition = sceneObject.mesh.rotation.clone();
								const newPosition = sceneObject.mesh.rotation.clone();

								newPosition.x -= differenceVector3.x;
								newPosition.y -= differenceVector3.y;
								newPosition.z -= differenceVector3.z;

								Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
									from: oldPosition,
									to: newPosition,
									sceneObject: sceneObject
								} as AppEventMoveObject);
							}
						}
						break;
					case TransformEnum.Scale:
						now = transformObj.scale;
						old = transformMarker.scale;

						if (!now.equals(old)) {
							const differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

							transformObj.scale.set(now.x, now.y, now.z);
							transformMarker.scale.set(now.x, now.y, now.z);

							for (const sceneObject of this.groupSelected) {
								const oldPosition = sceneObject.mesh.scale.clone();
								const newPosition = sceneObject.mesh.scale.clone();

								newPosition.x -= differenceVector3.x;
								newPosition.y -= differenceVector3.y;
								newPosition.z -= differenceVector3.z;

								Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
									from: oldPosition,
									to: newPosition,
									sceneObject: sceneObject
								} as AppEventMoveObject);
							}
						}
						break;
				}
			} else {
				Log('Error of \'change\': transformObj is null or this.sceneStore.groupSelected.length = 0');
			}
		});
	};
	public setupCanvas = (canvas: HTMLDivElement | null) => {
		this.stats.domElement.style.marginTop = '400px';
		this.stats.domElement.style.marginLeft = '8px';
		this.stats.domElement.style.opacity = '0.3';
		this.stats.domElement.style.zIndex = '1';
		this.setupOrientationHelper(canvas);
		canvas?.appendChild(this.renderer.domElement);
		canvas?.appendChild(this.stats.domElement);
	};
	public setupOrientationHelper = (canvas: HTMLDivElement | null) => {
		const ohOptions = {
			className: 'orientation-helper-in-scene'
		};
		const ohLabels = {
			px: 'Front',
			nx: 'Right',
			pz: 'Left',
			nz: 'Back',
			py: 'Top',
			ny: 'Bottom'
		};
		const translateCamera = (direction: Vector3) => {
			this.orbitControls.enabled = false;
			const dist = this.activeCamera.position.distanceTo( this.orbitControls.target),
				newCameraPos = this.orbitControls.target.clone().add( direction.multiplyScalar( dist ) );
			this.activeCamera.position.set(newCameraPos.x, newCameraPos.y, newCameraPos.z);
			this.orbitControls.enabled = true;
			this.animate();
			this.activeCamera.rotation.set(0, 0, 0);
		};

		this.orientationHelperPerspective = new OrientationHelper.OrientationHelper(this.perspectiveCamera, this.orbitControls, ohOptions, ohLabels) as any;
		this.orientationHelperPerspective.addEventListener( 'click', (e : { normal: Vector3 }) => translateCamera(e.normal));
		canvas?.appendChild(this.orientationHelperPerspective.domElement);

		this.orientationHelperOrthographic = new OrientationHelper.OrientationHelper(this.orthographicCamera, this.orbitControls, ohOptions, ohLabels) as any;
		this.orientationHelperOrthographic.addEventListener( 'click', (e : { normal: Vector3 }) => translateCamera(e.normal));
		canvas?.appendChild(this.orientationHelperOrthographic.domElement);

		this.orientationHelperPerspective.domElement.style.position = 'absolute';
		this.orientationHelperOrthographic.domElement.style.position = 'absolute';
		this.orientationHelperPerspective.domElement.style.right = '0px';
		this.orientationHelperOrthographic.domElement.style.right = '0px';
		this.orientationHelperPerspective.domElement.style.top = (0 + APP_HEADER_HEIGHT) + 'px';
		this.orientationHelperOrthographic.domElement.style.top = (0 + APP_HEADER_HEIGHT) + 'px';

		this.updateOrientationHelper();
	};
	public setupKeyboard = () => {
		SubscribersKeyPressed.push(k => {
			if (k === Key.Delete)
			{
				SceneObject.SelectObjsDelete();
			}
		});
	};
	public setupMouse = () => {
		const vectorMouseRaycaster = new Vector3();
		const vectorMouseUp = new Vector3();
		const vectorMouseDown = new Vector3();

		let clickTime: number | null = null;

		SubscribersMouseDown.push((e) => {
			clickTime = Date.now();
			vectorMouseDown.set(
				(e.clientX / window.innerWidth) * window.innerWidth,
				(e.clientY / window.innerHeight) * window.innerHeight, 0);
		});

		SubscribersMouseUp.push(e => {
			const clickTimeMillis = clickTime === null ? 0 : Date.now() - clickTime;

			vectorMouseUp.set(
				(e.clientX / window.innerWidth) * window.innerWidth,
				(e.clientY / window.innerHeight) * window.innerHeight, 0);

			if (e.button !== 0 || !this.printer || clickTimeMillis > 250
        || Math.abs(vectorMouseDown.x - vectorMouseUp.x) > 15
        || Math.abs(vectorMouseDown.y - vectorMouseUp.y) > 15) {
				return;
			}

			vectorMouseRaycaster.set((e.clientX / window.innerWidth) * 2 - 1,
				- ((e.clientY - APP_HEADER_HEIGHT) / window.innerHeight) * 2 + 1,
				0.5);

			const raycaster = new Raycaster();

			raycaster.setFromCamera(vectorMouseRaycaster, AppStore.sceneStore.activeCamera);

			const intersects = raycaster.intersectObjects(SceneObject.GetMeshesFromObjs(AppStore.sceneStore.objects), false);

			intersects.sort((a, b) => {
				return a.distance < b.distance ? -1 : 1;
			});

			if(intersects.length && intersects[0].face )
			{
				const sceneObjIndex = SceneObject.SearchIndexByMesh(AppStore.sceneStore.objects, intersects[0].object as Mesh);
				if (sceneObjIndex < 0)
				{
					return;
				}

				const sceneObj  = AppStore.sceneStore.objects[sceneObjIndex];

				if (!isKeyPressed(Key.Ctrl) && !isKeyPressed(Key.Shift)) {
					if (!sceneObj.isSelected) {
						AppStore.sceneStore.objects.forEach((t, i) => {
							if (i === sceneObjIndex) {
								return;
							}
							t.isSelected = false;
						});

						sceneObj.isSelected = !sceneObj.isSelected;

					} else if (AppStore.sceneStore.groupSelected.length > 1) {
						AppStore.sceneStore.objects.forEach(t => {
							t.isSelected = false;
						});

						sceneObj.isSelected = true;
					}
					else {
						sceneObj.isSelected = !sceneObj.isSelected;
					}
				}
				else {
					sceneObj.isSelected = !sceneObj.isSelected;
				}

				AppStore.sceneStore.updateSelectionChanged();
				AppStore.sceneStore.animate();
			}
		});

		SubscribersDoubleMouseClick.push(() => {

			AppStore.transform.changeState(TransformEnum.None);
		});
	};
	public updateSelectionChanged = () => {
		AppStore.sceneStore.transformControls.detach();
		AppStore.sceneStore.groupSelected = [];

		const changes: AppEventSelectionChanged[] = [];

		for (const object of AppStore.sceneStore.objects) {
			if (object.isSelected) {
				AppStore.sceneStore.groupSelected.push(object);
			}

			const state = object.UpdateSelection();

			changes.push({
				uuid:object.mesh.uuid,
				state: state
			});
		}

		if (AppStore.sceneStore.groupSelected.length) {
			const centerGroup = SceneObject.CalculateGroupCenter(AppStore.sceneStore.groupSelected);
			AppStore.sceneStore.transformObjectGroup.position.set(centerGroup.x, 0, centerGroup.z);
			AppStore.sceneStore.transformGroupMarker.position.set(centerGroup.x, 0, centerGroup.z);
		}

		this.updateTransformControls();

		changes.forEach(x => Dispatch(AppEventEnum.SELECTION_CHANGED, x));

		this.animate();
	};
	public updateTransformControls = () => {
		const isWorkingInstrument = AppStore.transform.state !== TransformEnum.None;

		AppStore.sceneStore.transformObjectGroup.position.setX(AppStore.sceneStore.gridSize.x / 2).setZ(AppStore.sceneStore.gridSize.z / 2).setY(0);
		AppStore.sceneStore.transformObjectGroup.rotation.set(0,0,0);
		AppStore.sceneStore.transformGroupMarker.position.setX(AppStore.sceneStore.gridSize.x / 2).setZ(AppStore.sceneStore.gridSize.z / 2).setY(0);
		AppStore.sceneStore.transformGroupMarker.rotation.set(0,0,0);

		if(isWorkingInstrument && AppStore.sceneStore.groupSelected.length)
		{
			AppStore.sceneStore.transformControls.attach(AppStore.sceneStore.transformObjectGroup);
			AppStore.sceneStore.transformControls.setMode(EnumHelpers
				.valueOf(TransformEnum, AppStore.transform.state) as 'translate' | 'rotate' | 'scale');
		}
		else {
			AppStore.sceneStore.transformControls.detach();
		}

		this.animate();
	};
	public updateCameraLookPosition = () => {
		this.activeCamera.lookAt(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orthographicCamera.updateProjectionMatrix();
		this.orbitControls.target.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orbitControls.update();
	};
	public updateCameraWindowSize = () => {
		this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
		//this.activeCamera.fov = (360 / Math.PI) * Math.atan(Math.tan(((Math.PI / 180) * this.perspectiveCamera.fov / 2)) * (window.innerHeight / this.temp.windowHeight));
		this.perspectiveCamera.updateMatrix();
		this.perspectiveCamera.updateProjectionMatrix();
		this.orthographicCamera.left = window.innerWidth / -2;
		this.orthographicCamera.right = window.innerWidth / 2;
		this.orthographicCamera.top = window.innerHeight / 2;
		this.orthographicCamera.bottom = window.innerHeight / -2;
		this.orthographicCamera.updateProjectionMatrix();
	};
	public updateCameraType = (isPerspective: boolean, isInit = false) => {
		if (isPerspective)
		{
			this.activeCamera = this.perspectiveCamera;
			config.scene.setStartupPerspectiveCamera = true;
			saveConfig();
		}
		else
		{
			this.activeCamera = this.orthographicCamera;
			config.scene.setStartupPerspectiveCamera = false;
			saveConfig();
		}

		this.updateOrientationHelper();
		this.orbitControls.object = this.activeCamera;
		this.orbitControls.target.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
		this.orbitControls.update();
		this.transformControls.camera = this.activeCamera;
		this.updateCameraWindowSize();

		if (!isInit)
		{
			this.animate();
		}
	};
	public updateOrientationHelper = () => {
		const isPerspective = this.activeCamera instanceof PerspectiveCamera;
		if (this.orientationHelperOrthographic && this.orientationHelperPerspective)
		{
			this.orientationHelperOrthographic.domElement.style.display = isPerspective ? 'none' : 'block';
			this.orientationHelperPerspective.domElement.style.display = !isPerspective ? 'none' : 'block';
			this.orientationHelperOrthographic[isPerspective ? 'deactivate' : 'activate']();
			this.orientationHelperPerspective[!isPerspective ? 'deactivate' : 'activate']();

			this.orientationHelperOrthographic.domElement.style.right = container.resolve(ToolsTabStore).width + 'px';
			this.orientationHelperPerspective.domElement.style.right = container.resolve(ToolsTabStore).width + 'px';
		}
	};
	public handleLoadFile = (file: string) => {
		const result = AppStore.sceneStore.file3dLoad(file, function (geometry: BufferGeometry, path: string) {
			Dispatch(AppEventEnum.ADD_OBJECT, {
				source: path,
				object: new SceneObject(geometry, file, AppStore.sceneStore.objects, true)
			});
		});

		if (result)
		{
			Log('File load ' + file.split('\\').pop());
		}
		else {
			Log('Error file format ' + file.split('\\').pop());
		}
	};
	public handleOnZoom = (evt?: WheelEvent<HTMLDivElement>) => {
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
	};

	public animate = () => {
		const frameLag = () => {
			if (this.temp.needAnimateTimer)
			{
				clearTimeout(this.temp.needAnimateTimer);
				this.temp.needAnimateTimer = null;
			}

			if (Date.now() - this.temp.windowResizeAt < 50)
			{
				return;
			}

			if (this.temp.lastFrameTime && Date.now() - this.temp.lastFrameTime < 5)
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

			// if dumping enabled
			this.orbitControls.update();

			if (this.orientationHelperOrthographic && this.orientationHelperPerspective)
			{
				this.orientationHelperOrthographic.update();
				this.orientationHelperPerspective.update();
			}

			if (this.grid)
			{
				this.grid.mat.resolution.set(window.innerWidth, window.innerHeight);
			}

			this.lightFromCamera.position.set(this.activeCamera.position.x, this.activeCamera.position.y, this.activeCamera.position.z);

			/*if (this.activeCamera.position.y >= 0)
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

				if (this.activeCamera.position.y >= 0)
				{
					this.outlineEffectRenderer.renderOutline(this.scene, this.activeCamera);
				}
			}, 1000);

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
	};
}
