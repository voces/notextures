import scene from "./scene.js";
import * as NoTextures from "../dist/bundle.js";

const meshList = document.getElementById("mesh-list");

let obj, selected;

const load = (klass) => {
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
		setTimeout(load(klass.name), 0);
	});
	meshList.appendChild(li);
});

if (!location.hash) location.hash = "Barn"; // something
load(location.hash.slice(1));
