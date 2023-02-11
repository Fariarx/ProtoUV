import * as THREE from 'three';
import {
	AlwaysStencilFunc,
	BackSide,
	BufferAttribute,
	BufferGeometry,
	DecrementWrapStencilOp,
	DoubleSide,
	DynamicDrawUsage,
	FrontSide,
	Group,
	IncrementWrapStencilOp,
	Line3,
	LineBasicMaterial,
	LineSegments,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	ObjectLoader,
	OrthographicCamera,
	Plane,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer
} from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { LinearEncoding } from 'three/src/constants';
import { CONTAINED, MeshBVH } from 'three-mesh-bvh';
import { Printer } from '../renderer/Main/Printer/Configs/Printer';
import { SliceWorker } from '../renderer/Slicing/Store';

const scene: Scene = new Scene();
const reader = new FileReader();
const clippingPlaneMin = new Plane();
const clippingInnerColor = 0xFFFFFF;
const clippingPlaneMeshMin = new THREE.Mesh( new THREE.PlaneBufferGeometry(),
	new THREE.MeshBasicMaterial ({
		color: clippingInnerColor,	side: BackSide,
		transparent: true,
		stencilWrite: true,
		stencilFunc: THREE.NotEqualStencilFunc,
		stencilFail: THREE.ReplaceStencilOp,
		stencilZFail: THREE.ReplaceStencilOp,
		stencilZPass: THREE.ReplaceStencilOp,
	}));

clippingPlaneMeshMin.rotateX(Math.PI / 2);
scene.add(clippingPlaneMeshMin);
clippingPlaneMeshMin.visible = true;
clippingPlaneMeshMin.scale.setScalar(1000000);

const geometry = new LineSegmentsGeometry();

onmessage = function (oEvent) {
	const data = oEvent.data as SliceWorker;
	const loader = new ObjectLoader();
	const group = loader.parse(data.geometry) as Group;
	const printer = JSON.parse(data.printer) as Printer;
	const sizeXZ = new Vector2(
		printer.Workspace.SizeX * 0.1,
		printer.Workspace.SizeY * 0.1);

	const stencilRenderer: WebGLRenderer = new WebGLRenderer({
		canvas: data.canvas
	});
	stencilRenderer.localClippingEnabled = true;
	stencilRenderer.outputEncoding = LinearEncoding;
	stencilRenderer.setClearColor(0x000000);
	stencilRenderer.setSize(printer.Resolution.X,printer.Resolution.Y,false);

	stencilRenderer.autoClear = false;
	stencilRenderer.autoClearColor = false;
	stencilRenderer.autoClearDepth = false;
	stencilRenderer.autoClearStencil = false;

	const sliceOrthographicCamera = new OrthographicCamera(
		sizeXZ.x / - 2,
		sizeXZ.x / 2,
		sizeXZ.y / 2,
		sizeXZ.y / - 2,
		0.0001,
	);
	sliceOrthographicCamera.layers.enable(1);

	const matLine = new LineMaterial( {
		color: 0x0,
		linewidth: printer.PrintSettings.ExposureIndent / 1000,
		depthTest: false
	});

	const line = new LineSegments2( geometry, matLine );
	line.layers.set(1);
	scene.add( line );

	const groupClipping = CreateClipping((group.children[0] as Mesh).geometry);
	scene.add(groupClipping.group);

	const updateClipping = (clippingPercent: number) => {
		const inverseMatrix= new Matrix4();
		const localPlane= new Plane();
		const tempLine=new  Line3();
		const tempVector= new  Vector3();
		const tempVector1= new  Vector3();
		const tempVector2= new Vector3();
		const tempVector3= new Vector3();

		clippingPlaneMeshMin.updateMatrixWorld(true);
		clippingPlaneMeshMin.position.setY(clippingPercent * data.gridSize.y);
		clippingPlaneMeshMin.updateMatrixWorld(true);
		clippingPlaneMin.applyMatrix4(clippingPlaneMeshMin.matrixWorld );
		clippingPlaneMeshMin.updateMatrixWorld(true);

		clippingPlaneMin.constant = clippingPercent * data.gridSize.y;
		clippingPlaneMin.normal.set( 0, -1, 0);

		inverseMatrix.copy( groupClipping.colliderMesh!.matrixWorld ).invert();
		localPlane.copy(clippingPlaneMin).applyMatrix4(inverseMatrix);

		let index = 0;

		const posAttr = groupClipping.outlineLines.geometry.attributes.position;

		groupClipping.colliderBvh.shapecast( {
			intersectsBounds: () =>  CONTAINED,
			intersectsTriangle: (tri: any) => {
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

				if ( count === 3 ) {
					tempVector1.fromBufferAttribute( posAttr, index - 3 );
					tempVector2.fromBufferAttribute( posAttr, index - 2 );
					tempVector3.fromBufferAttribute( posAttr, index - 1 );
					if ( tempVector3.equals( tempVector1 ) || tempVector3.equals( tempVector2 ) ) {
						count --;
						index --;
					} else if ( tempVector1.equals( tempVector2 ) ) {
						posAttr.setXYZ( index - 2, tempVector3.x, tempVector3.y, tempVector3.z );
						count --;
						index --;
					}
				}

				if ( count !== 2 ) {
					index -= count;
				}
			},
		});

    groupClipping.outlineLines!.geometry.setDrawRange( 0, index );
    groupClipping.outlineLines!.position.copy(clippingPlaneMin.normal ).multiplyScalar( - 0.00001 );

    posAttr.needsUpdate = true;

    geometry.fromLineSegments(groupClipping.outlineLines!);
    geometry   .setDrawRange( 0, index );

	};

	const next = () => new Promise(resolve => {
		const layer = data.layers.shift();

		if (!layer)
		{
			postMessage({
				type: 1
			});
			resolve(true);
			return;
		}

		updateClipping(layer.percent);

		stencilRenderer.clearDepth();
		stencilRenderer.clearColor();
		stencilRenderer.clearStencil();

		sliceOrthographicCamera.position.set(data.gridSize.x/2, data.gridSize.y + 1, data.gridSize.z/2);
		sliceOrthographicCamera.lookAt(data.gridSize.x/2, 0, data.gridSize.z/2);

		clippingPlaneMeshMin.visible = true;
		stencilRenderer.render(scene, sliceOrthographicCamera);

		if (layer.isAdditionalLight && printer.PrintSettings.ExposureIndent > 0)
		{
			clippingPlaneMeshMin.visible = false;
			stencilRenderer.render(scene, sliceOrthographicCamera);
		}

		(data.canvas as any).convertToBlob().then((blob: Blob) => {
			reader.readAsDataURL(blob);
			reader.onloadend = function() {
				postMessage({
					type: 0,
					image: reader.result,
					layer: layer,
					reminder: data.layers.length
				});

				next().then(_ => {
					resolve(false);
				});
			};
		});
	});

	next().then();
};

