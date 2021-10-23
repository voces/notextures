import type { Cliff, CliffMask } from "./Terrain";
import { calcCliffHeight, calcCliffHeightCorner, CORNERS } from "./Terrain";
import { cliffMap, trim } from "./utils";

/** Calls calcCliffHeight on each cell and reformats it as a tuple of tuples. */
const calcMultiCliffHeight = (cliffMask: CliffMask) => {
	const results: [[number, number], [number, number]][][] = [];
	for (let y = 0; y < cliffMask.length; y++) {
		results[y] = [];
		for (let x = 0; x < cliffMask[y].length; x++) {
			const { topLeft, topRight, bottomLeft, bottomRight } =
				calcCliffHeight(cliffMask, x, y);
			results[y][x] = [
				[topLeft, topRight],
				[bottomLeft, bottomRight],
			];
		}
	}
	return results;
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
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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

	describe("long external corner", () => {
		const cliffMask: CliffMask = cliffMap(`
			00022
			0rr22
			0rrr0
			0rrr0
			00000
		`);

		it("close corner", () => {
			const expected4 = `
				12
				11
			`;
			expecetCorners(cliffMask, 2, 2, expected4);
		});
	});
});

describe("calcCliffHeight", () => {
	it("simple 1x1", () => {
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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
		const cliffMask: CliffMask = cliffMap(`
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

	it("full external corner", () => {
		const cliffMask: CliffMask = cliffMap(`
			000222
			0rr222
			0rr222
			0rrrr0
			0rrrr0
			000000
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	00	00	22	22	22
				00	00	00	22	22	22

				00	01	12	22	22	22
				00	01	12	22	22	22

				00	01	12	22	22	22
				00	01	12	22	22	22

				00	01	12	22	22	00
				00	01	11	11	11	00

				00	01	11	11	11	00
				00	00	00	00	00	00

				00	00	00	00	00	00
				00	00	00	00	00	00
			`),
		);
	});

	it("minor internal corner", () => {
		const cliffMask: CliffMask = cliffMap(`
			011
			0r1
			000
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	11	11
				00	11	11

				00	11	11
				00	01	11

				00	00	00
				00	00	00
			`),
		);
	});

	it("internal corner", () => {
		const cliffMask: CliffMask = cliffMap(`
			0222
			0rr2
			0rr2
			0000
		`);

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	22	22	22
				00	22	22	22

				00	22	22	22
				00	11	12	22

				00	11	12	22
				00	01	12	22

				00	00	00	00
				00	00	00	00
			`),
		);
	});

	it.only("full internal corner", () => {
		const cliffMask: CliffMask = cliffMap(`
			02222
			0rrr2
			0rrr2
			00rr2
			00000
		`);

		// expect(asString(calcMultiCliffHeight(cliffMask))).toEqual("");

		expect(asString(calcMultiCliffHeight(cliffMask))).toEqual(
			trim(`
				00	22	22	22	22
				00	22	22	22	22

				00	22	22	22	22
				00	11	11	12	22

				00	11	11	12	22
				00	01	11	12	22

				00	00	11	12	22
				00	00	01	12	22

				00	00	00	00	00
				00	00	00	00	00
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
