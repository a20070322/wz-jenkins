// 查看Git 工程配置信息
// git config --list
import child_process from "child_process";

export interface GitSetUserOptions {
  name: string;
  email: string;
  global?: boolean;
}
/** 设置提交代码时的用户信息 */
export const gitSetUser = (options: GitSetUserOptions): GitSetUserOptions => {
  child_process.execSync(
    `git config ${options.global ? "--global" : ""} user.name ${options.name}`
  );
  child_process.execSync(
    `git config ${options.global ? "--global" : ""} user.email ${options.email}`
  );
  return options;
};

/** 获取用户信息 */
export const gitGetUser = (global = false): GitSetUserOptions => {
  const name = child_process
    .execSync(`git config ${global ? "--global" : ""} --get user.name`)
    .toString()
    .replace(/\n/, "");
  const email = child_process
    .execSync(`git config ${global ? "--global" : ""} --get user.email`)
    .toString()
    .replace(/\n/, "");
  return {
    name: name,
    email: email,
  };
};
