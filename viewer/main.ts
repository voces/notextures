import { Mesh } from "three";
import { scene } from "./scene.js";
import * as NoTextures from "../src/index";

const meshList = document.getElementById("mesh-list")!;

const keys = Object.keys(NoTextures);
const isMeshKey = (key: string): key is keyof typeof NoTextures =>
	keys.includes(key);

let obj: Mesh & { update?: () => void };
let selected: HTMLElement;

const load = (klass: string) => {
	if (!isMeshKey(klass)) return;
	const oldZ = obj?.rotation.z;
	if (obj) scene.remove(obj);
	if (selected) selected.classList.remove("selected");

	obj = new NoTextures[klass]();
	obj.rotation.z = oldZ ?? 0;
	obj.update = () => (obj.rotation.z += 0.005);
	scene.add(obj);
};

Object.values(NoTextures).forEach((klass) => {
	const li = document.createElement("li");
	const a = document.createElement("a");
	a.setAttribute("href", `#${klass.name}`);
	a.textContent = klass.name;
	li.appendChild(a);
	li.addEventListener("click", () => {
		setTimeout(() => load(klass.name), 0);
	});
	meshList.appendChild(li);
});

if (!location.hash) location.hash = "Barn"; // something
load(location.hash.slice(1));
