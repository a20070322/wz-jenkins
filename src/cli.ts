import cac from "cac";
import { name, version } from "../package.json";
import { Log } from "./utils/log";
const cli = cac(name);

/** cli命令数组 */
cli.commands = [
  /** 命令行 命令name , 命令描述 , 命令配置 */
  cli.command("", "执行jenkins脚本").action(() => {
    Log.info("我是测试 - info");
    Log.error("我是测试 - error");
    Log.warn("我是测试 - warn");
    return;
  }),
];

/** cli-帮助 */
cli.help();

/** cli-版本*/
cli.version(version);

/** 解析命令行参数 */
cli.parse();

/** 异常处理函数 */
const onError = (err: Error): void => {
  console.error(`错误异常: ${err.message}`);
  console.log(err.stack);
  process.exit(1);
};

/** 监听 uncaughtException 异常 */
process.on("uncaughtException", onError);

/** 监听 unhandledRejection 异常 */
process.on("unhandledRejection", onError);
