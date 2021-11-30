import { GUI } from "dat.gui";

const maybeParseJson = (value: string | null) => {
	if (!value) return;
	try {
		return JSON.parse(value);
	} catch {
		/* return nothing */
	}
};

export const params = {
	width: 1,
	height: 1,
	spacing: 1,
	background: "#444",
	...maybeParseJson(localStorage.getItem("notextures.params")),
};

const gui = new GUI();
gui.add(params, "width", 1, 100, 1);
gui.add(params, "height", 1, 100, 1);
gui.add(params, "spacing", 0, 10);
gui.addColor(params, "background");
