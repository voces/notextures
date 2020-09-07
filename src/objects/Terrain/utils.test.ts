import { stringMap, cliffMap } from "./utils";

describe("stringMap", () => {
	it("works", () => {
		expect(
			stringMap(`
                123
                4 6
                789
            `),
		).toEqual([
			[1, 2, 3],
			[4, 0, 6],
			[7, 8, 9],
		]);
	});

	it("accepts a fill", () => {
		expect(
			stringMap(
				`
                    123
                    4 6
                    789
                `,
				15,
			),
		).toEqual([
			[1, 2, 3],
			[4, 15, 6],
			[7, 8, 9],
		]);
	});
});

describe("cliffMap", () => {
	it("works", () => {
		expect(
			cliffMap(`
                123
                4r6
                789
            `),
		).toEqual([
			[1, 2, 3],
			[4, "r", 6],
			[7, 8, 9],
		]);
	});

	it("allows holes", () => {
		expect(
			cliffMap(`
                123
                4 6
                789
            `),
		).toEqual([
			[1, 2, 3],
			[4, NaN, 6],
			[7, 8, 9],
		]);
	});

	it("interpolates left", () => {
		expect(
			cliffMap(`
                12
                3.
            `),
		).toEqual([
			[1, 2],
			[3, 3],
		]);
	});

	it("interpolates up if ramp is left", () => {
		expect(
			cliffMap(`
                12
                r.
            `),
		).toEqual([
			[1, 2],
			["r", 2],
		]);
	});

	it("interpolates over many gaps", () => {
		expect(
			cliffMap(`
                5........
            `),
		).toEqual([[5, 5, 5, 5, 5, 5, 5, 5, 5]]);
	});
});
