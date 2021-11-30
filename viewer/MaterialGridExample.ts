import type { Material } from "three";
import {
	MeshPhongMaterial,
	NearestFilter,
	RepeatWrapping,
	Texture,
} from "three";

import { MaterialGrid as BaseMaterialGrid } from "../src/objects/MaterialGrid";

const QUALITY = 256;
const FILL = 0.8;
const WIDTH = 3;
const HEIGHT = 3;
const textures: Record<number, Texture> = {};
const materials = new Map<Texture, Material>();

const hourglass = (
	ctx: CanvasRenderingContext2D,
	centerX: number,
	centerY: number,
	rotate?: boolean,
): void => {
	const offsetX = QUALITY * centerX;
	const offsetY = QUALITY * centerY;

	const r = rotate ? -1 : 1;

	const half = QUALITY / 2;
	const edge = (QUALITY * (1 - FILL)) / 2;

	const p1 = { x: -half + offsetX, y: edge * r + offsetY };
	const p2 = { x: -edge + offsetX, y: edge * r + offsetY };
	const p3 = { x: edge + offsetX, y: -edge * r + offsetY };
	const p4 = { x: edge + offsetX, y: -half * r + offsetY };

	const p5 = { x: half + offsetX, y: -edge * r + offsetY };
	const p6 = { x: -edge + offsetX, y: half * r + offsetY };

	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
	ctx.lineTo(p5.x, p5.y);
	ctx.bezierCurveTo(p3.x, p3.y, p2.x, p2.y, p6.x, p6.y);
	ctx.lineTo(p1.x, p1.y);
	ctx.fill();
};

const canvasTexture = (
	fn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
): Texture => {
	const canvas = document.createElement("canvas");
	canvas.width = QUALITY;
	canvas.height = QUALITY;

	const context = canvas.getContext("2d")!;
	context.fillStyle = "#133a2b";
	context.fillRect(0, 0, QUALITY, QUALITY);
	context.fillStyle = "#0b4f35";
	fn(context, canvas);

	// Crap hashing; it breaks down if QUALITY is changed
	const bits = context.getImageData(0, 0, QUALITY, QUALITY).data;
	let hash = 0;
	for (let i = 0; i < bits.length; i += 809)
		hash = ((hash + 2217911) * bits[i]) % 14689313;

	if (textures[hash]) return textures[hash];

	const texture = new Texture(canvas);
	texture.needsUpdate = true;
	texture.repeat.set(WIDTH, HEIGHT);
	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.magFilter = texture.minFilter = NearestFilter;

	textures[hash] = texture;

	return texture;
};

const TOPLEFT = 1;
const LEFT = 2;
const BOTLEFT = 4;
const TOP = 8;
const CENTER = 16;
const BOT = 32;
const TOPRIGHT = 64;
const RIGHT = 128;
const BOTRIGHT = 256;

const materialsBitmap = Array(2 ** 9)
	.fill(0)
	.map((_, i) =>
		canvasTexture((ctx) => {
			const half = QUALITY / 2;
			const diameter = QUALITY * FILL;
			const radius = diameter / 2;
			const edge = (QUALITY * (1 - FILL)) / 2;

			if (i & CENTER) {
				ctx.beginPath();
				ctx.ellipse(half, half, radius, radius, 0, 0, 2 * Math.PI);
				ctx.fill();

				if (i & RIGHT) ctx.fillRect(half, edge, half, diameter);
				if (i & LEFT) ctx.fillRect(0, edge, half, diameter);
				if (i & TOP) ctx.fillRect(edge, 0, diameter, half);
				if (i & BOT) ctx.fillRect(edge, half, diameter, half);

				if (i & TOPRIGHT) hourglass(ctx, 1, 0);
				if (i & BOTLEFT) hourglass(ctx, 0, 1);
				if (i & TOPLEFT) hourglass(ctx, 0, 0, true);
				if (i & BOTRIGHT) hourglass(ctx, 1, 1, true);

				if (i & BOT && i & RIGHT) ctx.fillRect(half, half, half, half);
				if (i & BOT && i & LEFT) ctx.fillRect(0, half, half, half);
				if (i & TOP && i & RIGHT) ctx.fillRect(half, 0, half, half);
				if (i & TOP && i & LEFT) ctx.fillRect(0, 0, half, half);
			} else {
				if (i & BOT && i & RIGHT) hourglass(ctx, 1, 1);
				if (i & TOP && i & LEFT) hourglass(ctx, 0, 0);
				if (i & TOP && i & RIGHT) hourglass(ctx, 1, 0, true);
				if (i & BOT && i & LEFT) hourglass(ctx, 0, 1, true);
			}
		}),
	)
	.map((map) => {
		const mat = materials.get(map);
		if (mat) return mat;
		const newMat = new MeshPhongMaterial({ map });
		materials.set(map, newMat);
		return newMat;
	});

export class MaterialGrid extends BaseMaterialGrid {
	constructor() {
		super(WIDTH, HEIGHT);

		const grid: number[][] = Array.from(Array(HEIGHT), () => []);

		for (let x = 0; x < WIDTH; x++)
			for (let y = 0; y < HEIGHT; y++)
				grid[y][x] = Math.round(Math.random());

		const matGrid: number[][] = Array.from(Array(WIDTH), () =>
			Array(HEIGHT).fill(0),
		);

		for (let y = 0; y < HEIGHT; y++)
			for (let x = 0; x < WIDTH; x++) {
				const matIdx =
					(grid[y - 1]?.[x - 1] ?? 0) +
					(grid[y - 1]?.[x] ?? 0) * 2 +
					(grid[y - 1]?.[x + 1] ?? 0) * 4 +
					(grid[y][x - 1] ?? 0) * 8 +
					(grid[y][x] ?? 0) * 16 +
					(grid[y][x + 1] ?? 0) * 32 +
					(grid[y + 1]?.[x - 1] ?? 0) * 64 +
					(grid[y + 1]?.[x] ?? 0) * 128 +
					(grid[y + 1]?.[x + 1] ?? 0) * 256;
				matGrid[y][x] = matIdx;
				this.setMaterial(y, x, materialsBitmap[matIdx]);
			}
	}
}
Object.defineProperty(MaterialGrid, "name", { value: "MaterialGrid" });
