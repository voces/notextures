import {
	BufferAttribute,
	Color,
	DoubleSide,
	HemisphereLight,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	PlaneBufferGeometry,
	Scene,
	WebGLRenderer,
	Object3D,
	Vector3,
	Group,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import _ from "lodash-es";
import { params } from "./gui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const consoleExports = window as any;

const scene = new Scene();
consoleExports.scene = scene;

// Camera
const camera = new PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
);
const cameraInitialPosition = new Vector3(0, -1.5, 2);
camera.position.copy(cameraInitialPosition);
camera.rotation.x = 0.7;

// Light
const light = new HemisphereLight(0xffffbb, 0x144452, 2);
scene.add(light);

// Ground
const geometry = new PlaneBufferGeometry(128, 128, 16, 16);
const count = geometry.attributes.position.count;
geometry.setAttribute(
	"color",
	new BufferAttribute(new Float32Array(count * 3), 3),
);

const color = new Color();
const colors = geometry.attributes.color;
for (let i = 0; i < count; i++) {
	color.setHSL(0.1 + Math.random() / 5, 0.7, 0.5);
	colors.setXYZ(i, color.r, color.g, color.b);
}

const material = new MeshPhongMaterial({
	color: 0xffffff,
	flatShading: true,
	vertexColors: true,
	shininess: 0,
	side: DoubleSide,
});
const plane = new Mesh(geometry, material);
plane.position.z = -5;
scene.add(plane);

// Renderer
const renderer = new WebGLRenderer({ antialias: true });
consoleExports.renderer = renderer;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
consoleExports.controls = controls;
const storedState = localStorage.getItem("camera");
if (storedState) {
	const data = JSON.parse(storedState);
	camera.position.copy(data.position);
	controls.target.copy(data.target);
}
controls.update();

// Camera movements
window.addEventListener("keydown", (e) => {
	if (e.key === " ") controls.reset();
});

// Mesh object
let obj: Object3D;
let Klass: typeof Object3D;
let lastParams: typeof params = { ...params };

export const remakeObjects = (NewKlass: typeof Object3D = Klass): void => {
	if (Klass !== NewKlass) Klass = NewKlass;

	const oldZ = obj?.rotation.z ?? 0;
	if (obj) scene.remove(obj);

	obj = new Group();

	const xMid = (params.width - 1) / 2;
	const yMid = (params.height - 1) / 2;

	consoleExports.obj = obj;

	for (let x = 0; x < params.width; x++)
		for (let y = 0; y < params.height; y++) {
			const child = new Klass();
			child.position.x = (x - xMid) * params.spacing;
			child.position.y = (y - yMid) * params.spacing;
			obj.add(child);
		}

	obj.rotation.z = oldZ ?? 0;
	scene.add(obj);
};

function render() {
	requestAnimationFrame(render);

	if (!_.isEqual(params, lastParams)) {
		remakeObjects();
		lastParams = { ...params };
	}

	renderer.render(scene, camera);
}

setInterval(() => {
	localStorage.setItem(
		"camera",
		JSON.stringify({
			position: controls.object.position,
			target: controls.target,
		}),
	);
}, 1000);

render();
