/**
 * 是否为mac系统
 * @returns
 */
export const isMacOs = () => {
  return process.platform === "darwin";
};

/**
 * 休眠函数
 * @param timer 定时器参数
 * @returns
 */
export const sleep = (timer = 1000) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), timer);
  });
