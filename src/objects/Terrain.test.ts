import {
	calcCliffHeight,
	calcCliffHeightCorner,
	CliffMask,
	Cliff,
	CORNERS,
} from "./Terrain";

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

describe("calcCliffHeightCorner", () => {
	const expecetCorners = (
		cliffMask: CliffMask,
		x: number,
		y: number,
		expected: string,
	) => {
		const actual = [
			[
				calcCliffHeightCorner(cliffMask, x, y, CORNERS.TOP_LEFT),
				calcCliffHeightCorner(cliffMask, x, y, CORNERS.TOP_RIGHT),
			],
			[
				calcCliffHeightCorner(cliffMask, x, y, CORNERS.BOTTOM_LEFT),
				calcCliffHeightCorner(cliffMask, x, y, CORNERS.BOTTOM_RIGHT),
			],
		]
			.map((r) => r.join(""))
			.join("\n");

		expect(actual).toEqual(trim(expected));
	};

	it("1x1", () => {
		const cliffMask: CliffMask = stringMap(`
			001
			0r1
			001
		`);

		const expected = `
			01
			01
		`;
		expecetCorners(cliffMask, 1, 1, expected);
	});

	it("2x1", () => {
		const cliffMask: CliffMask = stringMap(`
			0002
			0rr2
			0002
		`);

		const expected1 = `
			01
			01
		`;
		expecetCorners(cliffMask, 1, 1, expected1);

		const expected2 = `
			12
			12
		`;
		expecetCorners(cliffMask, 2, 1, expected2);
	});

	it("2x2", () => {
		const cliffMask: CliffMask = stringMap(`
			0002
			0rr2
			0rr2
			0002
		`);

		const expected1 = `
			01
			01
		`;
		expecetCorners(cliffMask, 1, 1, expected1);

		const expected2 = `
			12
			12
		`;
		expecetCorners(cliffMask, 2, 1, expected2);

		const expected3 = `
			01
			01
		`;
		expecetCorners(cliffMask, 1, 2, expected3);

		const expected4 = `
			12
			12
		`;
		expecetCorners(cliffMask, 2, 2, expected4);
	});
});

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

				00	01	11
				00	01	11

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

				00	01	11
				00	01	11

				00	01	11
				00	01	11

				00	00	11
				00	00	11
			`),
		);
	});

	it("simple 2x1", () => {
		const cliffMask: CliffMask = stringMap(`
			0002
			0rr2
			0002
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	00	22
				00	00	00	22

				00	01	12	22
				00	01	12	22

				00	00	00	22
				00	00	00	22
			`),
		);
	});

	it("simple 2x2", () => {
		const cliffMask: CliffMask = stringMap(`
			0002
			0rr2
			0rr2
			0002
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	00	22
				00	00	00	22

				00	01	12	22
				00	01	12	22

				00	01	12	22
				00	01	12	22

				00	00	00	22
				00	00	00	22
			`),
		);
	});

	it("minor external corner", () => {
		const cliffMask: CliffMask = stringMap(`
			001
			0r0
			000
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	11
				00	00	11

				00	01	00
				00	00	00

				00	00	00
				00	00	00
			`),
		);
	});

	it("external corner", () => {
		const cliffMask: CliffMask = stringMap(`
			0011
			0r11
			0rr0
			0000
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	11	11
				00	00	11	11

				00	01	11	11
				00	01	11	11

				00	01	11	00
				00	00	00	00

				00	00	00	00
				00	00	00	00
			`),
		);
	});

	it.only("full external corner", () => {
		const cliffMask: CliffMask = stringMap(`
			000222
			0rr222
			0rr222
			0rrrr0
			0rrrr0
			000000
		`);

		// expect(asString(calcMultiCliffHeight(cliffMask))).toEqual("");

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	00	22	22	22
				00	00	00	22	22	22

				00	01	12	22	22	22
				00	01	12	22	22	22

				00	01	12	22	22	22
				00	01	12	22	22	22

				00	01	02	22	22	00
				00	00	10	11	11	00

				00	01	01	11	11	00
				00	00	00	00	00	00

				00	00	00	00	00	00
				00	00	00	00	00	00
			`),
		);

		// expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
		// 	trim(`
		// 		00	00	00	22	22	22
		// 		00	00	00	22	22	22

		// 		00	01	12	22	22	22
		// 		00	01	12	22	22	22

		// 		00	01	12	22	22	22
		// 		00	01	12	22	22	22

		// 		00	01	12	22	22	00
		// 		00	01	11	11	11	00

		// 		00	01	11	11	11	00
		// 		00	00	00	00	00	00

		// 		00	00	00	00	00	00
		// 		00	00	00	00	00	00
		// 	`),
		// );
	});
});
