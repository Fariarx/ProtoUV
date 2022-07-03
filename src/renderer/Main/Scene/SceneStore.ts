import { runInAction } from 'mobx';
import { Mesh, PCFSoftShadowMap, PlaneGeometry, Scene, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { AppStore, Log, Pages } from '../../AppStore';
import { materialLine } from '../../Shared/Globals';
import { Grid } from '../../Shared/Libs/Tools';
import { Printer } from '../Printer/Configs/Printer';
import { SceneInitializer } from './SceneInitializer';

export class SceneStore extends SceneInitializer {
	private static instance: SceneStore;

	public static getInstance(): SceneStore {
		if (!SceneStore.instance)
		{
			SceneStore.instance = new SceneStore();
		}

		return SceneStore.instance;
	}

	private constructor() {
		super();
		this.setupPrinter();
		this.setup();
		this.updateCameraLookPosition();
		this.animate();
	}

	public setup() {
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.renderer.setPixelRatio( window.devicePixelRatio);
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.sortObjects = true;

		this.scene.add(this.decorations);
	}

	public setupPrinter() {
		let printer;

		if(this.printerName)
		{
			printer = Printer.LoadConfigFromFile(this.printerName);
		}

		if(printer)
		{
			this.printer = printer;
			this.updatePrinter();
		}
		else
		{
			runInAction(() => {
				AppStore.setState(Pages.Configurator);
			});
			Log('Printer configuration is empty!');
		}
	}

	public updatePrinter() {
		if(this.grid)
		{
			this.grid.dispose();
		}

		this.decorations.clear();

		if(this.printer) {
			this.gridSize.set(Math.ceil(this.printer.Workspace.SizeX * 0.1), this.printer.Workspace.Height * 0.1, Math.ceil(this.printer.Workspace.SizeY * 0.1));

			const geometryForSupports = new PlaneGeometry(Math.ceil(this.printer.Workspace.SizeX * 0.1), Math.ceil(this.printer.Workspace.SizeY * 0.1));
			const planeForSupports = new Mesh(geometryForSupports, );
			planeForSupports.rotateX(-Math.PI / 2);
			planeForSupports.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
			planeForSupports.visible = false;
			this.decorations.add(planeForSupports);

			const geometry = new PlaneGeometry(this.printer.Workspace.SizeX * 0.1, this.printer.Workspace.SizeY * 0.1);
			const plane = new Mesh(geometry, this.materialForPlane);
			plane.rotateX(-Math.PI / 2);
			plane.position.set(this.gridSize.x / 2, -0.0001, this.gridSize.z / 2);
			this.decorations.add(plane);

			const geometry1 = new PlaneGeometry(Math.ceil(this.printer.Workspace.SizeX * 0.1), Math.ceil(this.printer.Workspace.SizeY * 0.1));
			const plane1 = new Mesh(geometry1, this.materialForPlaneLimit);
			plane1.rotateX(-Math.PI / 2);
			plane1.position.set(this.gridSize.x / 2, -0.01, this.gridSize.z / 2);
			this.decorations.add(plane1);

			const plane2 = new Mesh(geometry1, this.materialForPlaneShadow);
			plane2.rotateX(-Math.PI / 2);
			plane2.receiveShadow = true;
			plane2.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
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

			const line = new Line2(geometry, materialLine);

			scene.add(line);

			return {
				obj: line,
				mat: materialLine,
				dispose: ()=> {
					geometry.dispose();
					scene.remove(line);
				}
			} as Grid;
		};

		this.grid = createPrinterGrid(this.gridSize, this.scene);
	}
}

