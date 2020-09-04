// https://github.com/mrdoob/three.js/blob/master/examples/js/objects/Water2.js

import {
	Geometry,
	Group,
	Mesh,
	MeshPhongMaterial,
	Vector3,
	Face3,
	Color,
	BufferGeometry,
} from "three";
import memoize from "../../util/memoize";
import { faceColorMaterial, waterMaterial } from "../../materials";

export type Cliff = number | "r";
export type CliffMask = Cliff[][];

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
		geometry.vertices[i].z += nudge(0.5);
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

export const CORNERS = {
	TOP_LEFT: { x: -1, y: -1 },
	TOP_RIGHT: { x: 1, y: -1 },
	BOTTOM_LEFT: { x: -1, y: 1 },
	BOTTOM_RIGHT: { x: 1, y: 1 },
};

export const calcCliffHeightCorner = (
	cliffMask: CliffMask,
	x: number,
	y: number,
	direction: { x: number; y: number },
): number => {
	const cliffHeight = cliffMask[y]?.[x];
	if (typeof cliffHeight === "number") return cliffHeight;

	const checks = [{ ...direction }];
	if (direction.x !== 0 && direction.y !== 0)
		checks.push({ x: 0, y: direction.y }, { x: direction.x, y: 0 });

	const heights = checks.map(({ x: xD, y: yD }) => cliffMask[y + yD][x + xD]);

	const max = heights.reduce<number>(
		(max, v) => (typeof v === "number" && v > max ? v : max),
		-Infinity,
	);

	if (heights.every((v) => typeof v === "number")) return max;

	const rampHeights = heights.map((v, i) => {
		if (v !== "r") return NaN;

		let cornerHeight: Cliff = "r";
		let xCorner = x + checks[i].x;
		let yCorner = y + checks[i].y;
		while (cornerHeight === "r") {
			cornerHeight = cliffMask[yCorner][xCorner];
			xCorner += checks[i].x;
			yCorner += checks[i].y;
		}

		let oppositeHeight: Cliff = "r";
		let xOpposite = x - checks[i].x;
		let yOpposite = y - checks[i].y;
		while (oppositeHeight === "r") {
			oppositeHeight = cliffMask[yOpposite][xOpposite];
			xOpposite -= checks[i].x;
			yOpposite -= checks[i].y;
		}

		if (
			cornerHeight === oppositeHeight &&
			checks[i].x !== 0 &&
			checks[i].y !== 0
		) {
			let adjacentHeight: Cliff = "r";
			let xAdjacent = x - checks[i].x;
			let yAdjacent = y + checks[i].y;
			while (adjacentHeight === "r") {
				adjacentHeight = cliffMask[yAdjacent][xAdjacent];
				xAdjacent -= checks[i].x;
				yAdjacent += checks[i].y;
			}

			let adjacentOppositeHeight: Cliff = "r";
			let xAdjacentOpposite = x + checks[i].x;
			let yAdjacentOpposite = y - checks[i].y;
			while (adjacentOppositeHeight === "r") {
				adjacentOppositeHeight =
					cliffMask[yAdjacentOpposite][xAdjacentOpposite];
				xAdjacentOpposite += checks[i].x;
				yAdjacentOpposite -= checks[i].y;
			}

			return Math.max((adjacentHeight + adjacentOppositeHeight) / 2, max);
		}

		return Math.max((cornerHeight + oppositeHeight) / 2, max);
	});

	const rampHeight = rampHeights.reduce(
		(max, v) => (!isNaN(v) && v > max ? v : max),
		-Infinity,
	);

	return rampHeight;
};

