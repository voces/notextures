import {
	Math as Math2,
	Mesh,
	Geometry,
	MeshPhongMaterial,
	FaceColors,
	Color,
} from "three";
import { stone } from "../colors.js";
import {
	dodecahedron,
	tetrahedron,
	randColor,
	colorNudge,
} from "./util/deprecatedShared.js";
import Randomizer, { Variation } from "./util/Randomizer.js";

export default class RockChunks extends Mesh {
	constructor({
		color: inColor,
		colorVariation = colorNudge,
	}: { color?: Color; colorVariation?: Variation } = {}) {
		const color = inColor ?? randColor(stone, colorVariation);

		const geometry = new Geometry();
		const material = new MeshPhongMaterial({
			vertexColors: FaceColors,
			flatShading: true,
		});

		const base = dodecahedron({
			radius: 1,
			color: randColor(color, colorVariation),
			vertexVariation: Randomizer.flatSpreader(1 / 4),
		});
		base.rotateX(Math.PI / 2);
		base.rotateZ(Math2.randFloatSpread(Math.PI));
		base.translate(0, 0, 3 / 8);
		geometry.merge(base);

		const fallenChunks = Math2.randInt(0, 3);
		for (let i = 0; i < fallenChunks; i++) {
			const chunk = tetrahedron({
				radius: 1 / 3,
				detail: Math2.randInt(0, 1),
				color: randColor(color, colorVariation),
				vertexVariation: Randomizer.flatSpreader(1 / 4),
			});
			const angle = Math2.randFloatSpread(2 * Math.PI);
			const dist = Math2.randFloat(1, 5 / 4);
			chunk.translate(
				dist * Math.cos(angle),
				dist * Math.sin(angle),
				1 / 10,
			);
			geometry.merge(chunk);
		}

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		super(geometry, material);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
