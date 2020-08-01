import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
export default [
	{
		input: "src/index.ts",
		output: [
			{
				file: "dist/bundle.js",
				format: "es",
			},
		],
		plugins: [typescript(), nodeResolve()],
	},
	{
		input: "src/index.ts",
		output: [
			{
				file: "dist/module.js",
				format: "es",
			},
		],
		plugins: [typescript()],
		external: ["three"],
	},
];
