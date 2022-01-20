/** 将json转换为ES6模块 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const json = require("@rollup/plugin-json");

/** rollup解析及编译TS插件 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typescript = require("@rollup/plugin-typescript");

/** 解析代码中依赖的node_modules */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const resolve = require("@rollup/plugin-node-resolve");

/** 将 CommonJS 模块转换为 ES6 的 Rollup 插件 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonjs = require("@rollup/plugin-commonjs");

/** rollup文件夹清除插件 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cleandir } = require("rollup-plugin-cleandir");

module.exports = {
  /** 打包入口文件 */
  input: ["./src/index.ts", "./src/cli.ts"],
  /** 输出配置 */
  output: {
    /** 输出目录 */
    dir: "./lib",
    /** 输出文件为 CommonJS格式 */
    format: "cjs",
  },
  plugins: [
    /** 配置插件 - 每次打包清除目标文件 */
    cleandir("./lib"),
    /** 配置插件 - 将json转换为ES6模块 */
    json(),
    /** 配置插件 - 将json转换为ES6模块 */
    typescript({
      module: "esnext",
      exclude: ["./node_modules/**"],
    }),
    resolve.default({
      extensions: [".js", ".ts", ".json"],
      modulesOnly: true,
      preferredBuiltins: false,
    }),
    commonjs({ extensions: [".js", ".ts", ".json"] }),
  ],
};