const material = new MeshLambertMaterial( { color: '#98de9c', side: DoubleSide,
	clippingPlanes: [clippingPlaneMin]
});

const CreateClipping = (geometry: BufferGeometry) => {
	const frontSideModel = new Mesh(geometry);
	frontSideModel.updateMatrixWorld( true );
	const surfaceModel = frontSideModel.clone();
	surfaceModel.material = material;
	surfaceModel.material .transparent = true;
	surfaceModel.material .opacity = 0;
	surfaceModel.renderOrder = 1;

	const lineGeometry = new BufferGeometry();
	const linePosAttr = new BufferAttribute( new Float32Array( 300000 ), 3, false );
	linePosAttr.setUsage( DynamicDrawUsage );
	lineGeometry.setAttribute( 'position', linePosAttr );
	const clippingLineMin = new  LineSegments( lineGeometry, new LineBasicMaterial() );
	clippingLineMin.visible = false;

	clippingLineMin.scale.copy( frontSideModel.scale );
	clippingLineMin.position.set( 0, 0, 0 );
	clippingLineMin.quaternion.identity();

	const matSet = new Set();
	const materialMap = new Map();
	frontSideModel.traverse((c: Mesh | any) => {
		if ( materialMap.has( c.material ) ) {
			c.material = materialMap.get( c.material );
			return;
		}

		matSet.add( c.material );

		const material = c.material.clone();
		material.roughness = 1.0;
		material.metalness = 0.1;
		material.side = FrontSide;
		material.stencilWrite = true;
		material.stencilFail =  DecrementWrapStencilOp;
		material.stencilZFail = DecrementWrapStencilOp;
		material.stencilZPass =  DecrementWrapStencilOp;
		material.depthWrite = false;
		material.depthTest = false;
		material.colorWrite = false;
		material.stencilWrite = true;
		material.stencilFunc = AlwaysStencilFunc;
		material.clippingPlanes = [clippingPlaneMin];

		materialMap.set( c.material, material );
		c.material = material;
	});

	materialMap.clear();

	const backSideModel = frontSideModel.clone();
	backSideModel.traverse((c: Mesh | any) => {
		if (c.isMesh) {
			if ( materialMap.has( c.material ) ) {
				c.material = materialMap.get( c.material );
				return;
			}

			const material = c.material.clone();
			material.side =  BackSide;
			material.stencilFail = IncrementWrapStencilOp;
			material.stencilZFail = IncrementWrapStencilOp;
			material.stencilZPass = IncrementWrapStencilOp;
			material.depthWrite = false;
			material.depthTest = false;
			material.colorWrite = false;
			material.stencilWrite = true;
			material.clippingPlanes = [clippingPlaneMin];

			materialMap.set( c.material, material );
			c.material = material;
		}
	});

	const colliderBvh = new MeshBVH( frontSideModel.geometry, { maxLeafTris: 3 } );
	frontSideModel.geometry.boundsTree = colliderBvh;

	const colliderMesh = new Mesh( frontSideModel.geometry,  new MeshBasicMaterial( {
		wireframe: true,
		transparent: true,
		opacity: 0.01,
		depthWrite: false,
	}));
	colliderMesh.renderOrder = 2;
	colliderMesh.position.copy( frontSideModel.position );
	colliderMesh.rotation.copy( frontSideModel.rotation );
	colliderMesh.scale.copy( frontSideModel.scale );

	const group = new Group();

	group.add(frontSideModel,
		backSideModel,
		surfaceModel,
		colliderMesh,
		clippingLineMin);

	group.children[3].visible = false;
	group.children[2].visible = false;

	return {
		group: group,
		colliderMesh : colliderMesh,
		outlineLines: clippingLineMin,
		colliderBvh :colliderBvh
	};
};
