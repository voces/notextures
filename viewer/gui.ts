import { GUI } from "dat.gui";

export const params = {
	width: 1,
	height: 1,
	spacing: 1,
};

const gui = new GUI();
gui.add(params, "width", 1, 100, 1);
gui.add(params, "height", 1, 100, 1);
gui.add(params, "spacing", 0, 10);
