import {
	LordaeronSummerDarkGrass,
	LordaeronSummerDirtCliff,
	LordaeronSummerGrass,
	LordaeronSummerGrassCliff,
	LordaeronSummerRock,
} from "../src";
import * as Objects from "../src/objects";
import { Terrain as BaseTerrain } from "../src/objects/Terrain";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Terrain: _, ...filtered } = Objects;

class Terrain extends BaseTerrain {
	constructor() {
		super({
			masks: {
				height: [
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
				],
				cliff: [
					[1, 1, 1, 1, 1, 1],
					[1, 1, 1, "r", "r", 1],
					[1, 1, "r", 2, 2, 1],
					[1, "r", "r", 2, 1, 1],
					[1, 1, 1, 1, 1, 0],
				],
				groundTile: [
					[2, 2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2, 2],
					[2, 2, 2, 1, 1, 2],
					[2, 2, 2, 1, 0, 0],
					[2, 2, 2, 2, 0, 1],
				],
				cliffTile: [
					[3, 3, 3, 3, 3, 3],
					[3, 3, 3, 3, 3, 3],
					[3, 3, 3, 4, 4, 3],
					[3, 3, 3, 4, 3, 3],
					[3, 3, 3, 3, 3, 4],
				],
				water: [
					[0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 1],
				],
				waterHeight: [
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
				],
			},
			offset: { x: 3, y: 2.5, z: 0 },
			tiles: [
				LordaeronSummerDarkGrass,
				LordaeronSummerRock,
				LordaeronSummerGrass,
				LordaeronSummerDirtCliff,
				LordaeronSummerGrassCliff,
			],
			size: {
				width: 6,
				height: 5,
			},
		});
	}
}

Object.defineProperty(Terrain, "name", { value: "Terrain" });

export default { ...filtered, Terrain };
