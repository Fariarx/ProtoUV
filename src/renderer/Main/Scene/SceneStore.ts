import { makeObservable } from 'mobx';
import { bridge } from 'renderer/Shared/Globals';
import {
	Mesh, OrthographicCamera,
	PlaneGeometry,
	Scene,
	Vector2,
	Vector3
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { singleton } from 'tsyringe';

import { SceneInitializer } from './SceneInitializer';
import {
	AppStore,
	Log,
	Pages,
} from '../../AppStore';
import { Grid } from '../../Shared/Libs/Tools';
import { Printer } from '../Printer/Configs/Printer';

@singleton()
export class SceneStore extends SceneInitializer {
	public constructor() {
		super();

		if (!bridge.isWorker())
		{
			this.setupPrinter();
		}

		this.setup();
		this.updateCameraLookPosition();
		this.animate();
		makeObservable(this);

		setTimeout(() => {
			if (bridge.isDebug() && !bridge.isWorker())
			{
				AppStore.sceneStore.handleLoadFile('C:\\Users\\admin\\Downloads\\Old\\V7_Infinity_Cube_Hinge.stl');
			}
		}, 100);
	}

	public setup() {
		this.scene.add(this.decorations);
	}

	public setupPrinter(printer?: Printer) {
		if (this.printerName)
		{
			printer = Printer.LoadConfigFromFile(this.printerName) ?? undefined;
		}

		if (printer)
		{
			this.printer = printer;
			this.updatePrinter();
		}
		else
		{
			setTimeout(() => AppStore.changeState(Pages.Configurator));
			Log('Printer configuration is empty!');
		}
	}

	public updatePrinter() {
		if (this.grid)
		{
			this.grid.dispose();
		}

		this.decorations.clear();

		if (this.printer) {
			const sizeXZ = new Vector2(this.printer.Workspace.SizeX * 0.1, this.printer.Workspace.SizeY * 0.1);
			const sizeCeiledXZ = new Vector2(Math.ceil(sizeXZ.x), Math.ceil(sizeXZ.y));
			this.gridSize.set(sizeCeiledXZ.x, this.printer.Workspace.Height * 0.1, sizeCeiledXZ.y);

			const geometryForSupports = new PlaneGeometry(sizeCeiledXZ.x, sizeCeiledXZ.y);
			const planeForSupports = new Mesh(geometryForSupports, );
			planeForSupports.rotateX(-Math.PI / 2);
			planeForSupports.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
			planeForSupports.visible = false;
			this.decorations.add(planeForSupports);

			this.materialForPlane?.dispose();
			this.materialForPlane = SceneStore.CreatePlaneMaterial((1 - (sizeXZ.x/sizeCeiledXZ.x)) / 2, (1 - (sizeXZ.y/sizeCeiledXZ.y)) / 2);
			const geometry = new PlaneGeometry(...sizeCeiledXZ.toArray());
			const plane = new Mesh(geometry, this.materialForPlane );
			plane.rotateX(-Math.PI / 2);
			plane.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
			this.decorations.add(plane);

			const plane2 = new Mesh(geometry, this.materialForPlaneShadow);
			plane2.rotateX(-Math.PI / 2);
			plane2.position.set(this.gridSize.x / 2, 0.0003, this.gridSize.z / 2);
			plane2.receiveShadow = true;
			this.lightShadow.shadow.mapSize.width = 8192;
			this.lightShadow.shadow.mapSize.height = 8192;
			this.lightShadow.shadow.camera.top = 500;
			this.lightShadow.shadow.camera.bottom = -500;
			this.lightShadow.shadow.camera.left = 500;
			this.lightShadow.shadow.camera.right = -500;
			this.lightShadow.shadow.camera.far = 500;
			this.lightShadow.position.setY(499);

			this.decorations.add(plane2);
		}
		else {
			this.gridSize.set(1,1,1);
		}

		const createPrinterGrid = (size: Vector3, scene: Scene) => {
			const positions: any[] = [];

			const gridSizeX = size.x;
			const gridSizeY = size.z;

			positions.push(0, 0, 0);

			for (let x = 1; x <= gridSizeX; x++) {
				for (let y = 1; y <= gridSizeY; y++) {
					positions.push(x, 0, 0);
					positions.push(x, 0, y);
					positions.push(0, 0, y);
					positions.push(0, 0, 0);
				}
			}

			const geometry = new LineGeometry();
			geometry.setPositions(positions);

			const line = new Line2(geometry, this.materialLine);

			line.renderOrder = 0.5;

			return {
				obj: line,
				mat: this.materialLine,
				dispose: ()=> {
					geometry.dispose();
					scene.remove(line);
				}
			} as Grid;
		};

		this.grid = createPrinterGrid(this.gridSize, this.scene);
		this.grid.obj.position.set(0, 0.0002, 0);
		this.decorations.add(this.grid.obj);
		this.scene.add(this.decorations);

		this.updateCameraLookPosition();

		if (this.printer)
		{
			const sizeXZ = new Vector2(this.printer.Workspace.SizeX * 0.1, this.printer.Workspace.SizeY * 0.1);

			setTimeout(() => {
				AppStore.performSupports.addCursorToScene();
			}, 100);

			this.clippingPlaneMeshMin.scale.setScalar(1000000);
			this.sliceOrthographicCamera = new OrthographicCamera(
				sizeXZ.x / - 2,
				sizeXZ.x / 2,
				sizeXZ.y / 2,
				sizeXZ.y / - 2,
				0.0001,
			);
		}

		this.animate();
	}

	public export = () => {
		return JSON.stringify({
			printer: JSON.stringify(this.printer),
			sceneObjects: this.objects.map(x => x.ToJson()),
		});
	};
}

