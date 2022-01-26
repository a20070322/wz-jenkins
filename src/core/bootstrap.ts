import fs from "fs";
import { projectPath, privacyPath, workPath } from "../config/config";

/** 引导程序 初始化工作 */
export const bootstrap = async (): Promise<void | Error> => {
  // 判断数据目录是否存在
  if (!fs.existsSync(workPath)) {
    if (!fs.existsSync(workPath)) {
      fs.mkdirSync(workPath);
    }
  }
  if (!fs.existsSync(projectPath)) {
    fs.writeFileSync(projectPath, "[]", { encoding: "utf-8" });
  }
  if (!fs.existsSync(privacyPath)) {
    fs.writeFileSync(privacyPath, "{}", { encoding: "utf-8" });
  }
};
