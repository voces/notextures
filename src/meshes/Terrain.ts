// https://github.com/mrdoob/three.js/blob/master/examples/js/objects/Water2.js

import {
	Geometry,
	Group,
	Mesh,
	MeshPhongMaterial,
	FaceColors,
	Vector3,
	Face3,
	Color,
} from "three";
import memoize from "../util/memoize.js";

const memoizedColor = memoize((hex) => new Color(hex));

const tileFaceVertices = (
	vertices: [TVector, TVector, TVector, TVector],
	which: boolean,
) =>
	<[number, number, number]>(
		(which ? [1, 0, 2] : [1, 2, 3]).map(
			(index) => vertices[index]._geoIndex,
		)
	);

const wallVertices = (
	vertices: [TVector, TVector, TVector, TVector],
	vertical: boolean,
	low: boolean,
	first: boolean,
) =>
	<[number, number, number]>(
		(
			(vertical && low && first && [1, 0, 2]) ||
			(vertical && low && !first && [1, 2, 3]) ||
			(vertical && !low && first && [2, 0, 1]) ||
			(vertical && !low && !first && [2, 1, 3]) ||
			(!vertical && low && first && [2, 0, 1]) ||
			(!vertical && low && !first && [2, 1, 3]) ||
			(!vertical && !low && first && [1, 0, 2]) || [1, 2, 3]
		).map((index) => vertices[index]._geoIndex)
	);

// Randomly rotate 50% of squares
const rotate = (geometry: Geometry) => {
	for (let i = 0; i < geometry.faces.length / 2; i++)
		if (Math.random() < 0.5) {
			geometry.faces[i * 2].c = geometry.faces[i * 2 + 1].c;
			geometry.faces[i * 2 + 1].a = geometry.faces[i * 2].b;
		}
};

const nudge = (factor = 1) =>
	(Math.random() - 0.5) * (Math.random() - 0.5) * factor;

// Randomly move vertices a bit (so we don't have completely flat surfaces)
const noise = (geometry: Geometry) => {
	for (let i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += nudge(0.75);
		geometry.vertices[i].y += nudge(0.75);
		geometry.vertices[i].z += nudge(0.25);
	}

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
};

const findLastIndex = <T>(
	arr: T[],
	fn: (value: T) => boolean,
	fromIndex = arr.length - 1,
) => {
	for (let i = fromIndex; i >= 0; i--) if (fn(arr[i])) return i;

	return -1;
};

const minNotNegInfinity = (...arr: number[]) => {
	const value = arr.reduce(
		(min, val) => (val === -Infinity ? min : val < min ? val : min),
		Infinity,
	);

	if (value === Infinity) {
		console.warn("We didn't find any good values!");
		return NaN;
	}

	return value;
};

class TVector extends Vector3 {
	_geoIndex: number;
	constructor(x: number, y: number, z: number, index: number) {
		super(x, y, z);
		this._geoIndex = index;
	}
}

// Extends Group instead so water doesn't cast/receive Shadows
export class Terrain extends Group {
	private _vertices: (TVector[] & { water?: TVector })[][];
	width: number;
	height: number;

	groundColor: (x: number, y: number) => Color;
	cliffColor: (x: number, y: number) => Color;

