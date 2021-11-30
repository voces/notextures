import {
	LordaeronSummerDarkGrass,
	LordaeronSummerDirtCliff,
	LordaeronSummerGrass,
	LordaeronSummerGrassCliff,
	LordaeronSummerRock,
} from "../src";
import * as Objects from "../src/objects";
import { MaterialGrid } from "./MaterialGridExample";

const {
	Grid: BaseGrid,
	MaterialGrid: _MaterialGrid,
	Terrain: BaseTerrain,
	stringMap,
	cliffMap,
	...filtered
} = Objects;

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

		this.scale.z = 0.25;
		this.scale.x = 0.5;
		this.scale.y = 0.5;
	}
}
Object.defineProperty(Terrain, "name", { value: "Terrain" });

class Grid extends BaseGrid {
	constructor() {
		super(2, 2);

		const r = () => {
			const a = Math.random() * Math.random();
			return Math.random() < 0.5 ? a : 1 - a;
		};
		this.setColor(0, 0, r(), r(), r());
		this.setColor(1, 0, r(), r(), r());
		this.setColor(0, 1, r(), r(), r());
		this.setColor(1, 1, r(), r(), r());
	}
}
Object.defineProperty(Grid, "name", { value: "Grid" });

export default { ...filtered, Terrain, MaterialGrid, Grid };

// Make TS happy
export { BaseGrid, BaseTerrain, MaterialGrid };
