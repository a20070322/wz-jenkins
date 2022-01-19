import cac from "cac";
import { name, version } from "../package.json";

const cli = cac(name);

/** cli命令数组 */
cli.commands = [
  /** 命令name , 命令描述 , 命令配置 */
  cli.command("", "执行jenkins脚本").action(() => {
    console.log("hello cli");
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
