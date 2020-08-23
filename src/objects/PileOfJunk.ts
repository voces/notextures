import { Color, Curve, MathUtils, Mesh, Vector2, Vector3 } from "three";
import Builder from "./util/Builder.js";
import Randomizer from "./util/Randomizer.js";
import { cloth, rope, wood, stone } from "../colors.js";
import { faceColorMaterial } from "../materials.js";

// TODO: This has a lot of smaller geometries; we should pull them out to be reusable

type SimpleObject = {
	point: Vector2;
	radius: number;
};

const nearPoint = (objects: SimpleObject[], min: number) => {
	let spread = min;
	while (spread < Infinity) {
		const newPoint = new Vector2(
			MathUtils.randFloatSpread(spread),
			MathUtils.randFloatSpread(spread),
		);
		if (objects.length === 0) return newPoint;
		else {
			const minDistObject = objects.reduce(
				(min, test) =>
					newPoint.distanceTo(test.point) - min.radius - test.radius <
					newPoint.distanceTo(min.point) - min.radius - test.radius
						? test
						: min,
				{ point: new Vector2(Infinity, Infinity), radius: 0 },
			);

			if (
				minDistObject.point.distanceTo(newPoint) -
					minDistObject.radius -
					min >
				min
			)
				return newPoint;

			spread *= 1.05;
		}
	}
};

const spear = {
	radius: 1 / 128,
	builder: (b: Builder) =>
		b
			.cylinder(1 / 96, 1 / 96, 17 / 16)
			.translateY(17 / 32)
			.color(Randomizer.colorSpread(wood))
			.blur(0.01)
			.parent!.octahedron(1 / 32)
			.scale(4 / 7, 0, 2 / 5)
			.translateY(17 / 16)
			.color(Randomizer.colorSpread(stone))
			.blur(0.01)
			.parent!.rotate(
				MathUtils.randFloatSpread(1 / 8),
				MathUtils.randFloatSpread(1 / 8),
				MathUtils.randFloatSpread(1 / 8),
			),
};

const shortSpear = {
	radius: 1 / 128,
	builder: (b: Builder) =>
		b
			.cylinder(1 / 96, 1 / 96, 15 / 16)
			.translateY(15 / 32)
			.color(Randomizer.colorSpread(wood))
			.blur(0.01)
			.parent!.octahedron(1 / 32)
			.scale(4 / 7, 0, 2 / 5)
			.translateY(15 / 16)
			.color(Randomizer.colorSpread(stone))
			.blur(0.01)
			.parent!.rotate(
				MathUtils.randFloatSpread(1 / 8),
				MathUtils.randFloatSpread(1 / 8),
				MathUtils.randFloatSpread(1 / 8),
			),
};

class Helix extends Curve<Vector3> {
	length: number;
	height: number;
	bottomRadius: number;
	topRadius: number;

	constructor(
		length = Math.PI * 4,
		height = 2,
		bottomRadius = 1,
		topRadius = bottomRadius,
	) {
		super();

		this.length = length;
		this.height = height;
		this.bottomRadius = bottomRadius;
		this.topRadius = topRadius;
	}

	getPoint(t: number) {
		const lerp = MathUtils.lerp(this.bottomRadius, this.topRadius, t);

		return new Vector3(
			Math.cos(t * this.length) * lerp,
			Math.sin(t * this.length) * lerp,
			t * this.height,
		);
	}
}

const sword = {
	radius: 1 / 96,
	builder: (b: Builder) =>
		b
			.cylinder(1 / 96, 1 / 96, 15 / 16)
			.scale(2, 1, 1 / 4)
			.translateY(15 / 32)
			.parent!.cone(1 / 96, 2 / 96)
			.translateY(30 / 32 + 2 / 96 / 2)
			.scale(2, 1, 1 / 4)
			.parent!.cylinder(1 / 96, 1 / 96, 1 / 8)
			.rotateZ(Math.PI / 2)
			.color(wood)
			.parent!.cylinder(1 / 64 / 4, 1 / 96, 1 / 8)
			.parent!.tube(
				new Helix(Math.PI * 64, 1 / 16, 1 / 128, 1 / 96),
				256,
				1 / 1024,
			)
			.rotateX(Math.PI / 2)
			.color(rope)
			.parent!.rotateZ(Math.PI)
			.translateY(30 / 32 + 2 / 96)
			.rotateY(Math.PI * Math.random()),
};

const vaseContentTypes = [spear, shortSpear, sword];

const vase = {
	radius: 1 / 8,
	builder: (b: Builder) => {
		const count = MathUtils.randInt(0, 3);
		const objects: SimpleObject[] = [];
		return b
			.thickLathe([
				new Vector2(0, 0),
				new Vector2(1 / 16, 0),
				new Vector2(2 / 16, 1 / 32),
				new Vector2(3 / 16, 1 / 2),
				new Vector2(2 / 16, 24 / 32),
				new Vector2(3 / 32, 26 / 32),
			])
			.color(
				new Color().setHSL(
					Math.random(),
					MathUtils.randFloat(0.25, 0.8),
					MathUtils.randFloat(0.25, 0.75),
				),
			)
			.parent!.repeat(count, (b) => {
				const type =
					vaseContentTypes[
						Math.floor(Math.random() * vaseContentTypes.length)
					];
				const center2 = nearPoint(objects, type.radius);
				if (!center2) throw new Error();
				const center3 = new Vector3(center2.x, 0, center2.y);
				objects.push({ point: center2, radius: type.radius });
				type.builder(b.group()).translate(
					center3.x,
					center3.y,
					center3.z,
				);
			});
	},
};

const pot = {
	radius: 1 / 8,
	builder: (b: Builder) =>
		b
			.thickLathe([
				new Vector2(0, 0),
				new Vector2(1 / 16, 0),
				new Vector2(2 / 16, 1 / 64),
				new Vector2(3 / 16, 16 / 64),
				new Vector2(2 / 16, 24 / 64),
			])
			.color(
				new Color().setHSL(
					Math.random(),
					MathUtils.randFloat(0.25, 0.8),
					MathUtils.randFloat(0.25, 0.75),
				),
			),
};

const bag = {
	radius: 1 / 16,
	builder: (b: Builder) =>
		b
			.thickLathe([
				new Vector2(0, 0),
				new Vector2(1 / 32, 0),
				new Vector2(2 / 32, 1 / 64),
				new Vector2(3 / 32, 8 / 64),
				new Vector2(3 / 64, 13 / 64),
				new Vector2(1 / 128, 14 / 64),
				new Vector2(4 / 128, 16 / 64),
			])
			.color(
				Randomizer.colorSpread(cloth, Randomizer.flatSpreader(1 / 32)),
			),
};

const types = [vase, pot, bag];

export class PileOfJunk extends Mesh {
	constructor() {
		// Generate n dense points
		const count = MathUtils.randInt(3, 5);
		const objects: SimpleObject[] = [];

		const geometry = new Builder()
			.repeat(count, (b) => {
				const type = types[Math.floor(Math.random() * types.length)];
				const center = nearPoint(objects, type.radius);
				if (!center) throw new Error();
				objects.push({ point: center, radius: type.radius });
				const child = b.group();
				type.builder(child);
				child.rotateX(Math.PI / 2).translate(center.x, center.y);
			})
			.root()
			.buffer();

		super(geometry, faceColorMaterial);

		// this.scale.multiplyScalar( 9 );

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
