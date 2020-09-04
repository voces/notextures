import {
	LordaeronSummerDarkGrass,
	LordaeronSummerDirtCliff,
	LordaeronSummerGrass,
	LordaeronSummerGrassCliff,
	LordaeronSummerRock,
} from "../src";
import * as Objects from "../src/objects";
import {
	stringMap,
	Terrain as BaseTerrain,
	cliffMap,
} from "../src/objects/Terrain";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Terrain: _, ...filtered } = Objects;

class Terrain extends BaseTerrain {
	constructor() {
		super({
			masks: {
				height: stringMap(`
					0000000
					0000000
					0000000
					0000000
					0000000
					0000000
					0000000
				`),
				cliff: cliffMap(`
					211111
					111rr1
					111rr1
					1rr331
					1rr311
					111110
				`),
				groundTile: stringMap(`
					222222
					222222
					222222
					222112
					222100
					222201
				`),
				cliffTile: stringMap(`
					333333
					333333
					333333
					333443
					333433
					333334
				`),
				water: stringMap(`
					000000
					000000
					000000
					000000
					000000
					000001
				`),
				waterHeight: stringMap(`
					0000000
					0000000
					0000000
					0000000
					0000000
					0000000
					0000000
				`),
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
				height: 6,
			},
		});

		this.scale.z = 0.5;
	}
}

Object.defineProperty(Terrain, "name", { value: "Terrain" });

export default { ...filtered, Terrain };
