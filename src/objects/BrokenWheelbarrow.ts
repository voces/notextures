import { MathUtils, Mesh, Geometry, Color, BufferGeometry } from "three";
import { wood } from "../colors.js";
import { box, cylinder, randColor, nudge } from "./util/deprecatedShared.js";
import Randomizer, { Variation } from "./util/Randomizer.js";
import { faceColorMaterial } from "../materials.js";

export class BrokenWheelbarrow extends Mesh {
	constructor({
		color: inColor,
		colorVariation = nudge,
	}: { color?: Color; colorVariation?: Variation } = {}) {
		const color = inColor ?? randColor(wood, colorVariation);

		const geometry = new Geometry();

		const wheel = (x: number) =>
			cylinder({ length: 1 / 16, radius: 1 / 4, color: randColor(color) })
				.rotateX(nudge(Math.PI / 2))
				.translate(nudge(x), nudge(1 / 2), 1 / 64);

		geometry.merge(wheel(-3 / 5));
		geometry.merge(wheel(3 / 5));

		const corner = (x: number, y: number) =>
			box({
				width: 1 / 16,
				height: 1 / 2,
				depth: 2 / 16,
				color: randColor(color),
			})
				.rotateX(Math.PI / 2)
				.translate(x, y, 1 / 4);

		// Corners
		geometry.merge(corner(-3 / 8, 1 / 2));
		geometry.merge(corner(3 / 8, 1 / 2));

		const support = (x: number) =>
			box({
				width: 1 / 16,
				height: 1 / 2,
				depth: 1 / 16,
				color: randColor(color),
			})
				.rotateX(Math.PI / 2)
				.translate(x, 0, 1 / 4);

		// Two vertical supports
		geometry.merge(support(-3 / 8));
		geometry.merge(support(3 / 8));

		const plank = (x = 0, long = true) =>
			box({
				width: 2 / 16,
				height: long ? 1 : 3 / 4,
				depth: 1 / 16,
				color: randColor(color),
			})
				.rotateZ(MathUtils.randFloatSpread(1 / 12))
				.translate(x, 0, 0);

		// Bottom
		geometry.merge(plank(-3 / 9));
		geometry.merge(plank(-1 / 9));
		geometry.merge(plank(1 / 9));
		geometry.merge(plank(3 / 9));

		// Left and ride sides
		geometry.merge(
			plank()
				.rotateY(Math.PI / 2)
				.translate(-3 / 9, 0, 3 / 16),
		);
		geometry.merge(
			plank()
				.rotateY(Math.PI / 2)
				.translate(-3 / 9, 0, 7 / 16),
		);
		geometry.merge(
			plank()
				.rotateY(Math.PI / 2)
				.translate(3 / 9, 0, 3 / 16),
		);
		geometry.merge(
			plank()
				.rotateY(Math.PI / 2)
				.translate(3 / 9, 0, 7 / 16),
		);

		// Front and back sides
		geometry.merge(
			plank(0, false)
				.rotateY(Math.PI / 2)
				.rotateZ(Math.PI / 2)
				.translate(0, 1 / 2, 0),
		);
		geometry.merge(
			plank(0, false)
				.rotateY(Math.PI / 2)
				.rotateZ(Math.PI / 2)
				.translate(0, 1 / 2, 7 / 32),
		);
		geometry.merge(
			plank(0, false)
				.rotateY(Math.PI / 2)
				.rotateZ(Math.PI / 2)
				.translate(0, 1 / 2, 14 / 32),
		);

		const back = new Geometry();
		back.merge(
			plank(0, false)
				.rotateY(Math.PI / 2)
				.rotateZ(Math.PI / 2)
				.translate(0, -1 / 2, 0),
		);
		back.merge(
			plank(0, false)
				.rotateY(Math.PI / 2)
				.rotateZ(Math.PI / 2)
				.translate(0, -1 / 2, 7 / 32),
		);
		back.merge(
			plank(0, false)
				.rotateY(Math.PI / 2)
				.rotateZ(Math.PI / 2)
				.translate(0, -1 / 2, 14 / 32),
		);
		back.merge(corner(-3 / 8, -1 / 2));
		back.merge(corner(3 / 8, -1 / 2));
		back.center()
			.rotateX(Math.PI / 2)
			.rotateZ(Math.PI / 4)
			.translate(1 / 4, -7 / 8, 0);
		geometry.merge(back);

		const handles = (x: number) =>
			box({
				width: 1 / 16,
				height: 3 / 4,
				depth: 1 / 16,
				color: randColor(color),
			}).translate(x, -1 / 2 - 3 / 4 / 2, 0);

		// Handles
		geometry.merge(handles(-3 / 8));
		geometry.merge(handles(3 / 8));

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		geometry.rotateZ(Randomizer.flatSpread(Math.PI / 2, Math.PI / 16));

		super(new BufferGeometry().fromGeometry(geometry), faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
