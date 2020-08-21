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
} from "three";
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
const storedLocation = localStorage.getItem("camera");
if (storedLocation) camera.position.copy(JSON.parse(storedLocation));

camera.rotation.x = 0.7;

// Light
const light = new HemisphereLight(0xffffbb, 0x080820, 2);
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

// Camera movements
const keyboard: Record<string, boolean> = {};
let pause = false;
window.addEventListener("keydown", (e) => {
	keyboard[e.key] = true;
	if (e.key === " ") {
		camera.position.copy(cameraInitialPosition);
		localStorage.setItem("camera", JSON.stringify(camera.position));
	}
});
window.addEventListener("keyup", (e) => (keyboard[e.key] = false));
window.addEventListener("mousewheel", (e) => {
	if ((<WheelEvent>e).deltaY > 0) camera.position.z *= 1.1;
	else camera.position.z /= 1.1;
	localStorage.setItem("camera", JSON.stringify(camera.position));
});
window.addEventListener("mousedown", () => (pause = true));
window.addEventListener("mouseup", () => (pause = false));

window.addEventListener("resize", () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

// Mesh object
let obj: Object3D & { update?: () => void };

const hasUpdate = (obj: Object3D): obj is Object3D & { update: () => void } =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	typeof (<any>obj).update === "function";

// const remakeObjects = () => {

// }

function render() {
	requestAnimationFrame(render);
	if (!pause)
		for (const child of scene.children)
			if (hasUpdate(child)) child.update();

	if (keyboard.ArrowLeft || keyboard.a)
		camera.position.x -= 0.02 * camera.position.z;
	if (keyboard.ArrowRight || keyboard.d)
		camera.position.x += 0.02 * camera.position.z;
	if (keyboard.ArrowUp || keyboard.w)
		camera.position.y += 0.02 * camera.position.z;
	if (keyboard.ArrowDown || keyboard.s)
		camera.position.y -= 0.02 * camera.position.z;

	if (
		keyboard.ArrowLeft ||
		keyboard.a ||
		keyboard.ArrowRight ||
		keyboard.d ||
		keyboard.ArrowUp ||
		keyboard.w ||
		keyboard.ArrowDown ||
		keyboard.s
	)
		localStorage.setItem("camera", JSON.stringify(camera.position));

	renderer.render(scene, camera);
}

render();

export const changeConstructor = (Klass: typeof Object3D): void => {
	const oldZ = obj?.rotation.z;
	if (obj) scene.remove(obj);

	obj = new Klass();
	obj.rotation.z = oldZ ?? 0;
	obj.update = () => (obj.rotation.z += 0.005);
	scene.add(obj);
};
