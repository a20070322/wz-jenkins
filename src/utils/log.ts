import chalk from "chalk";
import logSymbols from "log-symbols";
import ora from "ora";

/** logger 封装，因目前是node环境 所以暂不使用此方法 */
// const logger = (...args1) => {
//   return Function.prototype.bind.apply(console.log, [console.log, ...args1]);
// };

/** 获取堆栈信息 */
const getStackTrace = function () {
  const obj: Error = { name: "", message: "" };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack || "";
};

/** 控制台输出封装 */
export const Log = {
  /** info */
  info(...args: unknown[]) {
    console.log(chalk.cyan("Info:"), chalk.cyan(...args));
  },
  /** warn */
  warn(...args: unknown[]) {
    console.log(chalk.yellow("Warn:"), chalk.yellow(...args));
  },
  /** error */
  error(...args: unknown[]) {
    console.log(chalk.red("Error:"), chalk.red(...args));
    const stack = getStackTrace() || "";
    const matchResult = stack.match(/\(.*?\)/g) || [];
    const line = matchResult[1] || "";
    console.log(`${chalk.gray("Error stack:")} ${chalk.gray(line)}`);
  },
  /**
   * loadingPromise
   * @param msg 值
   * @param fn 异步函数
   * @returns
   */
  async loadingPromise<T>(msg: string, fn: () => Promise<T>) {
    const spinner = ora(chalk.cyan(`Loading ${msg}`)).start();
    try {
      const result = await fn();
      spinner.stopAndPersist({
        prefixText: logSymbols.success,
        text: chalk.green(`Success ${msg}`),
      });
      return result;
    } catch (error) {
      spinner.color = "red";
      spinner.stopAndPersist({
        prefixText: logSymbols.error,
        text: chalk.red(`Error ${msg}`),
      });
      throw error;
    }
  },
};
