import type { BufferGeometry, Vector3 } from "three";
import { Color } from "three";

import type Builder from "./Builder.js";
import { getColorAttribute, getVertexCount } from "./utils.js";

export type Variation = (value: number) => number;

export default class Randomizer {
	private geometry: BufferGeometry;
	private builder: Builder;

	constructor(geometry: BufferGeometry, builder: Builder) {
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
		geometry: BufferGeometry,
		color: Color,
		variation = this.spreader(),
	): BufferGeometry {
		// Shift the entire geometry
		color = this.colorSpread(color, variation);

		const vertices = getVertexCount(geometry);
		const colorAttribute = getColorAttribute(geometry);
		for (let i = 0; i < vertices; i += 3) {
			const vertexColor = this.colorSpread(color, variation);
			colorAttribute.setXYZ(
				i,
				vertexColor.r,
				vertexColor.g,
				vertexColor.b,
			);
			colorAttribute.setXYZ(
				i + 1,
				vertexColor.r,
				vertexColor.g,
				vertexColor.b,
			);
			colorAttribute.setXYZ(
				i + 2,
				vertexColor.r,
				vertexColor.g,
				vertexColor.b,
			);
		}

		return geometry;
	}

	colorize(color: Color, variation: Variation): Randomizer {
		Randomizer.colorize(this.geometry, color, variation);
		return this;
	}

	// Nudges the entire geometry
	static translate(
		geometry: BufferGeometry,
		position?: Vector3,
		variation = this.spreader(),
	): BufferGeometry {
		return geometry.translate(
			variation(position?.x ?? 0),
			variation(position?.y ?? 0),
			variation(position?.z ?? 0),
		);
	}

	translate(position: Vector3, variation: Variation): Randomizer {
		Randomizer.translate(this.geometry, position, variation);
		return this;
	}

	static blur(geometry: BufferGeometry, degree = 0.01): BufferGeometry {
		geometry.computeBoundingBox();
		const positionAttribute = geometry.getAttribute("position");
		const vertexGroupsMap: number[][][][] = [];
		for (let i = 0; i < positionAttribute.count; i++) {
			const x = positionAttribute.getX(i);
			if (!vertexGroupsMap[x]) vertexGroupsMap[x] = [];
			const y = positionAttribute.getY(i);
			if (!vertexGroupsMap[x][y]) vertexGroupsMap[x][y] = [];
			const z = positionAttribute.getZ(i);
			if (!vertexGroupsMap[x][y][z]) vertexGroupsMap[x][y][z] = [];
			vertexGroupsMap[x][y][z].push(i);
		}
		const vertexGroups = Object.values(vertexGroupsMap).flatMap((v) =>
			Object.values(v).flatMap((v) => Object.values(v)),
		);

		for (const vertexGroup of vertexGroups) {
			const x = this.flatSpread(
				positionAttribute.getX(vertexGroup[0]),
				(geometry.boundingBox!.max.x - geometry.boundingBox!.min.x) *
					degree,
			);
			const y = this.flatSpread(
				positionAttribute.getY(vertexGroup[0]),
				(geometry.boundingBox!.max.y - geometry.boundingBox!.min.y) *
					degree,
			);
			const z = this.flatSpread(
				positionAttribute.getZ(vertexGroup[0]),
				(geometry.boundingBox!.max.z - geometry.boundingBox!.min.z) *
					degree,
			);
			for (const idx of vertexGroup)
				positionAttribute.setXYZ(idx, x, y, z);
		}

		return geometry;
	}

	blur(degree: number): Randomizer {
		Randomizer.blur(this.geometry, degree);
		return this;
	}

	// Rotates the entire geometry
	static rotate(
		geometry: BufferGeometry,
		rotation: Vector3,
		variation = Randomizer.spread,
	): BufferGeometry {
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
		geometry: BufferGeometry,
		scale: Vector3,
		variation = Randomizer.spread,
	): BufferGeometry {
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
		geometry: BufferGeometry,
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
	): BufferGeometry {
		if (colorize)
			this.colorize(geometry, colorize.color, colorize.variation);
		if (translate)
			this.translate(geometry, translate.position, translate.variation);
		if (blur) this.blur(geometry, blur);
		if (rotate) this.rotate(geometry, rotate.rotation, rotate.variation);

		return geometry;
	}
}