	constructor(terrain: {
		masks: {
			height: number[][];
			cliff: (number | "r")[][];
			groundTile: number[][];
			cliffTile: number[][];
			water: number[][];
			waterHeight: number[][];
		};
		offset: { x: number; y: number; z: number };
		tiles: { color: string }[];
		size: {
			width: number;
			height: number;
		};
	}) {
		super();

		this._vertices = [];

		this.groundColor = memoize((x, y) => {
			try {
				const hex = terrain.tiles[
					terrain.masks.groundTile[y][x]
				].color.toUpperCase();
				return memoizedColor(hex);
			} catch (err) {
				throw new Error(
					`Tile ( ${x}, ${y} ) uses undefined color ${terrain.masks.groundTile[y][x]}.`,
				);
			}
		});

		this.cliffColor = memoize((x, y) => {
			try {
				const hex = terrain.tiles[
					terrain.masks.cliffTile[y][x]
				].color.toUpperCase();
				return memoizedColor(hex);
			} catch (err) {
				throw new Error(
					`Tile ( ${x}, ${y} ) uses undefined color ${terrain.masks.cliffTile[y][x]}.`,
				);
			}
		});

		const { width, height } = terrain.size;
		this.width = width;
		this.height = height;

		this.add(
			this._computeGround({
				height: terrain.masks.height,
				cliff: terrain.masks.cliff,
				offset: terrain.offset,
			}),
			this._computeWater({
				water: terrain.masks.water,
				waterHeight: terrain.masks.waterHeight,
				offset: terrain.offset,
			}),
		);
	}

