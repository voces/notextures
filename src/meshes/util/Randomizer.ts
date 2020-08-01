import { Color, Geometry, Vector3 } from "three";
import Builder from "./Builder.js";

export type Variation = (value: number) => number;

export default class Randomizer {
	private geometry: Geometry;
	private builder: Builder;

	constructor(geometry: Geometry, builder: Builder) {
		this.geometry = geometry;
		this.builder = builder;
	}

	static flatSpread(value = 0, spread = 1 / 16): number {
		return value + (Math.random() - 0.5) * 2 * spread;
	}

	static flatSpreader(spread = 1 / 16) {
		return (v: number): number => v + (Math.random() - 0.5) * 2 * spread;
	}

	static percentSpread(value: number, spread = 1 / 32): number {
		return value * (1 + (Math.random() - 0.5) * 2 * spread);
	}

	static percentSpreader(spread = 1 / 32) {
		return (v: number): number =>
			v * (1 + (Math.random() - 0.5) * 2 * spread);
	}

	static spread(value: number, flat = 1 / 16, percent = 1 / 32): number {
		return (
			(value + (Math.random() - 0.5) * 2 * flat) *
			(1 + (Math.random() - 0.5) * 2 * percent)
		);
	}

	static spreader(flat = 1 / 16, percent = 1 / 32) {
		return (v: number): number =>
			// Base
			(v +
				// Flat
				(Math.random() - 0.5) * 2 * flat) *
			// Percent
			(1 + (Math.random() - 0.5) * 2 * percent);
	}

	static colorSpread(
		color: Color,
		variation = this.flatSpreader(1 / 32),
	): Color {
		return new Color(
			variation(color.r),
			variation(color.g),
			variation(color.b),
		);
	}

	static colorize(
		geometry: Geometry,
		color: Color,
		variation = this.spreader(),
	): Geometry {
		// Shift the entire geometry
		color = this.colorSpread(color, variation);

		for (let i = 0; i < geometry.faces.length; i++)
			geometry.faces[i].color = this.colorSpread(color, variation);

		return geometry;
	}

	colorize(color: Color, variation: Variation): Randomizer {
		Randomizer.colorize(this.geometry, color, variation);
		return this;
	}

	// Nudges the entire geometry
	static translate(
		geometry: Geometry,
		position?: Vector3,
		variation = this.spreader(),
	): Geometry {
		return geometry.translate(
			variation(position?.x || 0),
			variation(position?.y || 0),
			variation(position?.z || 0),
		);
	}

	translate(position: Vector3, variation: Variation): Randomizer {
		Randomizer.translate(this.geometry, position, variation);
		return this;
	}

	static blur(geometry: Geometry, degree = 0.01): Geometry {
		geometry.computeBoundingBox();

		for (let i = 0; i < geometry.vertices.length; i++) {
			geometry.vertices[i].x = this.flatSpread(
				geometry.vertices[i].x,
				(geometry.boundingBox!.max.x - geometry.boundingBox!.min.x) *
					degree,
			);
			geometry.vertices[i].y = this.flatSpread(
				geometry.vertices[i].y,
				(geometry.boundingBox!.max.y - geometry.boundingBox!.min.y) *
					degree,
			);
			geometry.vertices[i].z = this.flatSpread(
				geometry.vertices[i].z,
				(geometry.boundingBox!.max.z - geometry.boundingBox!.min.z) *
					degree,
			);
		}

		return geometry;
	}

	blur(degree: number): Randomizer {
		Randomizer.blur(this.geometry, degree);
		return this;
	}

	// Rotates the entire geometry
	static rotate(
		geometry: Geometry,
		rotation: Vector3,
		variation = Randomizer.spread,
	): Geometry {
		geometry.rotateX(variation(rotation.x));
		geometry.rotateY(variation(rotation.y));
		geometry.rotateZ(variation(rotation.z));

		return geometry;
	}

	rotate(rotation: Vector3, variation?: Variation): Randomizer {
		Randomizer.rotate(this.geometry, rotation, variation);
		return this;
	}

	static scale(
		geometry: Geometry,
		scale: Vector3,
		variation = Randomizer.spread,
	): Geometry {
		geometry.scale(
			variation(scale.x || 1),
			variation(scale.y || 1),
			variation(scale.z || 1),
		);

		return geometry;
	}

	scale(scale: Vector3, variation?: Variation): Randomizer {
		Randomizer.scale(this.geometry, scale, variation);
		return this;
	}

	static randomize(
		geometry: Geometry,
		{
			colorize,
			translate,
			blur,
			rotate,
		}: {
			colorize?: { color: Color; variation?: Variation };
			translate?: { position: Vector3; variation?: Variation };
			blur?: number;
			rotate?: { rotation: Vector3; variation?: Variation };
		} = {},
	): Geometry {
		if (colorize)
			this.colorize(geometry, colorize.color, colorize.variation);
		if (translate)
			this.translate(geometry, translate.position, translate.variation);
		if (blur) this.blur(geometry, blur);
		if (rotate) this.rotate(geometry, rotate.rotation, rotate.variation);

		return geometry;
	}
}