export const calcCliffHeight = (
	cliffMask: CliffMask,
	x: number,
	y: number,
): {
	topLeft: number;
	topRight: number;
	bottomLeft: number;
	bottomRight: number;
} => {
	const cliffHeight = cliffMask[y]?.[x];
	if (typeof cliffHeight === "number")
		return {
			topLeft: cliffHeight,
			topRight: cliffHeight,
			bottomLeft: cliffHeight,
			bottomRight: cliffHeight,
		};

	const [topLeft, topRight, bottomLeft, bottomRight] = Object.values(
		CORNERS,
	).map((direction) => calcCliffHeightCorner(cliffMask, x, y, direction));

	return {
		topLeft,
		topRight,
		bottomLeft,
		bottomRight,
	};
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
	vertices: (TVector[] & { water?: TVector })[][];
	/** Y-major, with y index being flipped, so y=0 is the bottom */
	groundFaces = <[Face3, Face3][][]>[];
	width: number;
	height: number;

	ground: Geometry;
	water: Geometry;

	groundColor: (x: number, y: number) => Color;
	cliffColor: (x: number, y: number) => Color;

	constructor(terrain: {
		masks: {
			// y-major, height+1 x width+1
			height: number[][];
			cliff: CliffMask;
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
		this.vertices = [];

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

		{
			const { geometry, material } = this._computeGround({
				height: terrain.masks.height,
				cliff: terrain.masks.cliff,
				offset: terrain.offset,
			});

			this.ground = geometry;

			const mesh = new Mesh(
				new BufferGeometry().fromGeometry(geometry),
				material,
			);
			mesh.castShadow = true;
			mesh.receiveShadow = true;

			this.add(mesh);
		}

		{
			const { geometry, material } = this._computeWater({
				water: terrain.masks.water,
				waterHeight: terrain.masks.waterHeight,
				offset: terrain.offset,
			});

			this.water = geometry;

			this.add(
				new Mesh(new BufferGeometry().fromGeometry(geometry), material),
			);
		}
	}

	private _computeGround({
		height: heightMask,
		cliff: cliffMask,
		offset,
	}: {
		height: number[][];
		cliff: CliffMask;
		offset: { x: number; y: number; z: number };
	}): { geometry: Geometry; material: MeshPhongMaterial } {
		const geometry = new Geometry();

		const vertex = (x: number, y: number, z: number, offset: number) => {
			const existing = this.vertices[x]?.[y]?.[z];
			if (existing !== undefined) return existing;
			if (this.vertices[x] === undefined) this.vertices[x] = [];
			if (this.vertices[x][y] === undefined) this.vertices[x][y] = [];
			const vector = new TVector(
				x,
				-y,
				z + offset,
				geometry.vertices.length,
			);
			geometry.vertices.push(vector);
			this.vertices[x][y][z] = vector;
			return vector;
		};

		const rampWalls: Face3[] = [];

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
					const faces: [Face3, Face3] = [
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
					];
					if (!this.groundFaces[y]) this.groundFaces[y] = [];
					this.groundFaces[y][x] = faces;
					geometry.faces.push(...faces);

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
					const {
						topLeft: topLeftCliff,
						topRight: topRightCliff,
						bottomLeft: botLeftCliff,
						bottomRight: botRightCliff,
					} = calcCliffHeight(cliffMask, x, y);

					const vertices: [TVector, TVector, TVector, TVector] = [
						vertex(x, y, topLeftCliff, topLeft),
						vertex(x + 1, y, topRightCliff, topRight),
						vertex(x, y + 1, botLeftCliff, botLeft),
						vertex(x + 1, y + 1, botRightCliff, botRight),
					];
					const aVertices = tileFaceVertices(vertices, true);
					const bVertices = tileFaceVertices(vertices, false);
					const faces: [Face3, Face3] = [
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
					];
					if (!this.groundFaces[y]) this.groundFaces[y] = [];
					this.groundFaces[y][x] = faces;
					geometry.faces.push(...faces);

					const corners = [
						topLeftCliff,
						topRightCliff,
						botLeftCliff,
						botRightCliff,
					];
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
							neighborCliffMaskTile !== undefined &&
							typeof neighborCliffMaskTile === "string"
						)
							continue;

						const z = Math.min(
							corners[walls[i].a],
							corners[walls[i].b],
						);

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

					const minHeight = Math.min(
						topLeftCliff,
						topRightCliff,
						botLeftCliff,
						botRightCliff,
					);
					if (isNaN(minHeight)) console.warn("Got a NaN!");

					// Left wall (next gets right; ONLY for squares, not triangle its)
					if (topLeftCliff !== botLeftCliff && x > 0) {
						const rawCliffLeft = cliffMask[y][x - 1];
						const cliffLeft =
							typeof rawCliffLeft === "number"
								? rawCliffLeft
								: -Infinity;
						const currentIsLow = minHeight < cliffLeft;
						const low = currentIsLow ? minHeight : cliffLeft;
						const high = currentIsLow ? cliffLeft : minHeight;

						if (
							isNaN(low) ||
							isNaN(high) ||
							!isFinite(low) ||
							!isFinite(high)
						)
							continue;

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
					if (topLeftCliff !== topRightCliff && y > 0) {
						const rawCliffAbove = cliffMask[y - 1][x];
						const cliffAbove =
							typeof rawCliffAbove === "number"
								? rawCliffAbove
								: -Infinity;
						const currentIsLow = minHeight < cliffAbove;
						const low = currentIsLow ? minHeight : cliffAbove;
						const high = currentIsLow ? cliffAbove : minHeight;

						if (
							isNaN(low) ||
							isNaN(high) ||
							!isFinite(low) ||
							!isFinite(high)
						)
							continue;

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

		return { geometry, material: faceColorMaterial };
	}

	private _computeWater({
		water: waterMask,
		waterHeight: waterHeightMask,
		offset,
	}: {
		water: number[][];
		waterHeight: number[][];
		offset: { z: number };
	}): { geometry: Geometry; material: MeshPhongMaterial } {
		const geometry = new Geometry();

		// This makes the water hug the cliff, it's not 100% between edges,
		// but is at the edge, which is what matters most
		const vertex = (x: number, y: number, waterHeight: number) => {
			const existing = this.vertices[x]?.[y]?.water;
			if (existing !== undefined) return existing;
			if (this.vertices[x] === undefined) this.vertices[x] = [];
			if (this.vertices[x][y] === undefined) this.vertices[x][y] = [];

			waterHeight += 3 / 8 + offset.z;

			const groundVertices = this.vertices[x][y];
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
			geometry.vertices.push(tVector);
			this.vertices[x][y].water = tVector;
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

		return { geometry, material: waterMaterial };
	}

	// Returns either the known height or calculated height of a tile
	private _tileHeight(cliffMask: CliffMask, x: number, y: number): number {
		const raw = cliffMask[y][x];

		// Known height
		if (typeof raw === "number") return raw;

		const { topLeft, topRight, bottomLeft, bottomRight } = calcCliffHeight(
			cliffMask,
			x,
			y,
		);

		return Math.min(topLeft, topRight, bottomLeft, bottomRight);
	}
}
