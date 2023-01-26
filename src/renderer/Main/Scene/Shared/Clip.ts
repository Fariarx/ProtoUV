import { BackSide, Box3, BoxGeometry, BufferGeometry, Face, FrontSide,
	Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial,
	Object3D, PerspectiveCamera, Plane, PlaneGeometry,
	Raycaster, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**类：模型剖切 */
export class Clip {

	// (1)基本数据
	private obj: Object3D;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private renderer: WebGLRenderer;
	private controls: OrbitControls;
	isOpen = false;

	/**
     * (2)构造函数
     * @param obj 剖切的模型对象
     * @param scene 场景
     * @param camera 照相机
     * @param renderer 渲染器
     * @param controls 控制器
     */
	constructor(obj: Object3D, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, controls: OrbitControls) {
		this.obj = obj;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.controls = controls;
	}

	/**(3)开启剖切 */
	open() {
		this.initClipBox();
		// this.initCapBoxList();
		this.addMouseListener();
		// this.isOpen = true;
	}

	/**(4)关闭剖切 */
	close() {
		this.isOpen = false;
		this.removeMouseListener();
		this.clearClipBox();
	}

	/**(5)重置剖切 */
	reset() {
		this.close();
		this.open();
	}

	// ---------------剖切盒相关--------------------

	// (1)基本数据
	private low: Vector3 = new Vector3(); // 最低点
	private high: Vector3 = new Vector3(); // 最高点
	private low_init: Vector3 = new Vector3();
	private high_init: Vector3 = new Vector3();
	private group: Group = new Group(); // 记录开启剖切后添加的所有对象
	private planes: Array<Plane> = []; // 剖切平面
	private vertices = [
		new Vector3(), new Vector3(), new Vector3(), new Vector3(), // 顶部 4 个
		new Vector3(), new Vector3(), new Vector3(), new Vector3() // 底部 4 个
	];
	private faces: Array<BoxFace> = [];
	private lines: Array<BoxLine> = [];

	/**(2)初始化剖切盒 */
	private initClipBox() {
		const box3 = new Box3();
		box3.setFromObject(this.obj); // 获取模型对象的边界
		this.low = box3.min;
		this.high = box3.max;
		this.low_init.copy(this.low); // 保留一下初始值，好作为限制条件
		this.high_init.copy(this.high);
		this.group = new Group();
		this.initPlanes();
		this.initVertices();
		this.initFaces();
		this.initLines();
		this.scene.add(this.group);
	}

	/**(3)初始化剖切盒的 6 个剖切平面 */
	private initPlanes() {
		this.planes = [];
		this.planes.push(
			new Plane(new Vector3(0, -1, 0), this.high.y), // 上
			new Plane(new Vector3(0, 1, 0), -this.low.y), // 下
			new Plane(new Vector3(1, 0, 0), -this.low.x), // 左
			new Plane(new Vector3(-1, 0, 0), this.high.x), // 右
			new Plane(new Vector3(0, 0, -1), this.high.z), // 前
			new Plane(new Vector3(0, 0, 1), -this.low.z), // 后
		);
		this.obj.traverse((child: any) => {
			if (['Mesh', 'LineSegments'].includes(child.type)) {
				child.material.clippingPlanes = this.planes;
			}
		});
	}

	/**(4)初始化剖切盒的 8 个顶点 */
	private initVertices() {
		this.vertices[0].set(this.low.x, this.high.y, this.low.z);
		this.vertices[1].set(this.high.x, this.high.y, this.low.z);
		this.vertices[2].set(this.high.x, this.high.y, this.high.z);
		this.vertices[3].set(this.low.x, this.high.y, this.high.z);
		this.vertices[4].set(this.low.x, this.low.y, this.low.z);
		this.vertices[5].set(this.high.x, this.low.y, this.low.z);
		this.vertices[6].set(this.high.x, this.low.y, this.high.z);
		this.vertices[7].set(this.low.x, this.low.y, this.high.z);
	}

	/**(5)初始化剖切盒的 6 个面 */
	private initFaces() {
		const v = this.vertices;
		this.faces = [];
		this.faces.push(
			new BoxFace('y2', [v[0], v[1], v[2], v[3]]), // 上 y2
			new BoxFace('y1', [v[4], v[7], v[6], v[5]]), // 下 y1
			new BoxFace('x1', [v[0], v[3], v[7], v[4]]), // 左 x1
			new BoxFace('x2', [v[1], v[5], v[6], v[2]]), // 右 x2
			new BoxFace('z2', [v[2], v[6], v[7], v[3]]), // 前 z2
			new BoxFace('z1', [v[0], v[4], v[5], v[1]]), // 后 z1
		);
		this.group.add(...this.faces);
		this.faces.forEach(face => {
			this.group.add(face.backFace);
		});
	}

	/**(6)初始化剖切盒的 12 条边线 */
	private initLines() {
		const v = this.vertices;
		const f = this.faces;
		this.lines = [];
		this.lines.push(
			new BoxLine([v[0], v[1]], [f[0], f[5]]),
			new BoxLine([v[1], v[2]], [f[0], f[3]]),
			new BoxLine([v[2], v[3]], [f[0], f[4]]),
			new BoxLine([v[3], v[0]], [f[0], f[2]]),
			new BoxLine([v[4], v[5]], [f[1], f[5]]),
			new BoxLine([v[5], v[6]], [f[1], f[3]]),
			new BoxLine([v[6], v[7]], [f[1], f[4]]),
			new BoxLine([v[7], v[4]], [f[1], f[2]]),
			new BoxLine([v[0], v[4]], [f[2], f[5]]),
			new BoxLine([v[1], v[5]], [f[3], f[5]]),
			new BoxLine([v[2], v[6]], [f[3], f[4]]),
			new BoxLine([v[3], v[7]], [f[2], f[4]])
		);
		this.group.add(...this.lines);
	}

	/**(7)清除剖切盒 */
	private clearClipBox() {
		this.scene.remove(this.group);
		this.obj.traverse((child: any) => {
			if (child.type == 'Mesh') {
				child.material.clippingPlanes = [];
			}
		});
		this.renderer.domElement.style.cursor = '';
	}

	// -------------------覆盖盒（用于填充剖切后的截面，有多个）相关---------------------

	// (1)基本数据
	private capBoxList: Array<any> = [];
	private uniforms = {
		low: { value: new Vector3() },
		high: { value: new Vector3() }
	};
	private vertexShaderSource = `
    varying vec4 worldPosition;
    void main() {
        worldPosition = modelMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
	private framgentShaderSource = `
    uniform vec3 low;
    uniform vec3 high;
    varying vec4 worldPosition;
    void main( void ) {
        if((worldPosition.x < low.x  && cameraPosition.x < low.x)
        || (worldPosition.x > high.x && cameraPosition.x > high.x)
        || (worldPosition.y < low.y  && cameraPosition.y < low.y)
        || (worldPosition.y > high.y && cameraPosition.y > high.y)
        || (worldPosition.z < low.z  && cameraPosition.z < low.z)
        || (worldPosition.z > high.z && cameraPosition.z > high.z)){
            discard;
        } else {
            gl_FragColor = vec4(0.0,0.0,0.0,1.0);
        }
    }`;
	private frontMaterial = new ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: this.vertexShaderSource,
		fragmentShader: this.framgentShaderSource,
		colorWrite: false,
		depthWrite: false,
		side: FrontSide
	});
	private backMaterial = new ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: this.vertexShaderSource,
		fragmentShader: this.framgentShaderSource,
		colorWrite: false,
		depthWrite: false,
		side: BackSide
	});

	/**(2)初始化覆盖盒 */
	private initCapBoxList() {
		this.uniforms.low.value.copy(this.low);
		this.uniforms.high.value.copy(this.high);
		const list: Array<any> = [];
		const len = this.obj.children.length; // 类似的这个固定了，可能要改
		for (let i = 0; i < len; i++) {
			const mesh: any = this.obj.children[i];
			const item = {
				capBox: new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: mesh.material.color || 0x00ff00 })),
				capBoxScene: new Scene(),
				backScene: new Scene(),
				frontScene: new Scene()
			};
			item.capBoxScene.add(item.capBox);

			const backObj = this.obj.clone();
			const backMesh = backObj.children[i] as Mesh;
			backMesh.material = this.backMaterial;
			backObj.children = [backMesh];
			item.backScene.add(backObj);

			const frontObj = this.obj.clone();
			const frontMesh = frontObj.children[i] as Mesh;
			frontMesh.material = this.frontMaterial;
			frontObj.children = [frontMesh];
			item.frontScene.add(frontObj);

			list.push(item);
		}
		this.capBoxList = list;
	}

	/**(3)更新覆盖盒的大小和中心位置 */
	private updateCapBoxList() {
		this.uniforms.low.value.copy(this.low);
		this.uniforms.high.value.copy(this.high);
		this.capBoxList.forEach(item => {
			const size = new Vector3();
			size.subVectors(this.high, this.low); // 大小
			const position = this.low.clone().add(size.clone().multiplyScalar(0.5)); // 中心位置
			item.capBox.scale.copy(size);
			item.capBox.position.copy(position);
		});
	}

	/**(4)模板测试，确定覆盖盒要显示的部分 */
	stencilTest() {
		this.renderer.clear(); // 清除模板缓存
		const gl = this.renderer.getContext();
		gl.enable(gl.STENCIL_TEST);
		this.capBoxList.forEach((item, index) => {

			// 初始化模板缓冲值，每层不一样
			gl.stencilFunc(gl.ALWAYS, index, 0xff);
			gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
			this.renderer.render(item.backScene, this.camera);

			// 背面加1
			gl.stencilFunc(gl.ALWAYS, 1, 0xff);
			gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
			this.renderer.render(item.backScene, this.camera);

			// 正面减1
			gl.stencilFunc(gl.ALWAYS, 1, 0xff);
			gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
			this.renderer.render(item.frontScene, this.camera);

			// 缓冲区为指定值，才显示覆盖盒
			gl.stencilFunc(gl.LEQUAL, index + 1, 0xff);
			gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
			this.renderer.render(item.capBoxScene, this.camera);
		});

		gl.disable(gl.STENCIL_TEST);
	}

	/**(5)判断模型是否与剖切盒相交 */
	private isIntersecting(mesh: any) {
		const low = mesh.geometry.boundingBox.min;
		const high = mesh.geometry.boundingBox.max;
		if (
			low.x >= this.low.x &&
            low.y >= this.low.y &&
            low.z >= this.low.z &&
            high.x <= this.high.x &&
            high.y <= this.high.y &&
            high.z <= this.high.z
		) {
			return false;
		} else {
			return true;
		}
	}

	// -------------------鼠标操作相关-----------------------

	// (1)基本数据
	private raycaster: Raycaster = new Raycaster(); // 光线投射
	private mouse: Vector2 = new Vector2(); // 鼠标坐标点
	private activeFace: BoxFace | null = null; // 鼠标碰触的面

	/**(2)添加鼠标事件监听 */
	private addMouseListener() {
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mousedown', this.onMouseDown);
	}

	/**(3)移除鼠标事件监听 */
	private removeMouseListener() {
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mousedown', this.onMouseDown);
	}

	/**(4)转换鼠标坐标，并更新射线 */
	private updateMouseAndRay(event: MouseEvent) {
		this.mouse.setX((event.clientX / window.innerWidth) * 2 - 1);
		this.mouse.setY(-(event.clientY / window.innerHeight) * 2 + 1);
		this.raycaster.setFromCamera(this.mouse, this.camera);
	}

	/**(5)鼠标移动，处理面的选中状态 */
	private onMouseMove = (event: MouseEvent) => {
		this.updateMouseAndRay(event);
		const intersects = this.raycaster.intersectObjects(this.faces); // 鼠标与剖切盒的面的相交情况
		if (intersects.length) {
			this.renderer.domElement.style.cursor = 'pointer';
			const face = intersects[0].object as BoxFace;
			if (face !== this.activeFace) {
				if (this.activeFace) {
					this.activeFace.setActive(false);
				}
				face.setActive(true);
				this.activeFace = face;
			}
		} else {
			if (this.activeFace) {
				this.activeFace.setActive(false);
				this.activeFace = null;
				this.renderer.domElement.style.cursor = 'auto';
			}
		}
	};

	/**(6)鼠标按下，开始拖动操作 */
	private onMouseDown = (event: MouseEvent) => {
		if (this.activeFace) {
			this.updateMouseAndRay(event);
			const intersects = this.raycaster.intersectObjects(this.faces); // 鼠标与剖切盒的面的相交情况
			if (intersects.length) {
				const face = intersects[0].object as BoxFace;
				const axis = face.axis;
				const point = intersects[0].point;
				this.drag.start(axis, point);
			}
		}
	};

	/**(7)鼠标拖动，处理剖切操作 */
	private drag = {
		axis: '', // 轴线
		point: new Vector3(), // 起点
		ground: new Mesh(new PlaneGeometry(1000000, 1000000), new MeshBasicMaterial({ colorWrite: false, depthWrite: false })),
		start: (axis: string, point: Vector3) => {
			this.drag.axis = axis;
			this.drag.point = point;
			this.drag.initGround();
			this.controls.enablePan = false;
			this.controls.enableZoom = false;
			this.controls.enableRotate = false;
			this.renderer.domElement.style.cursor = 'move';
			window.removeEventListener('mousemove', this.onMouseMove);
			window.addEventListener('mousemove', this.drag.mousemove);
			window.addEventListener('mouseup', this.drag.mouseup);
		},
		end: () => {
			this.scene.remove(this.drag.ground);
			this.controls.enablePan = true;
			this.controls.enableZoom = true;
			this.controls.enableRotate = true;
			window.removeEventListener('mousemove', this.drag.mousemove);
			window.removeEventListener('mouseup', this.drag.mouseup);
			window.addEventListener('mousemove', this.onMouseMove);
		},
		mousemove: (event: MouseEvent) => {
			this.updateMouseAndRay(event);
			const intersects = this.raycaster.intersectObject(this.drag.ground); // 鼠标与拖动地面的相交情况
			if (intersects.length) {
				this.drag.updateClipBox(intersects[0].point);
			}
		},
		mouseup: () => {
			this.drag.end();
		},
		initGround: () => { // 初始化鼠标拖动时所在的平面（称之为地面，即 ground ）
			const normals: any = {
				'x1': new Vector3(-1, 0, 0),
				'x2': new Vector3(1, 0, 0),
				'y1': new Vector3(0, -1, 0),
				'y2': new Vector3(0, 1, 0),
				'z1': new Vector3(0, 0, -1),
				'z2': new Vector3(0, 0, 1)
			};
			if (['x1', 'x2'].includes(this.drag.axis)) {
				this.drag.point.setX(0);
			} else if (['y1', 'y2'].includes(this.drag.axis)) {
				this.drag.point.setY(0);
			} else if (['z1', 'z2'].includes(this.drag.axis)) {
				this.drag.point.setZ(0);
			}
			this.drag.ground.position.copy(this.drag.point);
			const newNormal = this.camera.position.clone().
				sub(this.camera.position.clone().projectOnVector(normals[this.drag.axis]))
				.add(this.drag.point); // 转换得到平面的法向量
			this.drag.ground.lookAt(newNormal);
			this.scene.add(this.drag.ground);
		},
		updateClipBox: (point: Vector3) => { // 更新剖切盒，进行剖切

			// 设置剖切盒的最低点和最高点
			const minSize = 2; // 剖切盒的最小大小
			switch (this.drag.axis) {
				case 'y2': // 上
					this.high.setY(Math.max(this.low.y + minSize, Math.min(this.high_init.y, point.y)));
					break;
				case 'y1': // 下
					this.low.setY(Math.max(this.low_init.y, Math.min(this.high.y - minSize, point.y)));
					break;
				case 'x1': // 左
					this.low.setX(Math.max(this.low_init.x, Math.min(this.high.x - minSize, point.x)));
					break;
				case 'x2': // 右
					this.high.setX(Math.max(this.low.x + minSize, Math.min(this.high_init.x, point.x)));
					break;
				case 'z2': // 前
					this.high.setZ(Math.max(this.low.z + minSize, Math.min(this.high_init.z, point.z)));
					break;
				case 'z1': // 后
					this.low.setZ(Math.max(this.low_init.z, Math.min(this.high.z - minSize, point.z)));
					break;
			}

			// 更新剖切盒的剖切平面、顶点、面和边线
			this.initPlanes();
			this.initVertices();
			this.faces.forEach((face: any) => {
				face.geometry.verticesNeedUpdate = true;
				face.geometry.computeBoundingBox();
				face.geometry.computeBoundingSphere();
			});
			this.lines.forEach((line: any) => {
				line.geometry.verticesNeedUpdate = true;
			});

			// 更新覆盖盒
			this.updateCapBoxList();
		}
	};

}

/**类：用于构造剖切盒的边线 */
class BoxLine extends LineSegments {

	// (1)基本数据
	private normalMaterial = new LineBasicMaterial({ color: 0xe1f2fb }); // 边线的常态
	private activeMaterial = new LineBasicMaterial({ color: 0x00ffff }); // 边线的活跃态

	/**
     * (2)构造函数
     * @param vertices 边线的 2 个点
     * @param faces 边线涉及的 2 个面
     */
	constructor(vertices: Array<Vector3>, faces: Array<BoxFace>) {
		super();
		faces.forEach(face => { face.lines.push(this); }); // 保存面和边线的关系
		this.geometry = new BufferGeometry();
		this.geometry.vertices.push(...vertices);
		this.material = this.normalMaterial;
	}

	/**
     * (3)活跃边线
     * @param isActive 是否活跃
     */
	setActive(isActive: boolean) {
		this.material = isActive ? this.activeMaterial : this.normalMaterial;
	}
}

/**类：用于构造剖切盒的面 */
class BoxFace extends Mesh {

	// (1)基本数据
	axis: string;
	lines: Array<BoxLine> = []; // 面涉及的 4 条边线
	backFace: Mesh; // 面的背面，用来展示

	/**
     * (2)构造函数
     * @param axis 面的轴线
     * @param vertices 面的 4 个点
     */
	constructor(axis: string, vertices: Array<Vector3>) {
		super();
		this.axis = axis;
		this.lines = [];
		this.geometry = new BufferGeometry();
		this.geometry.vertices.push(...vertices);
		this.geometry.faces.push(new Vector3(0, 3, 2), new Vector3(0, 2, 1));
		this.geometry.computeVertexNormals();
		this.geometry.computeFaceNormals();
		this.material = new MeshBasicMaterial({ colorWrite: false, depthWrite: false });
		const backMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, side: BackSide });
		this.backFace = new Mesh(this.geometry, backMaterial);
	}

	/**
     * (3)活跃面，即活跃相关边线
     * @param isActive 是否活跃
     */
	setActive(isActive: boolean) {
		this.lines.forEach(line => { line.setActive(isActive); });
	}

}
