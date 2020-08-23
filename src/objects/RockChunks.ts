import { MathUtils, Mesh, Geometry, Color, BufferGeometry } from "three";
import { stone } from "../colors.js";
import {
	colorNudge,
	dodecahedron,
	randColor,
	tetrahedron,
} from "./util/deprecatedShared.js";
import Randomizer, { Variation } from "./util/Randomizer.js";
import { faceColorMaterial } from "../materials.js";

export class RockChunks extends Mesh {
	constructor({
		color: inColor,
		colorVariation = colorNudge,
	}: { color?: Color; colorVariation?: Variation } = {}) {
		const color = inColor ?? randColor(stone, colorVariation);

		const geometry = new Geometry();

		const base = dodecahedron({
			radius: 1,
			color: randColor(color, colorVariation),
			vertexVariation: Randomizer.flatSpreader(1 / 4),
		});
		base.rotateX(Math.PI / 2);
		base.rotateZ(MathUtils.randFloatSpread(Math.PI));
		base.translate(0, 0, 3 / 8);
		geometry.merge(base);

		const fallenChunks = MathUtils.randInt(0, 3);
		for (let i = 0; i < fallenChunks; i++) {
			const chunk = tetrahedron({
				radius: 1 / 3,
				detail: MathUtils.randInt(0, 1),
				color: randColor(color, colorVariation),
				vertexVariation: Randomizer.flatSpreader(1 / 4),
			});
			const angle = MathUtils.randFloatSpread(2 * Math.PI);
			const dist = MathUtils.randFloat(1, 5 / 4);
			chunk.translate(
				dist * Math.cos(angle),
				dist * Math.sin(angle),
				1 / 10,
			);
			geometry.merge(chunk);
		}

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		super(new BufferGeometry().fromGeometry(geometry), faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
