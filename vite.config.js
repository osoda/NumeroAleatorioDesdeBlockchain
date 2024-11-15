const path = require("path");
import { sync } from "glob";
import pluginPurgeCss from "vite-plugin-purgecss";
import ViteMinifyPlugin from "vite-plugin-minify";

export default {
  root: path.resolve(__dirname, "src"),
  resolve: {
    alias: {
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  server: {
    port: 8080,
    hot: true,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: sync("./src/**/*.html".replace(/\\/g, "/")),
    },
  },
  plugins: [pluginPurgeCss({}), , ViteMinifyPlugin()],
};
