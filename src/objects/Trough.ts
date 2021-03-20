import { BufferAttribute, MathUtils, Mesh, PlaneGeometry } from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";

import { water as waterColor, wood } from "../colors.js";
import { faceColorMaterial, waterMaterial } from "../materials.js";
import { box, randColor } from "./util/deprecatedShared.js";

const wall = ({
	thickness,
	length,
	height,
}: {
	thickness: number;
	length: number;
	height: number;
}) => {
	const wall = box({
		width: thickness,
		height: length,
		depth: height,
		color: randColor(wood),
	});
	wall.translate(0, 0, height / 2);
	return wall;
};

const spoke = ({
	thickness,
	height,
}: {
	thickness: number;
	height: number;
}) => {
	const spoke = box({
		width: thickness * 1.25,
		height: thickness * 2,
		depth: height * 1.25,
		color: randColor(wood),
	});
	spoke.translate(0, 0, (height / 2) * 1.25);
	return spoke;
};

export class Trough extends Mesh {
	constructor({
		thickness = 1 / 16,
		length = 1 / 2,
		width = 1 / 4,
		height = 1 / 4,
		angle = 0,
	} = {}) {
		const materials = [faceColorMaterial, waterMaterial];

		let geometry = wall({
			thickness,
			length: length + thickness,
			height,
		});
		geometry.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		geometry.translate(-width / 2 + thickness / 2, 0, 0);

		const right = wall({ thickness, length: length + thickness, height });
		right.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		right.translate(width / 2 - thickness / 2, 0, 0);
		geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, right]);

		const top = wall({ thickness, length: width, height });
		top.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		top.rotateZ(Math.PI / 2);
		top.translate(0, length / 2 - thickness / 2, 0);
		geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, top]);

		const bottom = wall({ thickness, length: width, height });
		bottom.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		bottom.rotateZ(Math.PI / 2);
		bottom.translate(0, -length / 2 + thickness / 2, 0);
		geometry = BufferGeometryUtils.mergeBufferGeometries([
			geometry,
			bottom,
		]);

		const topLeft = spoke({ thickness, height });
		topLeft.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		topLeft.rotateX(-MathUtils.randFloat(1 / 5, 1 / 3));
		topLeft.rotateZ(Math.PI / 2);
		topLeft.translate(
			-width / 2 + thickness / 2,
			length / 2 - thickness / 2,
			0,
		);
		geometry = BufferGeometryUtils.mergeBufferGeometries([
			geometry,
			topLeft,
		]);

		const topRight = spoke({ thickness, height });
		topRight.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		topRight.rotateX(MathUtils.randFloat(1 / 5, 1 / 3));
		topRight.rotateZ(Math.PI / 2);
		topRight.translate(
			width / 2 - thickness / 2,
			length / 2 - thickness / 2,
			0,
		);
		geometry = BufferGeometryUtils.mergeBufferGeometries([
			geometry,
			topRight,
		]);

		const bottomLeft = spoke({ thickness, height });
		bottomLeft.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		bottomLeft.rotateX(-MathUtils.randFloat(1 / 5, 1 / 3));
		bottomLeft.rotateZ(Math.PI / 2);
		bottomLeft.translate(
			-width / 2 + thickness / 2,
			-length / 2 + thickness / 2,
			0,
		);
		geometry = BufferGeometryUtils.mergeBufferGeometries([
			geometry,
			bottomLeft,
		]);

		const bottomRight = spoke({ thickness, height });
		bottomRight.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		bottomRight.rotateX(MathUtils.randFloat(1 / 5, 1 / 3));
		bottomRight.rotateZ(Math.PI / 2);
		bottomRight.translate(
			width / 2 - thickness / 2,
			-length / 2 + thickness / 2,
			0,
		);
		geometry = BufferGeometryUtils.mergeBufferGeometries([
			geometry,
			bottomRight,
		]);

		geometry.addGroup(0, geometry.getAttribute("position").count * 2, 0);

		const water = new PlaneGeometry(width, length).toNonIndexed();
		const waterColorAttribute = new BufferAttribute(
			new Float32Array(6 * 3),
			3,
		);
		water.setAttribute("color", waterColorAttribute);
		water.translate(0, 0, (height * 3) / 4);
		for (let i = 0; i < 6; i++)
			waterColorAttribute.setXYZ(
				i,
				waterColor.r,
				waterColor.g,
				waterColor.b,
			);

		geometry = BufferGeometryUtils.mergeBufferGeometries(
			[geometry, water],
			true,
		);

		geometry.rotateZ(angle - Math.PI / 4);

		geometry.computeVertexNormals();

		super(geometry, materials);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
