import type { BufferGeometry, Color, InterleavedBufferAttribute } from "three";
import { BufferAttribute } from "three";

export const getVertexCount = (geometry: BufferGeometry): number => {
	const positions = geometry.getAttribute("position");
	return positions.count;
};

export const getColorAttribute = (
	geometry: BufferGeometry,
): BufferAttribute | InterleavedBufferAttribute => {
	const existingAttribute = geometry.getAttribute("color");
	if (existingAttribute) return existingAttribute;
	const attribute = new BufferAttribute(
		new Float32Array(getVertexCount(geometry) * 3),
		3,
	);
	geometry.setAttribute("color", attribute);
	return attribute;
};

export const colorFace = (
	geometry: BufferGeometry,
	face: number,
	color: Color,
): void => {
	const colorAttribute = getColorAttribute(geometry);
	const vertexIdx = face * 3;
	colorAttribute.setXYZ(vertexIdx, color.r, color.g, color.b);
	colorAttribute.setXYZ(vertexIdx + 1, color.r, color.g, color.b);
	colorAttribute.setXYZ(vertexIdx + 2, color.r, color.g, color.b);
};

export const getFaceCount = (geometry: BufferGeometry): number =>
	getVertexCount(geometry) / 3;
