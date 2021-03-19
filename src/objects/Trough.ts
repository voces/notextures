import { BufferAttribute, MathUtils, Mesh, PlaneGeometry } from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";

import { wood } from "../colors.js";
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
		// let geometry = new BufferGeometry();
		const materials = [faceColorMaterial, waterMaterial];

		const geometry = wall({
			thickness,
			length: length + thickness,
			height,
		});
		console.log(geometry.clone());
		geometry.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		geometry.translate(-width / 2 + thickness / 2, 0, 0);
		// geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, left]);
		// console.log(geometry);

		// const right = wall({ thickness, length: length + thickness, height });
		// right.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		// right.translate(width / 2 - thickness / 2, 0, 0);
		// geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, right]);

		// const top = wall({ thickness, length: width, height });
		// top.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		// top.rotateZ(Math.PI / 2);
		// top.translate(0, length / 2 - thickness / 2, 0);
		// geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, top]);

		// const bottom = wall({ thickness, length: width, height });
		// bottom.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		// bottom.rotateZ(Math.PI / 2);
		// bottom.translate(0, -length / 2 + thickness / 2, 0);
		// geometry = BufferGeometryUtils.mergeBufferGeometries([
		// 	geometry,
		// 	bottom,
		// ]);

		// const topLeft = spoke({ thickness, height });
		// topLeft.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		// topLeft.rotateX(-MathUtils.randFloat(1 / 5, 1 / 3));
		// topLeft.rotateZ(Math.PI / 2);
		// topLeft.translate(
		// 	-width / 2 + thickness / 2,
		// 	length / 2 - thickness / 2,
		// 	0,
		// );
		// geometry = BufferGeometryUtils.mergeBufferGeometries([
		// 	geometry,
		// 	topLeft,
		// ]);

		// const topRight = spoke({ thickness, height });
		// topRight.rotateY(MathUtils.randFloat(1 / 5, 1 / 3));
		// topRight.rotateX(MathUtils.randFloat(1 / 5, 1 / 3));
		// topRight.rotateZ(Math.PI / 2);
		// topRight.translate(
		// 	width / 2 - thickness / 2,
		// 	length / 2 - thickness / 2,
		// 	0,
		// );
		// geometry = BufferGeometryUtils.mergeBufferGeometries([
		// 	geometry,
		// 	topRight,
		// ]);

		// const bottomLeft = spoke({ thickness, height });
		// bottomLeft.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		// bottomLeft.rotateX(-MathUtils.randFloat(1 / 5, 1 / 3));
		// bottomLeft.rotateZ(Math.PI / 2);
		// bottomLeft.translate(
		// 	-width / 2 + thickness / 2,
		// 	-length / 2 + thickness / 2,
		// 	0,
		// );
		// geometry = BufferGeometryUtils.mergeBufferGeometries([
		// 	geometry,
		// 	bottomLeft,
		// ]);

		// const bottomRight = spoke({ thickness, height });
		// bottomRight.rotateY(-MathUtils.randFloat(1 / 5, 1 / 3));
		// bottomRight.rotateX(MathUtils.randFloat(1 / 5, 1 / 3));
		// bottomRight.rotateZ(Math.PI / 2);
		// bottomRight.translate(
		// 	width / 2 - thickness / 2,
		// 	-length / 2 + thickness / 2,
		// 	0,
		// );
		// geometry = BufferGeometryUtils.mergeBufferGeometries([
		// 	geometry,
		// 	bottomRight,
		// ]);

		// console.log(geometry.attributes);
		geometry.clearGroups();
		geometry.addGroup(0, geometry.getAttribute("position").count * 2, 0);
		// // for (let i = 0; i < geometry.faces.length; i++)
		// // 	geometry.faces[i].materialIndex = 0;

		const water = new PlaneGeometry(width, length);
		const waterColorAttribute = new BufferAttribute(
			new Float32Array(6 * 3),
			3,
		);
		water.setAttribute("color", waterColorAttribute);
		water.translate(0, 0, (height * 3) / 4);
		// geometry.addGroup(0, geometry.getAttribute("position").count, 1);
		for (let i = 0; i < 6; i++) {
			waterColorAttribute.setXYZ(i * 3, 0x18, 0x21, 0x90);
			waterColorAttribute.setXYZ((i + 1) * 3, 0x18, 0x21, 0x90);
			waterColorAttribute.setXYZ((i + 2) * 3, 0x18, 0x21, 0x90);
		}
		console.log(water);
		// // water.faces[0].color.set(0x182190);
		// // water.faces[1].color.set(0x182190);

		// // for (let i = 0; i < water.faces.length; i++)
		// // 	water.faces[i].materialIndex = 1;

		// geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, water]);

		// geometry.rotateZ(angle - Math.PI / 4);

		// // geometry.computeFaceNormals();
		// geometry.computeVertexNormals();

		console.log(geometry);

		super(geometry, materials);

		this.castShadow = true;
		this.receiveShadow = true;
	}
}
