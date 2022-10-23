import { Mesh, PCFSoftShadowMap, PlaneGeometry, Scene, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { AppStore, Log, Pages } from '../../AppStore';
import { Grid } from '../../Shared/Libs/Tools';
import { Printer } from '../Printer/Configs/Printer';
import { SceneInitializer } from './SceneInitializer';

export class SceneStore extends SceneInitializer {
	public constructor() {
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

		if (this.printerName)
		{
			printer = Printer.LoadConfigFromFile(this.printerName);
		}

		if (printer)
		{
			this.printer = printer;
			this.updatePrinter();
		}
		else
		{
			AppStore.setState(Pages.Configurator);
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
			this.materialForPlane = SceneStore.CreatePlaneMaterial(1 - (sizeXZ.x/sizeCeiledXZ.x), 1 - (sizeXZ.y/sizeCeiledXZ.y));
			const geometry = new PlaneGeometry(...sizeCeiledXZ.toArray());
			const plane = new Mesh(geometry, this.materialForPlane );
			plane.rotateX(-Math.PI / 2);
			plane.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
			this.decorations.add(plane);

			const plane2 = new Mesh(geometry, this.materialForPlaneShadow);
			plane2.rotateX(-Math.PI / 2);
			plane2.receiveShadow = true;
			plane2.position.set(this.gridSize.x / 2, 0.02, this.gridSize.z / 2);

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

			scene.add(line);

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
		this.grid.obj.position.set(0, 0.02, 0);

		this.updateCameraLookPosition();
		this.animate();
	}
}

