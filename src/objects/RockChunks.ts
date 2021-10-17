import type { Color } from "three";
import { MathUtils, Mesh } from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

import { stone } from "../colors.js";
import { faceColorMaterial } from "../materials.js";
import {
	colorNudge,
	dodecahedron,
	randColor,
	tetrahedron,
} from "./util/deprecatedShared.js";
import type { Variation } from "./util/Randomizer.js";

export class RockChunks extends Mesh {
	constructor({
		color: inColor,
		colorVariation = colorNudge,
	}: { color?: Color; colorVariation?: Variation } = {}) {
		const color = inColor ?? randColor(stone, colorVariation);

		const base = dodecahedron({
			radius: 1,
			color: randColor(color, colorVariation),
			vertexVariation: 1 / 8,
		});
		base.rotateX(Math.PI / 2);
		base.rotateZ(MathUtils.randFloatSpread(Math.PI));
		base.translate(0, 0, 3 / 8);

		const fallenChunks = MathUtils.randInt(0, 3);
		const chunks = [];
		for (let i = 0; i < fallenChunks; i++) {
			const chunk = tetrahedron({
				radius: 1 / 3,
				detail: MathUtils.randInt(0, 1),
				color: randColor(color, colorVariation),
				vertexVariation: 1 / 8,
			});
			const angle = MathUtils.randFloatSpread(2 * Math.PI);
			const dist = MathUtils.randFloat(1, 5 / 4);
			chunk.translate(
				dist * Math.cos(angle),
				dist * Math.sin(angle),
				1 / 10,
			);
			chunks.push(chunk);
		}

		const geometry = mergeBufferGeometries([base, ...chunks]);
		geometry.computeVertexNormals();

		super(geometry, faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
