/**
 * 是否为mac系统
 * @returns
 */
export const isMacOs = () => {
  return process.platform === "darwin";
};
