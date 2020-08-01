import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
export default [
	{
		input: "viewer/main.ts",
		output: [{ file: "public/bundle.js", format: "es" }],
		plugins: [
			typescript({
				tsconfigOverride: { compilerOptions: { declaration: false } },
			}),
			nodeResolve(),
		],
	},
	{
		input: "src/index.ts",
		output: [{ file: "dist/module.js", format: "es" }],
		plugins: [typescript()],
		external: ["three"],
	},
];
