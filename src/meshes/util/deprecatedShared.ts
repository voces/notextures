import {
	Math,
	CylinderGeometry,
	BoxGeometry,
	TetrahedronGeometry,
	DodecahedronGeometry,
	Color,
	Vector3,
	Geometry,
} from "three";
import Randomizer, { Variation } from "./Randomizer.js";

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
	geometry: Geometry,
	color: Color,
	colorVariation?: Variation,
): Geometry => {
	color = randColor(color, colorVariation);

	for (let i = 0; i < geometry.faces.length; i++)
		geometry.faces[i].color = randColor(color, colorVariation);

	return geometry;
};

const randomize = (
	geometry: Geometry,
	{
		color,
		// The position of each vertex
		vertexVariation,
	}: // The rotation of the entire geometry
	// rotation,
	// rotationVariation = nudge,
	{
		color?: Color;
		vertexVariation?: Variation;
	},
): Geometry => {
	if (color) randomizeColor(geometry, color);

	if (vertexVariation)
		for (let i = 0; i < geometry.vertices.length; i++) {
			geometry.vertices[i].x = vertexVariation(geometry.vertices[i].x);
			geometry.vertices[i].y = vertexVariation(geometry.vertices[i].y);
			geometry.vertices[i].z = vertexVariation(geometry.vertices[i].z);
		}

	// if (rotation)
	// 	geometry.lookAt(
	// 		new Vector3(
	// 			rotationVariation(rotation.x || 0),
	// 			rotationVariation(rotation.y || 0),
	// 			rotationVariation(rotation.z || 0),
	// 		),
	// 	);

	const positionVariation = nudge;
	((geometry as unknown) as { position: Vector3 }).position = new Vector3(
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
}): Geometry =>
	randomize(
		new CylinderGeometry(
			radius * (1 + Math.randFloatSpread(radius / 16)),
			radius * (1 + Math.randFloatSpread(radius / 16)),
			length * (1 + Math.randFloatSpread(length / 16)),
		),
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
}): Geometry => randomize(new BoxGeometry(width, height, depth), { color });

export const tetrahedron = ({
	radius,
	detail,
	color,
	vertexVariation,
}: {
	radius: number;
	detail: number;
	color: Color;
	vertexVariation: Variation;
}): Geometry =>
	randomize(new TetrahedronGeometry(radius, detail), {
		color,
		vertexVariation,
	});

export const dodecahedron = ({
	radius,
	vertexVariation,
	color,
}: {
	radius: number;
	vertexVariation: Variation;
	color: Color;
}): Geometry =>
	randomize(new DodecahedronGeometry(radius), { vertexVariation, color });
