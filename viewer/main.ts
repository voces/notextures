import meshes from "./objects";
import { remakeObjects } from "./scene";

const meshList = document.getElementById("mesh-list")!;

const keys = Object.keys(meshes);
const isMeshKey = (key: string): key is keyof typeof meshes =>
	keys.includes(key);

let selected: HTMLElement;

const load = (klass: string) => {
	if (!isMeshKey(klass)) return;
	if (selected) selected.classList.remove("selected");

	remakeObjects(() => new meshes[klass]());
};

Object.values(meshes)
	.sort((a, b) => a.name.localeCompare(b.name))
	.forEach((klass) => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.setAttribute("href", `#${klass.name}`);
		a.textContent = klass.name;
		li.appendChild(a);
		a.addEventListener("click", () => {
			setTimeout(() => load(klass.name), 0);
		});
		meshList.appendChild(li);
	});

if (!location.hash) location.hash = "Barn"; // something
load(location.hash.slice(1));
