import child_process from "child_process";
import fs from "fs";
import path from "path";
export interface Branch {
  /** 分支名字 */
  branchName: string;
  /** 是否当前选中 */
  isCurrent: boolean;
  /** 分支索引 */
  index: number;
  value: string;
}

/** 判断工程是否存在git */
export const isHasGit = (cwdPath: string): boolean => {
  return fs.existsSync(path.join(cwdPath, ".git"));
};

/** 获取全部分支 */
export const getAllBranch = (path: string): Branch[] => {
  const result = child_process.execSync(`cd ${path} && git br`);
  const branchs = result
    .toString()
    .split("\n")
    .map((item, index) => {
      const isCurrent = item.startsWith("*");
      return {
        branchName: `${item}`.replace(/^\s+/g, ""),
        value: item.replace(/^\*\s+/, ""),
        isCurrent: isCurrent,
        index: index,
      };
    })
    .filter((item) => item.branchName !== "");
  return branchs;
};

/** 获取当前分支 */
export const getCurrentBranch = (path: string): Branch | null => {
  const branchs = getAllBranch(path).filter((item) => item.isCurrent);
  return branchs?.[0];
};

/** 切换分支 */
export const switchBranch = (path: string, branchName: string): string => {
  const result = child_process.execSync(
    `cd ${path} && git checkout ${branchName}`
  );
  return result.toString();
};
