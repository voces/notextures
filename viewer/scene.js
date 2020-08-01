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
	VertexColors,
	WebGLRenderer,
} from "../node_modules/three/build/three.module.js";

const scene = new Scene();

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
	vertexColors: VertexColors,
	shininess: 0,
	side: DoubleSide,
});
const plane = new Mesh(geometry, material);
scene.add(plane);

// Renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function render() {
	requestAnimationFrame(render);

	for (let i = 0; i < scene.children.length; i++)
		if (typeof scene.children[i].update === "function")
			scene.children[i].update();

	renderer.render(scene, camera);
}

render();

export default scene;
