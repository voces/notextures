import { MeshPhongMaterial } from "three";

export const faceColorMaterial = new MeshPhongMaterial({
	vertexColors: true,
	flatShading: true,
});

export const waterMaterial = new MeshPhongMaterial({
	color: 0x182190,
	flatShading: true,
	opacity: 0.5,
	transparent: true,
});
