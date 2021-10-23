import type { BufferGeometry } from "three";
import {
	BoxGeometry,
	Color,
	CylinderGeometry,
	DodecahedronGeometry,
	MathUtils,
	TetrahedronGeometry,
	Vector3,
} from "three";

import type { Variation } from "./Randomizer.js";
import Randomizer from "./Randomizer.js";
import { getColorAttribute } from "./utils.js";

export const nudge = Randomizer.spreader(1 / 16, 1 / 4);

// We expect to ALWAYS have a base color
export const colorNudge = Randomizer.spreader(0, 1 / 24);

// We should clamp rgb to [0, 1]
export const randColor = (color: Color, colorVariation = colorNudge): Color =>
	new Color(
		colorVariation(color.r),
		colorVariation(color.g),
		colorVariation(color.b),
	);

const randomizeColor = (
	geometry: BufferGeometry,
	color: Color,
	colorVariation?: Variation,
): BufferGeometry => {
	const positionAttribute = geometry.getAttribute("position");
	const positions = positionAttribute.count;

	const colorAttribute = getColorAttribute(geometry);

	color = randColor(color, colorVariation);
	for (let i = 0; i < positions; i += 3) {
		const vertexColor = randColor(color, colorVariation);
		colorAttribute.setXYZ(i, vertexColor.r, vertexColor.g, vertexColor.b);
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
};

const randomize = (
	geometry: BufferGeometry,
	{
		color,
		// The position of each vertex
		vertexVariation,
	}: // The rotation of the entire geometry
	// rotation,
	// rotationVariation = nudge,
	{
		color?: Color;
		vertexVariation?: number;
	},
): BufferGeometry => {
	if (color) randomizeColor(geometry, color);

	if (vertexVariation) Randomizer.blur(geometry, vertexVariation);

	// if (rotation)
	// 	geometry.lookAt(
	// 		new Vector3(
	// 			rotationVariation(rotation.x || 0),
	// 			rotationVariation(rotation.y || 0),
	// 			rotationVariation(rotation.z || 0),
	// 		),
	// 	);

	const positionVariation = nudge;
	(geometry as unknown as { position: Vector3 }).position = new Vector3(
		positionVariation(0),
		positionVariation(0),
		positionVariation(0),
	);

	return geometry;
};

export const cylinder = ({
	length,
	radius,
	color,
}: {
	length: number;
	radius: number;
	color: Color;
}): BufferGeometry =>
	randomize(
		new CylinderGeometry(
			radius * (1 + MathUtils.randFloatSpread(radius / 16)),
			radius * (1 + MathUtils.randFloatSpread(radius / 16)),
			length * (1 + MathUtils.randFloatSpread(length / 16)),
		).toNonIndexed(),
		{ color },
	);

export const box = ({
	width,
	height,
	depth,
	color,
}: {
	width: number;
	height: number;
	depth: number;
	color: Color;
}): BufferGeometry =>
	randomize(new BoxGeometry(width, height, depth).toNonIndexed(), { color });

export const tetrahedron = ({
	radius,
	detail,
	color,
	vertexVariation,
}: {
	radius: number;
	detail: number;
	color: Color;
	vertexVariation: number;
}): BufferGeometry =>
	randomize(new TetrahedronGeometry(radius, detail).toNonIndexed(), {
		color,
		vertexVariation,
	});

export const dodecahedron = ({
	radius,
	vertexVariation,
	color,
}: {
	radius: number;
	vertexVariation: number;
	color: Color;
}): BufferGeometry =>
	randomize(new DodecahedronGeometry(radius).toNonIndexed(), {
		vertexVariation,
		color,
	});
