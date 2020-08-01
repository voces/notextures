import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
	{
		input: "viewer/main.ts",
		output: [{ file: "docs/bundle.js", format: "es" }],
		plugins: [
			typescript({
				tsconfigOverride: { compilerOptions: { declaration: false } },
			}),
			nodeResolve(),
		],
	},
	{
		input: "src/index.ts",
		output: [{ file: "dist/index.js", format: "es" }],
		plugins: [typescript()],
		external: ["three"],
	},
];
