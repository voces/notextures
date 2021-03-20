import {
	BufferAttribute,
	BufferGeometry,
	InterleavedBufferAttribute,
} from "three";

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
