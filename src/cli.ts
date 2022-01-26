import cac from "cac";
import chalk from "chalk";
import { name, version } from "../package.json";
import { startJenkinsJob } from "./commands/startJenkins";
import { bootstrap } from "./core/bootstrap";
import { Log } from "./utils/log";
bootstrap();
const cli = cac(name);
/** cli命令数组 */
cli.commands = [
  /** 命令行 命令name , 命令描述 , 命令配置 */
  cli.command("", "执行jenkins脚本").action(startJenkinsJob),
];

/** cli-帮助 */
cli.help();

/** cli-版本*/
cli.version(version);

/** 解析命令行参数 */
cli.parse();

/** 异常处理函数 */
const onError = (err: Error): void => {
  console.log(chalk.red("Error:"), chalk.red(err.message));
  console.log(`${chalk.gray("Stack:")} ${chalk.gray(err.stack)}`);
  process.exit(1);
};

/** 监听 uncaughtException 异常 */
process.on("uncaughtException", onError);

/** 监听 unhandledRejection 异常 */
process.on("unhandledRejection", onError);
