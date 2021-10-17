import type { Color } from "three";
import { MathUtils, Mesh } from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

import { wood } from "../colors.js";
import { faceColorMaterial } from "../materials.js";
import { box, cylinder, nudge, randColor } from "./util/deprecatedShared.js";
import type { Variation } from "./util/Randomizer.js";
import Randomizer from "./util/Randomizer.js";

export class BrokenWheelbarrow extends Mesh {
	constructor({
		color: inColor,
		colorVariation = nudge,
	}: { color?: Color; colorVariation?: Variation } = {}) {
		const color = inColor ?? randColor(wood, colorVariation);

		// let geometry = createBufferGeometry();

		const wheel = (x: number) =>
			cylinder({ length: 1 / 16, radius: 1 / 4, color: randColor(color) })
				.rotateX(nudge(Math.PI / 2))
				.translate(nudge(x), nudge(1 / 2), 1 / 64);

		const leftWheel = wheel(-3 / 5);
		const rightWheel = wheel(3 / 5);

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
		const leftCorner = corner(-3 / 8, 1 / 2);
		const rightCorner = corner(3 / 8, 1 / 2);

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
		const leftSupport = support(-3 / 8);
		const rightSupport = support(3 / 8);

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
		const bottomPlank1 = plank(-3 / 9);
		const bottomPlank2 = plank(-1 / 9);
		const bottomPlank3 = plank(1 / 9);
		const bottomPlank4 = plank(3 / 9);

		// Left and ride sides
		const leftSide1 = plank()
			.rotateY(Math.PI / 2)
			.translate(-3 / 9, 0, 3 / 16);
		const leftSide2 = plank()
			.rotateY(Math.PI / 2)
			.translate(-3 / 9, 0, 7 / 16);
		const rightSide1 = plank()
			.rotateY(Math.PI / 2)
			.translate(3 / 9, 0, 3 / 16);
		const rightSide2 = plank()
			.rotateY(Math.PI / 2)
			.translate(3 / 9, 0, 7 / 16);

		// Front and back sides
		const frontSide = plank(0, false)
			.rotateY(Math.PI / 2)
			.rotateZ(Math.PI / 2)
			.translate(0, 1 / 2, 0);
		const backSide1 = plank(0, false)
			.rotateY(Math.PI / 2)
			.rotateZ(Math.PI / 2)
			.translate(0, 1 / 2, 7 / 32);
		const backSide2 = plank(0, false)
			.rotateY(Math.PI / 2)
			.rotateZ(Math.PI / 2)
			.translate(0, 1 / 2, 14 / 32);

		const back1 = plank(0, false)
			.rotateY(Math.PI / 2)
			.rotateZ(Math.PI / 2)
			.translate(0, -1 / 2, 0);
		const back2 = plank(0, false)
			.rotateY(Math.PI / 2)
			.rotateZ(Math.PI / 2)
			.translate(0, -1 / 2, 7 / 32);
		const back3 = plank(0, false)
			.rotateY(Math.PI / 2)
			.rotateZ(Math.PI / 2)
			.translate(0, -1 / 2, 14 / 32);
		const back4 = corner(-3 / 8, -1 / 2);
		const back5 = corner(3 / 8, -1 / 2);
		const back = mergeBufferGeometries([back1, back2, back3, back4, back5]);
		back.center()
			.rotateX(Math.PI / 2)
			.rotateZ(Math.PI / 4)
			.translate(1 / 4, -7 / 8, 0);

		const handles = (x: number) =>
			box({
				width: 1 / 16,
				height: 3 / 4,
				depth: 1 / 16,
				color: randColor(color),
			}).translate(x, -1 / 2 - 3 / 4 / 2, 0);

		// Handles
		const handle1 = handles(-3 / 8);
		const handle2 = handles(3 / 8);

		const geometry = mergeBufferGeometries([
			leftWheel,
			rightWheel,
			leftCorner,
			rightCorner,
			leftSupport,
			rightSupport,
			bottomPlank1,
			bottomPlank2,
			bottomPlank3,
			bottomPlank4,
			leftSide1,
			leftSide2,
			rightSide1,
			rightSide2,
			frontSide,
			backSide1,
			backSide2,
			handle1,
			handle2,
			back,
		]);

		// geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		geometry.rotateZ(Randomizer.flatSpread(Math.PI / 2, Math.PI / 16));

		super(geometry, faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
