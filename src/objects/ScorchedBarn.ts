import { Mesh } from "three";

import { wood } from "../colors.js";
import { faceColorMaterial } from "../materials.js";
import Builder from "./util/Builder.js";
import Randomizer from "./util/Randomizer.js";

export class ScorchedBarn extends Mesh {
	constructor() {
		const color = Randomizer.colorSpread(
			wood.clone().offsetHSL(0, 0.1, -0.1),
		);
		const paneling = color.clone();
		const roof = color.clone().offsetHSL(0, -0.05, 0.05);

		const length = 15;
		const width = 11;
		const thickness = 1 / 32;

		const geometry = new Builder()
			// Front and back
			.repeat(2, (b, y) =>
				b.repeat(width, (b, x, _0, mid) => {
					if (Math.abs(x) <= 1) return;

					const angle = Math.acos(x / mid);
					const height =
						(1 / 2 + (Math.sin(angle) * 8) / length) *
						(Math.random() < 1 / 3 ? Math.random() : 1);

					b.box(1 / 8, thickness, height)
						.translate(x / 8, (y * length) / 8, height / 2)
						.color(paneling)
						.randomize(1 / 2);
				}),
			)
			// Sides
			.repeat(2, (b, x) =>
				b.repeat(length, (b, y) => {
					const height =
						(1 / 2) * (Math.random() < 0.5 ? Math.random() : 1);
					b.box(thickness, 1 / 8, height)
						.translate((x * width) / 8, y / 8, height / 2)
						.color(paneling)
						.randomize();
				}),
			)
			// Top
			.repeat(length + 1, (b, y) => {
				const leftShingles = Math.floor((width / 2) * Math.random());
				const rigthShingles = Math.floor((width / 2) * Math.random());
				b.repeat(width, (b, x, x2, mid) => {
					if (x < 0) if (x2 > leftShingles) return;
					if (x > 0) if (x2 > rigthShingles) return;
					if (x === 0)
						if (leftShingles !== mid && rigthShingles !== mid)
							return;

					const width = ((Math.PI / 2) * x) / mid;
					return b
						.box(
							thickness,
							1 / 8,
							((1 / 8 + thickness) * Math.PI) / 2,
						)
						.translate(
							Math.sin(width) * ((mid + 0.5) / 8 + thickness),
							y / 8,
							(9 / 4) * thickness +
								Math.abs(
									Math.cos(width) *
										((mid + 0.5) / 8 + thickness),
								),
						)
						.rotateY(-Math.acos(Math.sin(width)))
						.color(roof)
						.randomize();
				});
			})
			.rotateZ(-Math.PI / 4)
			.geometry();

		super(geometry, faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
