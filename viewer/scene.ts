import _ from "lodash-es";
import type { Object3D } from "three";
import {
	Color,
	Group,
	HemisphereLight,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
const light = new HemisphereLight(0x144452, 0xffffddd, 2);
scene.add(light);

// Renderer
const renderer = new WebGLRenderer({ antialias: true });
consoleExports.renderer = renderer;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new Color("#444"));
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
consoleExports.controls = controls;
const storedState = localStorage.getItem("notextures.camera");
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
let generator: () => Object3D;
let lastParams: typeof params = { ...params };

export const remakeObjects = (
	newGenerator: () => Object3D = generator,
): void => {
	renderer.setClearColor(new Color(params.background));

	if (generator !== newGenerator) generator = newGenerator;

	const oldZ = obj?.rotation.z ?? 0;
	if (obj) scene.remove(obj);

	obj = new Group();
	obj.castShadow = true;

	const xMid = (params.width - 1) / 2;
	const yMid = (params.height - 1) / 2;

	consoleExports.obj = obj;

	for (let x = 0; x < params.width; x++)
		for (let y = 0; y < params.height; y++) {
			const child = generator();
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
		localStorage.setItem("notextures.params", JSON.stringify(lastParams));
	}

	renderer.render(scene, camera);
}

setInterval(() => {
	localStorage.setItem(
		"notextures.camera",
		JSON.stringify({
			position: controls.object.position,
			target: controls.target,
		}),
	);
}, 1000);

render();
