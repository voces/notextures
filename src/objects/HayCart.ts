import { Mesh, Vector2, Color } from "three";
import { wood } from "../colors.js";
import Builder from "./util/Builder.js";
import Randomizer from "./util/Randomizer.js";
import { faceColorMaterial } from "../materials.js";

const HAY = new Color("#e4d96f");

export class HayCart extends Mesh {
	constructor() {
		const color = Randomizer.colorSpread(wood);
		const wheels = Randomizer.colorSpread(color);
		const axis = Randomizer.colorSpread(color);
		const basket = Randomizer.colorSpread(color);
		const hay = Randomizer.colorSpread(HAY);

		const geometry = new Builder()
			// Wheels
			.repeat(2, (b, x) =>
				b
					.cylinder(1 / 4, 1 / 4, 1 / 16)
					.translate(x, 0, 7 / 32)
					.rotateZ(Math.PI / 2)
					.color(wheels),
			)
			// Axis
			.cylinder(1 / 32, 1 / 32, 1)
			.rotateZ(Math.PI / 2)
			.translateZ(7 / 32)
			.color(axis)
			.parent! // Base
			.box(1 / 2, 1 / 2, 1 / 32)
			.translateZ(1 / 4)
			.color(basket)
			.parent! // Walls
			.thickLathe(
				[
					new Vector2(
						2 / 4 / Math.SQRT2,
						1 / 4 / Math.SQRT2 + 1 / 16,
					),
					new Vector2(
						3 / 4 / Math.SQRT2,
						1 / 2 / Math.SQRT2 + 1 / 16,
					),
				],
				1 / 32,
				new Vector2(-1, 0),
				4,
				Math.PI / 4,
			)
			.rotateX(Math.PI / 2)
			.color(basket)
			.parent! // Handles
			.repeat(2, (b, x) =>
				b
					.cylinder(1 / 64, 1 / 64, 1)
					.translate((x * 47) / 64, -1 / 8, 1 / 2 - 1 / 16 - 1 / 64)
					.color(axis),
			)
			// Hay
			.for(3, (b, z) =>
				b
					.sphere(
						1 / 3 - z / 24,
						8,
						6,
						0,
						Math.PI * 2,
						0,
						Math.PI / 2,
					)
					.rotateX(Math.PI / 2)
					.translateZ(
						1 / 4 +
							Array(z)
								.fill(0)
								.reduce(
									(sum, _, i) => sum + (1 / 3 - i / 24) / 2,
									0,
								),
					)
					.color(hay),
			)
			.root()
			.randomize()
			.buffer();

		super(geometry, faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
