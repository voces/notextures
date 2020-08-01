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
} from "three";

export const scene = new Scene();

// Camera
const camera = new PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
);
camera.position.z = 2;
camera.position.y = -1.5;
camera.rotation.x = 0.7;

// Light
const light = new HemisphereLight(0xffffbb, 0x080820, 2);
scene.add(light);

// Ground
const geometry = new PlaneBufferGeometry(16, 16, 4, 4);
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
scene.add(plane);

// Renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera movements
const keyboard: Record<string, boolean> = {};
let pause = false;
window.addEventListener("keydown", (e) => (keyboard[e.key] = true));
window.addEventListener("keyup", (e) => (keyboard[e.key] = false));
window.addEventListener("mousewheel", (e) => {
	if ((<WheelEvent>e).deltaY > 0) camera.position.z *= 1.1;
	else camera.position.z /= 1.1;
});
window.addEventListener("mousedown", () => (pause = true));
window.addEventListener("mouseup", () => (pause = false));

window.addEventListener("resize", () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

const hasUpdate = (obj: Object3D): obj is Object3D & { update: () => void } =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	typeof (<any>obj).update === "function";

function render() {
	requestAnimationFrame(render);
	if (!pause)
		for (const child of scene.children)
			if (hasUpdate(child)) child.update();

	if (keyboard.ArrowLeft) camera.position.x -= 0.02 * camera.position.z;
	if (keyboard.ArrowRight) camera.position.x += 0.02 * camera.position.z;
	if (keyboard.ArrowUp) camera.position.y += 0.02 * camera.position.z;
	if (keyboard.ArrowDown) camera.position.y -= 0.02 * camera.position.z;

	renderer.render(scene, camera);
}

render();
