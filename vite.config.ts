import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const isLibBuild = mode === "lib";

  return {
    plugins: [vue()],
    build: isLibBuild
      ? {
          outDir: "dist/lib",
          emptyOutDir: true,
          lib: {
            entry: "src/lib/masonry-grid/index.ts",
            name: "MasonryGrid",
            formats: ["es", "umd"],
            cssFileName: "style",
            fileName: (format) =>
              format === "es" ? "masonry-grid.js" : "masonry-grid.umd.cjs",
          },
          rollupOptions: {
            external: ["vue"],
            output: {
              exports: "named",
              globals: {
                vue: "Vue",
              },
            },
          },
        }
      : {
          outDir: "dist/demo",
          emptyOutDir: true,
        },
  };
});
