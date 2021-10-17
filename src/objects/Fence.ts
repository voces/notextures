import type { Color } from "three";
import { CylinderGeometry, MathUtils, Mesh } from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

import { wood } from "../colors.js";
import { faceColorMaterial } from "../materials.js";
import { colorFace, getFaceCount } from "./util/utils.js";

const createPost = ({
	height,
	width,
	color,
}: {
	height: number;
	width: number;
	color: Color;
}) => {
	const post = new CylinderGeometry(
		width + Math.random() / 24,
		width + Math.random() / 24,
		height + Math.random() / 16,
	).toNonIndexed();

	const faces = getFaceCount(post);
	for (let i = 0; i < faces; i++)
		colorFace(
			post,
			i,
			color.clone().offsetHSL(MathUtils.randFloatSpread(1 / 36), 0, 0),
		);

	post.rotateX(Math.PI / 2 + (Math.random() - 0.5) / 6);
	post.rotateZ(Math.PI * Math.random());
	post.rotateY((Math.random() - 0.5) / 16);
	post.translate(0, 0, height / 2);

	return post;
};

const createPosts = ({
	length,
	width,
	height,
	angle,
	color,
}: {
	length: number;
	width: number;
	height: number;
	angle: number;
	color: Color;
}) => {
	const postDisplacement = length / 2 - Math.random() / 16;

	const leftPost = createPost({ height, width, color });
	leftPost.translate(
		Math.cos(angle + Math.PI / 2) * -postDisplacement,
		Math.sin(angle + Math.PI / 2) * -postDisplacement,
		0,
	);

	const rightPost = createPost({ height, width, color });
	rightPost.translate(
		Math.cos(angle + Math.PI / 2) * postDisplacement,
		Math.sin(angle + Math.PI / 2) * postDisplacement,
		0,
	);

	return [leftPost, rightPost];
};

const createRail = ({
	width,
	length,
	color,
}: {
	width: number;
	length: number;
	color: Color;
}) => {
	const rail = new CylinderGeometry(
		width + Math.random() / 24,
		width + Math.random() / 24,
		length + width + Math.random() / 4,
	).toNonIndexed();

	const faces = getFaceCount(rail);
	for (let i = 0; i < faces; i++)
		colorFace(
			rail,
			i,
			color.clone().offsetHSL(MathUtils.randFloatSpread(1 / 36), 0, 0),
		);

	rail.rotateY(Math.PI * Math.random());
	rail.rotateX((Math.random() - 0.5) / 4 / length);

	return rail;
};

const createRails = ({
	length,
	height,
	width,
	angle,
	color,
}: {
	length: number;
	height: number;
	width: number;
	angle: number;
	color: Color;
}) => {
	const topRail = createRail({ width, length, color });
	topRail.translate(0, 0, height / 3);
	topRail.rotateZ(angle);

	const bottomRail = createRail({ width, length, color });
	bottomRail.translate(0, 0, (height / 3) * 2);
	bottomRail.rotateZ(angle);

	return [topRail, bottomRail];
};

export class Fence extends Mesh {
	constructor({
		length = 2 - 1 / 4,
		width = 1 / 24,
		height = 1 / 2,
		angle = 0,
		color = wood.clone().offsetHSL(MathUtils.randFloatSpread(1 / 36), 0, 0),
	} = {}) {
		const geometry = mergeBufferGeometries([
			...createPosts({ length, width, height, angle, color }),
			...createRails({ length, width, height, angle, color }),
		]);

		// geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		super(geometry, faceColorMaterial);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
