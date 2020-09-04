import { CliffMask } from "./Terrain";

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
export const stringMap = (map: string): number[][] => {
	const rows = map.split("\n").filter((v) => v.trim());

	const minLeftTrim = commonLeftTrim(rows);

	return rows.map((row) =>
		row
			.trimRight()
			.slice(minLeftTrim)
			.split("")
			.map((v) => {
				const num = parseInt(v);
				if (isNaN(num)) return 0;
				return num;
			}),
	);
};

/**
 * Calculates a CliffMask from a map.
 * Example: `01\nr2` => [[0, 1], ["r", 2]]
 */
export const cliffMap = (map: string): CliffMask => {
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

/** Removes vetical and left white space. */
export const trim = (map: string): string => {
	const rawRows = trimVertical(map.split("\n"));

	const minLeftTrim = commonLeftTrim(rawRows);

	return rawRows.map((row) => row.trimRight().slice(minLeftTrim)).join("\n");
};
