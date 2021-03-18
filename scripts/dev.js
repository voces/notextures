import esbuild from "esbuild";

const finishSrc = () => {
	console.log("Finished building src");
};

esbuild
	.build({
		entryPoints: ["src/index.ts"],
		external: ["three"],
		bundle: true,
		sourcemap: true,
		format: "esm",
		outdir: "dist",
		watch: { onRebuild: finishSrc },
	})
	.then(finishSrc);

const finishViewer = () => {
	console.log("Finished building viewer");
};

esbuild
	.build({
		entryPoints: ["viewer/main.ts"],
		bundle: true,
		sourcemap: true,
		format: "esm",
		outdir: "docs",
		watch: { onRebuild: finishViewer },
	})
	.then(finishViewer);
