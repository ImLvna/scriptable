/// <reference types="bun-types" />

import { readdir, rm, stat } from "fs/promises";
import esbuild from "esbuild";

const blacklisted = ["_common.ts"];

console.log("Building...");

await rm("dist", { recursive: true, force: true });

const files = (await readdir("src")).filter(
  (file) => !blacklisted.includes(file)
);

const contexts: esbuild.BuildContext[] = [];

for (const file of files) {
  let entrypoint = `src/${file}`;

  if ((await stat(entrypoint)).isDirectory()) {
    entrypoint = `${entrypoint}/index.ts`;
  }

  contexts.push(
    await esbuild.context({
      entryPoints: [entrypoint],
      outfile: `dist/${file.replace(".ts", "")}.dev.js`,
      bundle: true,
      minify: true,

      logLevel: "info",
      define: {
        BASE_URL: "'http://192.168.1.40:8080'",
      },
      format: "esm",
    })
  );
}

if (Bun.argv.includes("watch")) {
  await Promise.all(contexts.map((context) => context.watch()));
} else {
  await Promise.all(
    contexts.map(async (context) => {
      await context.rebuild();
      await context.dispose();
    })
  );
}
