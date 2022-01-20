import cac from "cac";
import { name, version } from "../package.json";
import chalk from "chalk";
import ora from "ora";
import logSymbols from "log-symbols";
const cli = cac(name);

/** cli命令数组 */
cli.commands = [
  /** 命令行 命令name , 命令描述 , 命令配置 */
  cli.command("", "执行jenkins脚本").action(() => {
    console.log("hello cli");
  }),
  cli.command("chalk", "test console color").action(() => {
    console.log(chalk.blue("Hello cli!"));
    console.log(chalk.blue("Hello") + " World" + chalk.red("!"));
    console.log(chalk.blue.bgRed.bold("Hello world!"));
    console.log(chalk.blue("Hello", "World!", "Foo", "bar", "biz", "baz"));
    console.log(chalk.red("Hello", chalk.underline.bgBlue("world") + "!"));
    console.log(
      chalk.green(
        "I am a green line " +
          chalk.blue.underline.bold("https://github.com/") +
          " that becomes green again!"
      )
    );
    console.log(`
      CPU: ${chalk.red("90%")}
      RAM: ${chalk.green("40%")}
      DISK: ${chalk.yellow("70%")}
    `);
    console.log(chalk.rgb(123, 45, 67).underline("Underlined reddish color"));
    console.log(chalk.hex("#DEADED").bold("Bold gray!"));
    const error = chalk.bold.red;
    const warning = chalk.hex("#FFA500");
    console.log(error("Error!"));
    console.log(warning("Warning!"));
    const name = "Sindre";
    console.log(chalk.green("Hello %s"), name);
  }),
  cli.command("ora", "test console color").action(async () => {
    /**
     * 模拟耗时任务
     * @param timer 定时器参数
     * @returns
     */
    const sleep = (timer = 1000) =>
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), timer);
      });
    /** 开启任务1 loading状态 */
    const spinnerTask1 = ora("run mock task one").start();
    await sleep();
    /** 结束任务1 并且保留内容且改为成功标识 */
    spinnerTask1.stopAndPersist({
      prefixText: logSymbols.success,
    });
    /** 开启任务2 loading状态 */
    const spinnerTask2 = ora("run mock task two").start();
    await sleep();
    /** 结束任务2 并且保留内容且改为错误标识 */
    spinnerTask2.stopAndPersist({
      prefixText: logSymbols.error,
    });
    /** 开启任务3 loading状态 */
    const spinnerTask3 = ora("run mock task three").start();
    await sleep();
    /** 结束任务3 清除浏览器输出 */
    spinnerTask3.stop();
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
