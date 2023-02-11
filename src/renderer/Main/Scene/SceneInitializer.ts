import _ from 'lodash';
import { runInAction } from 'mobx';
import { WheelEvent } from 'React';
import {
	AmbientLight,
	BufferGeometry,
	DirectionalLight,
	Group,
	MathUtils,
	Mesh,
	Object3D,
	OrthographicCamera,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Raycaster,
	Vector3, sRGBEncoding
} from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { LinearEncoding } from 'three/src/constants';
import { CONTAINED } from 'three-mesh-bvh';
import { Key } from 'ts-keycode-enum';
import { container } from 'tsyringe';
import { SceneObject } from './Entities/SceneObject';
import { SceneBase } from './SceneBase';
import { AppStore, Log, Pages } from '../../AppStore';
import { APP_HEADER_HEIGHT } from '../../Screen/Header/App';
import { config, saveConfig } from '../../Shared/Config';
import { Dispatch } from '../../Shared/Events';
import { EnumHelpers } from '../../Shared/Helpers/Enum';
import * as OrientationHelper from '../../Shared/Helpers/OrientationHelper';
import { SubscribersKeyPressed, isKeyPressed } from '../../Shared/Libs/Keys';
import {
	SubscribersDoubleMouseClick,
	SubscribersMouseDown,
	SubscribersMouseMove,
	SubscribersMouseUp,
	SubscribersWindowResize
} from '../../Shared/Libs/Listerners';
import {
	AppEventEnum,
	AppEventMoveObject,
	AppEventSelectionChanged,
	SupportsEnum,
	TransformEnum
} from '../../Shared/Libs/Types';
import { ToolsRightStore } from '../Components/ToolsRight/Store';
import { clearSupportCreateBuffer } from '../Components/ToolsRight/Supports/Shared/SupportsGen';

export class SceneInitializer extends SceneBase {
	private temp: any = {};

	public constructor() {
		super();

		Log('Scene loading...');
		this.renderer.setPixelRatio( window.devicePixelRatio);
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.sortObjects = true;

		this.stencilRenderer.localClippingEnabled = true;
		this.stencilRenderer.outputEncoding = LinearEncoding;
		this.stencilRenderer.setClearColor(0x000000);

		this.renderer.localClippingEnabled = true;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.renderer.outputEncoding = sRGBEncoding;

		this.clippingPlaneMeshMin.rotateX(Math.PI / 2);
		this.clippingPlaneMeshMin.renderOrder = 2;
		this.scene.add( this.clippingPlaneMeshMin);

		this.setupWindowResize();
		this.setupLight();
		this.setupCameraRig();
		this.setupOrbitController();
		this.setupTransformControls();
		this.updateCameraType(config.scene.setStartupPerspectiveCamera, true);
		this.setupFlyController();
		this.updateWindowResize();
		this.setupDropFile();
		this.setupMouse();
		this.setupKeyboard();

		Log('Scene loaded!');
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
		this.lightFromCamera = new DirectionalLight('#0xffffff', 0.7);
		this.lightFromCamera.castShadow = false;
		this.lightGroup.attach( this.lightFromCamera );

		const light1 = new AmbientLight( 0xffffff , 0.2); // soft white light
		this.lightGroup.attach( light1 );

		this.lightShadow = new DirectionalLight(0xffffff, 0.3);
		this.lightShadow.castShadow = true;

		const target = new Object3D();

		target.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);

		this.lightFromCamera.target = target;

		this.lightGroup.attach(target);
		this.lightGroup.attach(this.lightShadow);

