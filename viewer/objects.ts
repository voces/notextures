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
		const props = {
			masks: {
				height: stringMap(`
					0000000
					0100000
					0000000
					0000000
					0000000
					0000000
					0000000
				`),
				cliff: cliffMap(`
					111111
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
			tiles: [
				LordaeronSummerDarkGrass,
				LordaeronSummerRock,
				LordaeronSummerGrass,
				LordaeronSummerDirtCliff,
				LordaeronSummerGrassCliff,
			],
		};
		const size = {
			width: props.masks.cliff.length,
			height: props.masks.cliff[0].length,
		};
		const offset = { x: size.width / 2, y: size.height / 2, z: 0 };
		super({ ...props, size, offset });

		this.scale.z = 0.5;
	}
}

Object.defineProperty(Terrain, "name", { value: "Terrain" });

export default { ...filtered, Terrain };
