import { Color, ConeGeometry, CylinderGeometry, MathUtils, Mesh } from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";

import { faceColorMaterial } from "../materials";
import Builder from "./util/Builder";
import { colorFace, getFaceCount } from "./util/utils";

const TRUNK_COLOR = new Color(0x483d19);
const LEAVES_COLOR = new Color(0x026e2d);

const createTrunk = ({
	radius,
	height,
	color,
}: {
	radius: number;
	height: number;
	color: Color;
}) =>
	new Builder()
		.cylinder(radius / 16, radius / 10, height / 3)
		.color(color)
		.rotateX(Math.PI / 2)
		.rotateZ(Math.PI * Math.random())
		.translateZ(height / 8)
		.parent!.geometry();

const createShelfs = ({
	height,
	radius,
	shelfs,
	color,
}: {
	height: number;
	radius: number;
	shelfs: number;
	color: Color;
}) => {
	let shelfRadius =
		(((height * radius) / shelfs) * (Math.random() + 4)) / 300;
	const shelfRadiusGrowth = height / shelfs / 10;

	// const geometry = new Geometry();

	let Class: typeof ConeGeometry | typeof CylinderGeometry = ConeGeometry;

	const xTilt = MathUtils.randFloatSpread(height / 20);
	const yTilt = MathUtils.randFloatSpread(height / 20);

	const shelfGeometries = [];
	for (let i = 0; i < shelfs; i++) {
		// Adjust shelf
		color.offsetHSL(
			MathUtils.randFloatSpread(1 / 16),
			MathUtils.randFloatSpread(1 / 2),
			MathUtils.randFloatSpread(1 / 12),
		);

		const args = [
			(shelfRadius +=
				Math.random() * shelfRadiusGrowth + radius / shelfs / 5),
			shelfRadius * (Class === CylinderGeometry ? 1.5 * 0.9 : 2 * 0.9),
		];
		if (Class === CylinderGeometry) args.unshift(args[0] / 6);

		const shelf = new Class(...args).toNonIndexed();

		if (Class === ConeGeometry) Class = CylinderGeometry;

		const faces = getFaceCount(shelf);
		for (let i = 0; i < faces; i++)
			colorFace(
				shelf,
				i,
				color
					.clone()
					.offsetHSL(MathUtils.randFloatSpread(1 / 24), 0, 0),
			);

		// todo: does this do anything?
		((shelf as unknown) as { radius: number }).radius = shelfRadius;
		((shelf as unknown) as { height: number }).height = shelfRadius * 2;

		height -= (shelfRadius ** 0.65 / shelfs) * (Math.random() / 3 + 2.5);

		shelf.rotateX(Math.PI / 2);
		shelf.rotateZ(Math.PI * Math.random());
		shelf.rotateY(MathUtils.randFloatSpread(1 / 6));
		shelf.translate(
			(shelfs - i) ** 0.75 * xTilt,
			(shelfs - i) ** 0.75 * yTilt,
			height,
		);
		shelfGeometries.push(shelf);
	}

	return shelfGeometries;
};

export class PineTree extends Mesh {
	constructor({
		scale = 1,
		height = Math.random() + 3,
		radius = Math.random() / 4 + 3,
		shelfs = undefined,
		trunk = TRUNK_COLOR.clone().offsetHSL(
			MathUtils.randFloatSpread(1 / 24),
			0,
			0,
		),
		leaves = LEAVES_COLOR.clone().offsetHSL(
			MathUtils.randFloatSpread(1 / 24),
			0,
			0,
		),
	}: {
		scale?: number;
		height?: number;
		radius?: number;
		shelfs?: number;
		trunk?: Color;
		leaves?: Color;
	} = {}) {
		height = height * scale;
		radius = radius * scale;

		// If height is >3.33, 50% chance of 4 vs 3 shelves; <3.33 is always 3
		if (shelfs === undefined)
			shelfs = height > 10 / 3 ? 3 + (Math.random() > 0.5 ? 1 : 0) : 3;

		const geometry = BufferGeometryUtils.mergeBufferGeometries([
			createTrunk({ radius, height, color: trunk }),
			...createShelfs({ height, radius, shelfs, color: leaves }),
		]);

		// geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		super(geometry, faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
