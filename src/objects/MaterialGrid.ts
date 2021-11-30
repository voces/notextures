import type { Material } from "three";
import { Mesh, PlaneBufferGeometry } from "three";

export class MaterialGrid extends Mesh {
	#materials: Material[];
	readonly width: number;
	readonly height: number;

	constructor(width = 1, height = 1, materials: Material[] = []) {
		super(new PlaneBufferGeometry(width, height, width, height), materials);
		this.#materials = materials;
		this.width = width;
		this.height = height;
	}

	addMaterial(material: Material): number {
		const idx = this.#materials.indexOf(material);
		if (idx >= 0) return idx;
		return this.#materials.push(material) - 1;
	}

	setMaterial(x: number, y: number, material: Material): void {
		if (!material) {
			console.log("skipping", x, y);
			return;
		}
		const materialIndex = this.addMaterial(material);
		const start = (y * this.width + x) * 6;
		this.geometry.addGroup(start, 6, materialIndex);
	}
}