	_computeGround({
		height: heightMask,
		cliff: cliffMask,
		offset,
	}: {
		height: number[][];
		cliff: (number | "r")[][];
		offset: { x: number; y: number; z: number };
	}): Mesh {
		const geometry = new Geometry();
		const material = new MeshPhongMaterial({
			vertexColors: FaceColors,
			flatShading: true,
			shininess: 5,
		});

		const vertex = (x: number, y: number, z: number, offset = 0) => {
			const existing = this._vertices[x]?.[y]?.[z];
			if (existing !== undefined) return existing;
			if (this._vertices[x] === undefined) this._vertices[x] = [];
			if (this._vertices[x][y] === undefined) this._vertices[x][y] = [];
			const vector = new TVector(
				x,
				-y,
				z + offset,
				geometry.vertices.length - 1,
			);
			geometry.vertices.push(vector);
			this._vertices[x][y][z] = vector;
			return vector;
		};

		const rampWalls = [];

		for (let y = this.height - 1; y >= 0; y--)
			for (let x = 0; x < this.width; x++) {
				const topLeft = heightMask[y][x];
				const topRight = heightMask[y][x + 1];
				const botLeft = heightMask[y + 1][x];
				const botRight = heightMask[y + 1][x + 1];
				const cliffTile = cliffMask[y][x];

				if (typeof cliffTile === "number") {
					// Floor
					const vertices: [TVector, TVector, TVector, TVector] = [
						vertex(x, y, cliffTile, topLeft),
						vertex(x + 1, y, cliffTile, topRight),
						vertex(x, y + 1, cliffTile, botLeft),
						vertex(x + 1, y + 1, cliffTile, botRight),
					];
					const aVertices = tileFaceVertices(vertices, true);
					const bVertices = tileFaceVertices(vertices, false);
					geometry.faces.push(
						new Face3(
							aVertices[0],
							aVertices[1],
							aVertices[2],
							undefined,
							this.groundColor(x, y),
						),
						new Face3(
							bVertices[0],
							bVertices[1],
							bVertices[2],
							undefined,
							this.groundColor(x, y),
						),
					);

					// Left wall (next gets right)
					if (x > 0) {
						const altHeight = this._tileHeight(cliffMask, x - 1, y);
						const currentIsLow = cliffTile < altHeight;
						const low = currentIsLow ? cliffTile : altHeight;
						const high = currentIsLow ? altHeight : cliffTile;

						for (let z = low; z < high; z++) {
							const vertices: [
								TVector,
								TVector,
								TVector,
								TVector,
							] = [
								vertex(x, y, z, topLeft),
								vertex(x, y + 1, z, botLeft),
								vertex(x, y, z + 1, topLeft),
								vertex(x, y + 1, z + 1, botLeft),
							];
							const aVertices = wallVertices(
								vertices,
								true,
								currentIsLow,
								true,
							);
							const bVertices = wallVertices(
								vertices,
								true,
								currentIsLow,
								false,
							);
							geometry.faces.push(
								new Face3(
									aVertices[0],
									aVertices[1],
									aVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
								new Face3(
									bVertices[0],
									bVertices[1],
									bVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
							);
						}
					}

					// Top wall (next gets bottom)
					if (y > 0) {
						const altHeight = this._tileHeight(cliffMask, x, y - 1);
						const currentIsLow = cliffTile < altHeight;
						const low = currentIsLow ? cliffTile : altHeight;
						const high = currentIsLow ? altHeight : cliffTile;

						for (let z = low; z < high; z++) {
							const vertices: [
								TVector,
								TVector,
								TVector,
								TVector,
							] = [
								vertex(x, y, z, topLeft),
								vertex(x + 1, y, z, topRight),
								vertex(x, y, z + 1, topLeft),
								vertex(x + 1, y, z + 1, topRight),
							];
							const aVertices = wallVertices(
								vertices,
								false,
								currentIsLow,
								true,
							);
							const bVertices = wallVertices(
								vertices,
								false,
								currentIsLow,
								false,
							);
							geometry.faces.push(
								new Face3(
									aVertices[0],
									aVertices[1],
									aVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
								new Face3(
									bVertices[0],
									bVertices[1],
									bVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
							);
						}
					}
				} else if (cliffTile.toLowerCase() === "r") {
					const nearRaw = [
						y > 0 && x > 0 ? cliffMask[y - 1][x - 1] : undefined,
						y > 0 ? cliffMask[y - 1][x] : undefined,
						y > 0 && x < this.width
							? cliffMask[y - 1][x + 1]
							: undefined,
						x > 0 ? cliffMask[y][x - 1] : undefined,
						x < this.width ? cliffMask[y][x + 1] : undefined,
						y + 1 < this.height && x > 0
							? cliffMask[y + 1][x - 1]
							: undefined,
						y + 1 < this.height ? cliffMask[y + 1][x] : undefined,
						y + 1 < this.height && x < this.width
							? cliffMask[y + 1][x + 1]
							: undefined,
					];

					const near = nearRaw.map((tile) =>
						typeof tile === "number" ? tile : -Infinity,
					);
					const [
						topLeftCliff,
						top,
						topRightCliff,
						left,
						right,
						botLeftCliff,
						bot,
						botRightCliff,
					] = near;

					const topLeftHeight = Math.max(topLeftCliff, top, left);
					const topRightHeight = Math.max(topRightCliff, top, right);
					const botLeftHeight = Math.max(botLeftCliff, bot, left);
					const botRightHeight = Math.max(botRightCliff, bot, right);

					const vertices: [TVector, TVector, TVector, TVector] = [
						vertex(x, y, topLeftHeight, topLeft),
						vertex(x + 1, y, topRightHeight, topRight),
						vertex(x, y + 1, botLeftHeight, botLeft),
						vertex(x + 1, y + 1, botRightHeight, botRight),
					];
					const aVertices = tileFaceVertices(vertices, true);
					const bVertices = tileFaceVertices(vertices, false);
					geometry.faces.push(
						new Face3(
							aVertices[0],
							aVertices[1],
							aVertices[2],
							undefined,
							this.groundColor(x, y),
						),
						new Face3(
							bVertices[0],
							bVertices[1],
							bVertices[2],
							undefined,
							this.groundColor(x, y),
						),
					);

					const walls = [
						{ a: 0, b: 1, neighbor: { x: 0, y: -1 } },
						{ a: 1, b: 3, neighbor: { x: 1, y: 0 } },
						{ a: 3, b: 2, neighbor: { x: 0, y: 1 } },
						{ a: 2, b: 0, neighbor: { x: -1, y: 0 } },
					];
					for (let i = 0; i < walls.length; i++) {
						// Don't put triangles on the edge
						const neighborCliffMaskTile =
							cliffMask[y + walls[i].neighbor.y]?.[
								x + walls[i].neighbor.x
							];
						if (
							// y + walls[i].neighbor.y < 0 ||
							// y + walls[i].neighbor.y >= this.height ||
							// x + walls[i].neighbor.x < 0 ||
							// x + walls[i].neighbor.x >= this.width ||
							neighborCliffMaskTile !== undefined &&
							typeof neighborCliffMaskTile === "string"
						)
							continue;

						const z = neighborCliffMaskTile;

						const a = vertices[walls[i].a];
						const b = vertices[walls[i].b];

						if (a.z !== b.z && (a.x === b.x || a.y === b.y)) {
							const height = Math.min(a.z, b.z);
							const { x: vX, y: vY } = a.z === height ? b : a;
							// vertex inverts y, so we invert it first...
							const v = vertex(vX, -vY, z, height - z);

							rampWalls.push(
								new Face3(
									a._geoIndex,
									b._geoIndex,
									v._geoIndex,
									undefined,
									this.cliffColor(x, y),
								),
							);
						}
					}

					const minHeight = minNotNegInfinity(
						topLeftHeight,
						topRightHeight,
						botLeftHeight,
						botRightHeight,
					);
					if (isNaN(minHeight)) console.warn("Got a NaN!");

					// Left wall (next gets right; ONLY for squares, not triangle its)
					if (topLeftHeight !== botLeftHeight && x > 0) {
						const rawCliffLeft = cliffMask[y][x - 1];
						const cliffLeft =
							typeof rawCliffLeft === "number"
								? rawCliffLeft
								: -Infinity;
						const currentIsLow = minHeight < cliffLeft;
						const low = currentIsLow ? minHeight : cliffLeft;
						const high = currentIsLow ? cliffLeft : minHeight;

						for (let z = low; z < high; z++) {
							const vertices: [
								TVector,
								TVector,
								TVector,
								TVector,
							] = [
								vertex(x, y, z, topLeft),
								vertex(x, y + 1, z, botLeft),
								vertex(x, y, z + 1, topLeft),
								vertex(x, y + 1, z + 1, botLeft),
							];
							const aVertices = wallVertices(
								vertices,
								true,
								currentIsLow,
								true,
							);
							const bVertices = wallVertices(
								vertices,
								true,
								currentIsLow,
								false,
							);
							geometry.faces.push(
								new Face3(
									aVertices[0],
									aVertices[1],
									aVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
								new Face3(
									bVertices[0],
									bVertices[1],
									bVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
							);
						}
					}

					// Top wall (next gets bottom; ONLY for squares, not triangle its)
					if (topLeftHeight !== topRightHeight && y > 0) {
						const rawCliffAbove = cliffMask[y - 1][x];
						const cliffAbove =
							typeof rawCliffAbove === "number"
								? rawCliffAbove
								: -Infinity;
						const currentIsLow = minHeight < cliffAbove;
						const low = currentIsLow ? minHeight : cliffAbove;
						const high = currentIsLow ? cliffAbove : minHeight;

						for (let z = low; z < high; z++) {
							const vertices: [
								TVector,
								TVector,
								TVector,
								TVector,
							] = [
								vertex(x, y, z, topLeft),
								vertex(x + 1, y, z, topRight),
								vertex(x, y, z + 1, topLeft),
								vertex(x + 1, y, z + 1, topRight),
							];
							const aVertices = wallVertices(
								vertices,
								false,
								currentIsLow,
								true,
							);
							const bVertices = wallVertices(
								vertices,
								false,
								currentIsLow,
								false,
							);
							geometry.faces.push(
								new Face3(
									aVertices[0],
									aVertices[1],
									aVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
								new Face3(
									bVertices[0],
									bVertices[1],
									bVertices[2],
									undefined,
									this.cliffColor(x, y),
								),
							);
						}
					}
				}
			}

		rotate(geometry);

		// We add ramp walls after since they are single triangles
		geometry.faces.push(...rampWalls);

		// Center x & y
		geometry.translate(-offset.x, offset.y, offset.z);

		noise(geometry);

		const mesh = new Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		return mesh;
	}

	_computeWater({
		water: waterMask,
		waterHeight: waterHeightMask,
		offset,
	}: {
		water: number[][];
		waterHeight: number[][];
		offset: { z: number };
	}): Mesh {
		const geometry = new Geometry();
		const material = new MeshPhongMaterial({
			color: 0x182190,
			flatShading: true,
			opacity: 0.5,
			transparent: true,
		});

		// This makes the water hug the cliff, it's not 100% between edges,
		// but is at the edge, which is what matters most
		const vertex = (x: number, y: number, waterHeight: number) => {
			const existing = this._vertices[x]?.[y]?.water;
			if (existing !== undefined) return existing;
			if (this._vertices[x] === undefined) this._vertices[x] = [];
			if (this._vertices[x][y] === undefined) this._vertices[x][y] = [];

			waterHeight += 3 / 8 + offset.z;

			const groundVertices = this._vertices[x][y];
			if (!groundVertices) throw new Error();
			const cliff = Math.floor(waterHeight);
			const trueLowIndex = findLastIndex(groundVertices, Boolean, cliff);
			const lowIndex =
				trueLowIndex < 0
					? groundVertices.findIndex(Boolean)
					: trueLowIndex;
			const low = groundVertices[lowIndex];
			const high =
				groundVertices.length - 1 !== lowIndex
					? groundVertices[groundVertices.length - 1]
					: undefined;

			let vector;

			// Water is at a cliff, interpolate between them
			if (high) {
				const alpha = (waterHeight - low.z) / (high.z - low.z);
				vector = low.clone().lerp(high, alpha);

				// Water is in the open, just project straight up
				// We only nudge open water to make sure cliff edges are touched
			} else vector = low.clone().setZ(waterHeight + nudge(1 / 8));

			const tVector = new TVector(
				vector.x,
				vector.y,
				vector.z,
				geometry.vertices.length,
			);

			return tVector;
		};

		for (let y = this.height - 1; y >= 0; y--)
			for (let x = 0; x < this.width; x++)
				if (waterMask[y][x]) {
					const topLeft = waterHeightMask[y][x];
					const topRight = waterHeightMask[y][x + 1];
					const botLeft = waterHeightMask[y + 1][x];
					const botRight = waterHeightMask[y + 1][x + 1];

					const vertices: [TVector, TVector, TVector, TVector] = [
						vertex(x, y, topLeft),
						vertex(x + 1, y, topRight),
						vertex(x, y + 1, botLeft),
						vertex(x + 1, y + 1, botRight),
					];
					geometry.faces.push(
						new Face3(...tileFaceVertices(vertices, true)),
						new Face3(...tileFaceVertices(vertices, false)),
					);
				}

		rotate(geometry);

		return new Mesh(geometry, material);
	}

	// Returns either the known height or calculated height of a tile
	_tileHeight(cliffmap: (number | "r")[][], x: number, y: number): number {
		const raw = cliffmap[y][x];

		// Known height
		if (typeof raw === "number") return raw;

		const { width, height } = this;

		const [topLeft, top, topRight, left, right, botLeft, bot, botRight] = [
			y > 0 && x > 0 ? cliffmap[y - 1][x - 1] : NaN,
			y > 0 ? cliffmap[y - 1][x] : NaN,
			y > 0 && x < width ? cliffmap[y - 1][x + 1] : NaN,
			x > 0 ? cliffmap[y][x - 1] : NaN,
			x < width ? cliffmap[y][x + 1] : NaN,
			y + 1 < height && x > 0 ? cliffmap[y + 1][x - 1] : NaN,
			y + 1 < height ? cliffmap[y + 1][x] : NaN,
			y + 1 < height && x < width ? cliffmap[y + 1][x + 1] : NaN,
		].map((tile) => (typeof tile === "number" ? tile : -Infinity));

		const topLeftHeight = Math.max(topLeft, top, left);
		const topRightHeight = Math.max(topRight, top, right);
		const botLeftHeight = Math.max(botLeft, bot, left);
		const botRightHeight = Math.max(botRight, bot, right);

		return minNotNegInfinity(
			topLeftHeight,
			topRightHeight,
			botLeftHeight,
			botRightHeight,
		);
	}
}