import { Mesh, Vector2, Color, BufferGeometry } from "three";
import { wood } from "../colors.js";
import Builder from "./util/Builder.js";
import Randomizer from "./util/Randomizer.js";
import { faceColorMaterial } from "../materials.js";

const HAY = new Color("#e4d96f");

export class BrokenHayCart extends Mesh {
	constructor() {
		const color = Randomizer.colorSpread(wood);
		const wheels = Randomizer.colorSpread(color);
		const axis = Randomizer.colorSpread(color);
		const basket = Randomizer.colorSpread(color);
		const hay = Randomizer.colorSpread(HAY);

		const brokenWheel = -0.5;

		const geometry = new Builder()
			// Wheels
			.repeat(2, (b, x) => {
				const wheel = b
					.cylinder(1 / 4, 1 / 4, 1 / 16)
					.translate(x, 0, 7 / 32)
					.rotateZ(Math.PI / 2)
					.color(wheels);

				if (x === brokenWheel) {
					wheel.rotateX(Math.PI / 2);
					1 + 1;
					wheel.translateZ(-6 / 32);
				}
			})
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
					.rotate(
						...(x === brokenWheel
							? [
									Randomizer.flatSpread(0, 1 / 5),
									Randomizer.flatSpread(0, 1 / 5),
									Randomizer.flatSpread(0, 1 / 5),
							  ]
							: []),
					)
					.color(axis),
			)
			.root()
			.rotateY(brokenWheel < 0 ? -Math.PI / 8 : Math.PI / 8)
			.rotateX(Math.PI / 8)
			.randomize()
			.geometry();

		// Hay
		geometry.merge(
			new Builder()
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
						.translate(
							Randomizer.flatSpread(-5 / 16, 1 / 4),
							Randomizer.flatSpread(-5 / 16, 1 / 4),
						)
						.color(hay),
				)
				.root()
				.randomize()
				.geometry(),
		);

		super(new BufferGeometry().fromGeometry(geometry), faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
