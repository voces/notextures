import { calcCliffHeight, CliffMask, Cliff } from "./Terrain";

/** Calculates how much white space the string starts with. */
const leftTrim = (v: string) => {
	const match = v.match(/^\s+/);
	return match ? match[0].length : 0;
};

/** Removes empty lines/lines of just white space from the top and bottom. */
const trimVertical = (v: string[]) => {
	let start = 0;
	while (!v[start].trim() && start < v.length) start++;

	let end = v.length - 1;
	while (!v[end].trim() && end > 0) end--;

	return v.slice(start, end + 1);
};

/** Calculcates the minimal amount of white space to the left of all lines. */
const commonLeftTrim = (rows: string[]) =>
	rows.reduce((min, row) => {
		if (!row.trim()) return min;
		return Math.min(min, leftTrim(row));
	}, Infinity);

/**
 * Calculates a CliffMask from a map.
 * Example: `01\nr2` => [[0, 1], ["r", 2]]
 */
const stringMap = (map: string): CliffMask => {
	const rows = map.split("\n").filter((v) => v.trim());

	const minLeftTrim = commonLeftTrim(rows);

	return rows.map((row) =>
		row
			.trimRight()
			.slice(minLeftTrim)
			.split("")
			.map((v) => {
				if (v === "r") return "r";
				const num = parseInt(v);
				if (isNaN(num)) return 0;
				return num;
			}),
	);
};

/** Calls calcCliffHeight on each cell and reformats it as a tuple of tuples. */
const calcMultiCliffHeight = (cliffMask: CliffMask) => {
	const results: [[number, number], [number, number]][][] = [];
	for (let y = 0; y < cliffMask.length; y++) {
		results[y] = [];
		for (let x = 0; x < cliffMask[y].length; x++) {
			const {
				topLeft,
				topRight,
				bottomLeft,
				bottomRight,
			} = calcCliffHeight(cliffMask, x, y);
			results[y][x] = [
				[topLeft, topRight],
				[bottomLeft, bottomRight],
			];
		}
	}
	return results;
};

/** Removes vetical and left white space. */
const trim = (map: string) => {
	const rawRows = trimVertical(map.split("\n"));

	const minLeftTrim = commonLeftTrim(rawRows);

	return rawRows.map((row) => row.trimRight().slice(minLeftTrim)).join("\n");
};

/**
 * Takes the result of calcMultiCliffHeight and makes it human-readable.
 * Example: [[[[0, 1], ["r", 2]]]] => `01\nr2`
 */
const asString = (cliffHeightMap: [[Cliff, Cliff], [Cliff, Cliff]][][]) => {
	const result = [];
	for (let y = 0; y < cliffHeightMap.length; y++) {
		result.push(cliffHeightMap[y].map((v) => v[0].join("")).join("\t"));
		result.push(cliffHeightMap[y].map((v) => v[1].join("")).join("\t"));
		result.push("");
	}

	return result.slice(0, -1).join("\n");
};

describe("calcCliffHeight", () => {
	it("simple 1x1", () => {
		const cliffMask: CliffMask = stringMap(`
			001
			0r1
			001
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	11
				00	00	11

				00	77	11
				00	77	11

				00	00	11
				00	00	11
			`),
		);
	});

	it("simple 1x2", () => {
		const cliffMask: CliffMask = stringMap(`
			001
			0r1
			0r1
			001
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	11
				00	00	11

				00	77	11
				00	77	11

				00	77	11
				00	77	11

				00	00	11
				00	00	11
			`),
		);
	});

	it("simple 2x1", () => {
		const cliffMask: CliffMask = [
			[0, 0, 0, 1],
			[0, "r", "r", 1],
			[0, 0, 0, 1],
		];

		expect(calcCliffHeight(cliffMask, 1, 1));
	});

	it("simple 2x2", () => {
		const cliffMask: CliffMask = [
			[0, 0, 0, 1],
			[0, "r", "r", 1],
			[0, "r", "r", 1],
			[0, 0, 0, 1],
		];

		expect(calcCliffHeight(cliffMask, 1, 1));
	});

	it("complex 2x2", () => {
		const cliffMask: CliffMask = [
			[0, 0, 0, 1],
			[0, 0, "r", 1],
			[0, "r", "r", 1],
			[0, 0, 0, 1],
		];

		expect(calcCliffHeight(cliffMask, 1, 1));
	});
});
