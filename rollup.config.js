// rollup.config.js

const autoExternal = require("rollup-plugin-auto-external");
const sourcemaps = require("rollup-plugin-sourcemaps");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel");
const typescript = require("rollup-plugin-typescript2");
const scss = require("rollup-plugin-scss");

const config = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/index.js",
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    autoExternal({ packagePath: "./package.json" }),
    scss({
      output: "dist/upload-image.min.css",
      outputStyle: "compressed",
    }),
    sourcemaps(),
    babel(),
    commonjs(),
    typescript(),
  ],
};

module.exports = config;

// // rollup.config.js
// import typescript from "@rollup/plugin-typescript";
// import autoExternal from "rollup-plugin-auto-external";
// import sourcemaps from "rollup-plugin-sourcemaps";
// import commonjs from "@rollup/plugin-commonjs";
// import babel from "@rollup/plugin-babel";
// import scss from "rollup-plugin-scss";

// const config = {
//   input: "src/index.ts",
//   output: [
//     {
//       file: "dist/index.cjs.js",
//       format: "cjs",
//       exports: "named",
//       sourcemap: true,
//     },
//     {
//       file: "dist/index.esm.js",
//       format: "esm",
//       sourcemap: true,
//     },
//   ],
//   plugins: [
//     autoExternal({ packagePath: "./package.json" }),
//     scss({
//       output: "dist/upload-image.min.css",
//       outputStyle: "compressed",
//     }),
//     sourcemaps(),
//     babel(),
//     commonjs(),
//     typescript(),
//   ],
// };

// export default config;