		this.scene.add(this.lightGroup);
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
				Array.from(e.dataTransfer.files).forEach((file: File & {path: string} & any) =>
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
		this.orbitControls.dampingFactor = 0.2;
		this.orbitControls.update();
		this.orbitControls.addEventListener( 'change', () => {
			this.temp.wasChangeLook = true;
			this.animate();
		});
	};
	public setupFlyController = () => {
		this.temp.wasChangeLook = false;

		this.flyControlsPerspective = new FlyControls(this.perspectiveCamera, this.renderer.domElement);
		this.flyControlsPerspective.movementSpeed = 5;
		this.flyControlsPerspective.domElement = this.renderer.domElement;
		this.flyControlsPerspective.rollSpeed = Math.PI / 12;
		this.flyControlsPerspective.autoForward = false;
		this.flyControlsPerspective.dragToLook = false;

		this.flyControlsPerspective.addEventListener('change', () => {
			this.temp.wasChangeLook = true;
			this.animate();
		});

		SubscribersKeyPressed.push(() => {
			if (isKeyPressed(Key.Tab))
			{
				this.controlsTypeFlyEnabled = !this.controlsTypeFlyEnabled;
				this.animate();
			}

			if (!this.controlsTypeFlyEnabled)
			{
				return;
			}
			this.temp.wasChangeLook = true;
			this.animate();
		});
		SubscribersMouseMove.push(() => {
			if (!this.controlsTypeFlyEnabled)
			{
				return;
			}

			this.temp.wasChangeLook = true;
			this.animate();
		});
		SubscribersMouseDown.push(() => {
			if (!this.controlsTypeFlyEnabled)
			{
				return;
			}

			this.temp.wasChangeLook = true;
			this.animate();
		});
	};
	public setupTransformControls = () => {
		this.transformControls = new TransformControls(this.activeCamera, this.renderer.domElement);
		this.transformControls.setSize(0.8);
		this.transformControls.setSpace('world');
		this.transformControls.setTranslationSnap( 0.25 );
		this.transformControls.setRotationSnap(MathUtils.degToRad( 5 ) );
		this.transformControls.setScaleSnap( 0.002 );
		this.scene.add(this.transformControls);
		this.scene.add(this.transformObjectGroup);
		this.scene.add(this.transformGroupMarker);

		this.transformControlsUpdate = () => {
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
							transformObj.rotation.set(now.x, now.y, now.z);
							transformMarker.rotation.set(now.x, now.y, now.z);

							for (const sceneObject of this.groupSelected) {
								const oldPosition = sceneObject.mesh.rotation.clone();

								Dispatch(AppEventEnum.TRANSFORM_OBJECT, {
									from: oldPosition,
									to: transformObj.rotation.clone(),
									sceneObject: sceneObject,
								} as AppEventMoveObject);
							}
						}
						break;
					case TransformEnum.Scale:
						now = transformObj.scale;
						old = transformMarker.scale;

						if (!now.equals(old)) {
							const sceneObject = this.groupSelectedLast;
							const differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

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

							transformObj.scale.set(now.x, now.y, now.z);
							transformMarker.scale.set(now.x, now.y, now.z);
						}
						break;
				}
			} else {
				Log('Error of \'change\': transformObj is null or groupSelected.length = 0');
			}

			// trigger mobx update for ui
			runInAction(() =>
				this.groupSelected = [...this.groupSelected]);
		};
		this.transformControlsDragging = (event) => {
			AppStore.sceneStore.orbitControls.enabled = !event.value;

			if (event.value) {
				this.transformGroupMarker.position.set(
					this.transformObjectGroup.position.x,
					this.transformObjectGroup.position.y,
					this.transformObjectGroup.position.z);
				this.transformGroupMarker.rotation.set(
					this.transformObjectGroup.rotation.x,
					this.transformObjectGroup.rotation.y,
					this.transformObjectGroup.rotation.z);
				this.transformGroupMarker.scale.set(
					this.transformObjectGroup.scale.x,
					this.transformObjectGroup.scale.y,
					this.transformObjectGroup.scale.z);
			}
			else {
				SceneObject.SelectObjsAlignY();
			}

			this.animate();
		};
		this.transformControls.addEventListener( 'dragging-changed', this.transformControlsDragging);
		this.transformControls.addEventListener( 'change', this.transformControlsUpdate);
	};
	public setupCanvas = (canvas: HTMLDivElement | null) => {
		this.stats.domElement.style.marginLeft = '46px';
		this.stats.domElement.style.opacity = '0.3';
		this.stats.domElement.style.zIndex = '1';
		this.stats.domElement.style.position = 'fixed';
		this.stats.domElement.style.top = 'unset';
		this.stats.domElement.style.bottom = 'calc(15% + 56px)';
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
		this.orientationHelperPerspective.domElement.style.right = '0';
		this.orientationHelperOrthographic.domElement.style.right = '0';
		this.orientationHelperPerspective.domElement.style.top = (28 + APP_HEADER_HEIGHT) + 'px';
		this.orientationHelperOrthographic.domElement.style.top = (28 + APP_HEADER_HEIGHT) + 'px';

		this.updateOrientationHelper();
	};
	public setupKeyboard = () => {
		SubscribersKeyPressed.push(k => {
			if (k === Key.R && AppStore.performSupports.state === SupportsEnum.Add)
			{
				AppStore.performSupports.MouseMoveToAdd(undefined, true);
				return;
			}
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
		let isMouseDown = false;

		SubscribersMouseDown.push((e) => {
			isMouseDown = true;

			if (AppStore.performSupports.state === SupportsEnum.Remove)
			{
				AppStore.performSupports.MouseMoveToRemove(e, isMouseDown);
				return;
			}
			if (AppStore.performSupports.state === SupportsEnum.Add)
			{
				AppStore.performSupports.MouseClickToAdd();
				return;
			}

			clickTime = Date.now();
			vectorMouseDown.set(
				(e.clientX / window.innerWidth) * window.innerWidth,
				(e.clientY / window.innerHeight) * window.innerHeight, 0);
		});

		SubscribersMouseUp.push(e => {
			isMouseDown = false;

			if (AppStore.performSupports.state === SupportsEnum.Remove)
			{
				AppStore.performSupports.MouseMoveToRemove(e, isMouseDown);
				return;
			}
			if (AppStore.performSupports.state === SupportsEnum.Add)
			{
				AppStore.performSupports.MouseMoveToAdd(e);
				return;
			}

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
				- (e.clientY / window.innerHeight) * 2 + 1,
				0.5);

			const raycaster = new Raycaster();

			raycaster.setFromCamera(vectorMouseRaycaster, AppStore.sceneStore.activeCamera);

			const intersects = raycaster.intersectObjects(SceneObject.GetMeshesFromObjs(AppStore.sceneStore.objects), false);

			intersects.sort((a, b) => {
				return a.distance < b.distance ? -1 : 1;
			});

			if(intersects.length && intersects[0].face)
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

		SubscribersMouseMove.push(e => {
			if (AppStore.performSupports.state === SupportsEnum.Remove)
			{
				AppStore.performSupports.MouseMoveToRemove(e, isMouseDown);
				return;
			}
			if (AppStore.performSupports.state === SupportsEnum.Add)
			{
				AppStore.performSupports.MouseMoveToAdd(e);
				return;
			}
		});

		SubscribersDoubleMouseClick.push(() => {
			if (!AppStore.isState(Pages.Main))
			{
				return;
			}
			AppStore.transform.changeState(TransformEnum.None === AppStore.transform.state
				? TransformEnum.Move
				: TransformEnum.None);
		});
	};
	public updateSelectionChanged = () => {
		clearSupportCreateBuffer();

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

		if(isWorkingInstrument && AppStore.sceneStore.groupSelected.length)
		{
			const groupCenter = SceneObject.CalculateGroupCenter(this.groupSelected);
			AppStore.sceneStore.transformObjectGroup.position.setX(groupCenter.x).setZ(groupCenter.z).setY(0);
			AppStore.sceneStore.transformObjectGroup.rotation.set(0,0,0);
			AppStore.sceneStore.transformGroupMarker.position.setX(groupCenter.x).setZ(groupCenter.z).setY(0);
			AppStore.sceneStore.transformGroupMarker.rotation.set(0,0,0);

			//const groupCenter = SceneObject.CalculateGroupCenter(this.groupSelected);
			//ThreeHelper.DrawPoint(groupCenter);
			//this.transformControls.position.set(groupCenter.x, groupCenter.y, groupCenter.z);
			AppStore.sceneStore.transformControls.attach(AppStore.sceneStore.transformObjectGroup);
			AppStore.sceneStore.transformControls.setMode(EnumHelpers
				.valueOf(TransformEnum, AppStore.transform.state) as 'translate' | 'rotate' | 'scale');

			const sceneObject = this.groupSelected[this.groupSelected.length - 1];
			const transformObj = this.transformObjectGroup;
			const transformMarker = this.transformGroupMarker;
			transformObj.rotation.set(sceneObject.mesh.rotation.x, sceneObject.mesh.rotation.y, sceneObject.mesh.rotation.z);
			transformMarker.rotation.set(sceneObject.mesh.rotation.x, sceneObject.mesh.rotation.y, sceneObject.mesh.rotation.z);
		}
		else {
			AppStore.sceneStore.transformControls.detach();
		}

		this.animate();
	};
	public updateSupportsControls = () => {

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

			this.orientationHelperOrthographic.domElement.style.right = container.resolve(ToolsRightStore).width + 'px';
			this.orientationHelperPerspective.domElement.style.right = container.resolve(ToolsRightStore).width + 'px';
		}
	};
	public handleLoadFile = (file: string) => {
		const result = AppStore.sceneStore.file3dLoad(file, function (geometry: BufferGeometry, path: string) {
			Dispatch(AppEventEnum.ADD_OBJECT, {
				source: path,
				object: new SceneObject(geometry, file, true)
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
	public resetAnyTools = () => {
		AppStore.transform.changeState(TransformEnum.None, true);
		AppStore.performSupports.changeState(SupportsEnum.None, true);
	};

	public clippingReset = () => {
		if (this.clippingBuffer.sceneGeometryGrouped) {
			AppStore.sceneStore.scene.remove(AppStore.sceneStore.clippingBuffer.sceneGeometryGrouped!);
			AppStore.sceneStore.clippingBuffer.sceneGeometryGrouped = null;
		}
	};
	public clippingSomeShit = () => {
		if (!this.clippingSceneWorking)
		{
			this.clippingPlaneMeshMin.visible = false;
			this.clippingReset();
			this.materialsForScene.default.select.clippingPlanes = [];
			this.materialsForScene.default.normal.clippingPlanes = [];
			this.materialForSupports.normal.clippingPlanes = [];
			this.materialForSupports.preview.clippingPlanes = [];
			return;
		}
		else {
			this.clippingPlaneMeshMin.visible = this.activeCamera instanceof OrthographicCamera;
			this.materialsForScene.default.select.clippingPlanes = [this.clippingPlaneMin];
			this.materialsForScene.default.normal.clippingPlanes = [this.clippingPlaneMin];
			this.materialForSupports.normal.clippingPlanes = [this.clippingPlaneMin];
			this.materialForSupports.preview.clippingPlanes = [this.clippingPlaneMin];
		}

		if (this.objects.length > 0)
		{
			const needUpdate = SceneObject.CreateClippingGroup();

			if (this.clippingBuffer.sceneGeometryGrouped && needUpdate) {
				const intersect = this.clippingBuffer.intersectionMesh;
				const  inverseMatrix = this.clippingBuffer.inverseMatrix;
				const  localPlane = this.clippingBuffer.localPlane;
				const  tempLine = this.clippingBuffer.tempLine;
				const  tempVector = this.clippingBuffer.tempVector1;
				const  tempVector1 = this.clippingBuffer.tempVector1;
				const  tempVector2 = this.clippingBuffer.tempVector2;
				const  tempVector3 = this.clippingBuffer.tempVector3;

				this.clippingPlaneMeshMin.updateMatrixWorld(true);
				this.clippingPlaneMeshMin.position.setY(this.clippingScenePercent * this.gridSize.y);
				this.clippingPlaneMeshMin.updateMatrixWorld(true);
				this.clippingPlaneMin.applyMatrix4( this.clippingPlaneMeshMin.matrixWorld );
				this.clippingPlaneMeshMin.updateMatrixWorld(true);

				this.clippingPlaneMin.constant = (this.clippingSceneDirectionDown ? 1 : -1) * this.clippingScenePercent * this.gridSize.y;
				this.clippingPlaneMin.normal.set( 0, (this.clippingSceneDirectionDown ? -1 : 1), 0);

				this.clippingBuffer.inverseMatrix.copy( intersect.colliderMesh!.matrixWorld ).invert();
				this.clippingBuffer.localPlane.copy(this.clippingPlaneMin).applyMatrix4(inverseMatrix);

				let index = 0;

				const posAttr =  intersect.outlineLines!.geometry.attributes.position;

			intersect.colliderBvh!.shapecast( {
				intersectsBounds: () =>  CONTAINED,
				intersectsTriangle: (tri: any) => {

					// check each triangle edge to see if it intersects with the plane. If so then
					// add it to the list of segments.
					let count = 0;

					tempLine.start.copy( tri.a );
					tempLine.end.copy( tri.b );
					if (localPlane.intersectLine( tempLine, tempVector )) {
						posAttr.setXYZ( index, tempVector.x, tempVector.y, tempVector.z );
						index ++;
						count ++;
					}

					tempLine.start.copy( tri.b );
					tempLine.end.copy( tri.c );
					if (localPlane.intersectLine( tempLine, tempVector )) {
						posAttr.setXYZ( index, tempVector.x, tempVector.y, tempVector.z );
						count ++;
						index ++;
					}

					tempLine.start.copy( tri.c );
					tempLine.end.copy( tri.a );
					if (localPlane.intersectLine( tempLine, tempVector )) {
						posAttr.setXYZ( index, tempVector.x, tempVector.y, tempVector.z );
						count ++;
						index ++;
					}

					// When the plane passes through a vertex and one of the edges of the triangle, there will be three intersections, two of which must be repeated
					if ( count === 3 ) {
						tempVector1.fromBufferAttribute( posAttr, index - 3 );
						tempVector2.fromBufferAttribute( posAttr, index - 2 );
						tempVector3.fromBufferAttribute( posAttr, index - 1 );
						// If the last point is a duplicate intersection
						if ( tempVector3.equals( tempVector1 ) || tempVector3.equals( tempVector2 ) ) {
							count --;
							index --;
						} else if ( tempVector1.equals( tempVector2 ) ) {
							// If the last point is not a duplicate intersection
							// Set the penultimate point as a distinct point and delete the last point
							posAttr.setXYZ( index - 2, tempVector3.x, tempVector3.y, tempVector3.z );
							count --;
							index --;
						}
					}

					// If we only intersected with one or three sides then just remove it. This could be handled
					// more gracefully.
					if ( count !== 2 ) {
						index -= count;
					}
				},
			});

			// set the draw range to only the new segments and offset the lines so they don't intersect with the geometry
			intersect.outlineLines!.geometry.setDrawRange( 0, index );
			intersect.outlineLines!.position.copy( this.clippingPlaneMin.normal ).multiplyScalar( - 0.00001 );

			//const mesh = new Mesh( this.groupSelectedLast .temp.outlineLines.geometry, new MeshPhongMaterial( { color: 'red', side: DoubleSide } ) );
			//	this.scene.add( mesh );

			posAttr.needsUpdate = true;
			}
		}
		else {
			this.clippingReset();
		}
	};

	public animate = (force?: boolean) => {
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

			this.clippingSomeShit();

			const delta = this.clock.getDelta();

			if (this.controlsTypeFlyEnabled) {
				this.orbitControls.enabled = false;
				if (delta < 0.2) {
					if (this.activeCamera instanceof OrthographicCamera)
					{
						AppStore.sceneStore.updateCameraType(true);
					}

					this.flyControlsPerspective.update(delta);
				}
			}
			else {
				this.orbitControls.enabled = true;

				/*if dumping enabled*/
				this.orbitControls.update();
			}

			if (this.orientationHelperOrthographic && this.orientationHelperPerspective)
			{
				this.orientationHelperOrthographic.update();
				this.orientationHelperPerspective.update();
			}

			if (this.grid)
			{
				this.grid.mat.resolution.set(window.innerWidth, window.innerHeight);
			}

			if (config.scene.isFixedCenter)
			{
				this.orbitControls.target.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
			}
			else {
				//this.orbitControls.target.setY(0);
			}

			this.lightFromCamera.position.set(this.activeCamera.position.x, this.activeCamera.position.y, this.activeCamera.position.z);

			const lookAt = _.minBy(this.groupSelected, x => x.center);

			if (lookAt)
			{
				this.lightFromCamera.lookAt(lookAt.center);
			}

			if (this.activeCamera.position.y >= 0)
			{
				SceneObject.UpdateSupports(this.objects, true);
			}
			else {
				SceneObject.UpdateSupports(this.objects, false);
			}
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
					if (!this.clippingSceneWorking) {
						this.outlineEffectRenderer.renderOutline(this.scene, this.activeCamera);
					}
				}
			}, 500);

			this.stats.update();

			/*if (this.isTransformWorking) {
        requestAnimationFrame(_animate);
      }*/
		};

		if (frameLag() && force !== true)
		{
			return;
		}

		requestAnimationFrame(_animate);
	};
}
