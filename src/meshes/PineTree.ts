import {
	MathUtils,
	Mesh,
	Geometry,
	CylinderGeometry,
	ConeGeometry,
	MeshPhongMaterial,
	Color,
} from "three";

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
}) => {
	const trunk = new CylinderGeometry(radius / 16, radius / 10, height / 3);

	for (let i = 0; i < trunk.faces.length; i++)
		trunk.faces[i].color = color
			.clone()
			.offsetHSL(MathUtils.randFloatSpread(1 / 36), 0, 0);

	trunk.rotateX(Math.PI / 2);
	trunk.rotateZ(Math.PI * Math.random());
	trunk.translate(0, 0, height / 8);

	return trunk;
};

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

	const geometry = new Geometry();

	let Class: typeof ConeGeometry | typeof CylinderGeometry = ConeGeometry;

	const xTilt = MathUtils.randFloatSpread(height / 20);
	const yTilt = MathUtils.randFloatSpread(height / 20);

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

		const shelf = new Class(...args);

		if (Class === ConeGeometry) Class = CylinderGeometry;

		for (let i = 0; i < shelf.faces.length; i++)
			shelf.faces[i].color = color
				.clone()
				.offsetHSL(MathUtils.randFloatSpread(1 / 24), 0, 0);

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
		geometry.merge(shelf);
	}

	return geometry;
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

		const geometry = new Geometry();
		const material = new MeshPhongMaterial({
			vertexColors: true,
			flatShading: true,
		});

		geometry.merge(createTrunk({ radius, height, color: trunk }));
		geometry.merge(createShelfs({ height, radius, shelfs, color: leaves }));

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		super(geometry, material);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
