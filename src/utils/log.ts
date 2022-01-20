import chalk from "chalk";

/** 获取堆栈信息 */
const getStackTrace = function () {
  const obj: Error = { name: "", message: "" };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack || "";
};

export const Log = {
  /** info */
  info(...args: unknown[]) {
    const log = console.log;
    log.call(console, chalk.cyan("Info:"), chalk.cyan(...args));
  },
  /** warn */
  warn(...args: unknown[]) {
    const log = console.log;
    log.call(console, chalk.yellow("Warn:"), chalk.yellow(...args));
  },
  /** error */
  error(...args: unknown[]) {
    const log = console.log;
    log.call(console, chalk.red("Error:"), chalk.red(...args));
    const stack = getStackTrace() || "";
    const matchResult = stack.match(/\(.*?\)/g) || [];
    const line = matchResult[1] || "";
    console.log(`${chalk.gray("Error stack:")} ${chalk.gray(line)}`);
  },
};
