import { Mesh, PlaneBufferGeometry, BufferAttribute } from "three";
import { faceColorMaterial } from "../materials";

class ColorAttribute extends BufferAttribute {
	static COMPONNETS_PER_COLOR = 3;
	static VERTICES_PER_FACE = 3;
	static ITEM_SIZE = 3;

	private data: Float32Array;

	constructor(faces: number) {
		const data = new Float32Array(
			faces *
				ColorAttribute.COMPONNETS_PER_COLOR *
				ColorAttribute.VERTICES_PER_FACE,
		);

		super(data, ColorAttribute.ITEM_SIZE);

		this.data = data;
	}

	setFace(index: number, red: number, blue: number, green: number) {
		const base =
			index *
			ColorAttribute.COMPONNETS_PER_COLOR *
			ColorAttribute.VERTICES_PER_FACE;

		for (let i = 0; i < ColorAttribute.VERTICES_PER_FACE; i++) {
			this.data[base + i * ColorAttribute.VERTICES_PER_FACE] = red;
			this.data[base + i * ColorAttribute.VERTICES_PER_FACE + 1] = blue;
			this.data[base + i * ColorAttribute.VERTICES_PER_FACE + 2] = green;
		}

		this.needsUpdate = true;
	}
}

class SquareColorAttribute extends ColorAttribute {
	constructor(faces: number) {
		super(faces * 2);
	}

	setFaces(index: number, red: number, blue: number, green: number) {
		super.setFace(index * 2, red, blue, green);
		super.setFace(index * 2 + 1, red, blue, green);
	}
}

class GridColorAttribute extends SquareColorAttribute {
	private width: number;
	private height: number;

	constructor(width: number, height: number) {
		super(width * height);
		this.width = width;
		this.height = height;
	}

	setColor(x: number, y: number, red: number, blue: number, green: number) {
		super.setFaces(y * this.width + x, red, blue, green);
	}
}

export class Grid extends Mesh {
	private colors: GridColorAttribute;

	constructor(width = 1, height = 1) {
		const plane = new PlaneBufferGeometry(
			width,
			height,
			width,
			height,
		).toNonIndexed();

		const colors = new GridColorAttribute(width, height);
		plane.setAttribute("color", colors);

		super(plane, faceColorMaterial);

		this.colors = colors;
	}

	setColor(
		x: number,
		y: number,
		red: number,
		blue: number,
		green: number,
	): void {
		this.colors.setColor(x, y, red, blue, green);
	}
}
