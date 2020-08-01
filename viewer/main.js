import scene from "./scene.js";
import * as NoTextures from "../dist/bundle.js";

const meshList = document.getElementById("mesh-list");

let obj;

const load = () => {
	const oldZ = obj?.rotation.z;
	if (obj) scene.remove(obj);
	obj = new NoTextures[location.hash.slice(1)]();
	obj.rotation.z = oldZ ?? 0;
	obj.update = () => (obj.rotation.z += 0.01);
	scene.add(obj);
};

Object.values(NoTextures).forEach((klass) => {
	const li = document.createElement("li");
	const a = document.createElement("a");
	a.setAttribute("href", `#${klass.name}`);
	a.textContent = klass.name;
	li.appendChild(a);
	li.addEventListener("click", () => setTimeout(load, 0));
	meshList.appendChild(li);
});

if (!location.hash) location.hash = "Barn"; // something

load();

// window.addEventListener("hashchange", load);
