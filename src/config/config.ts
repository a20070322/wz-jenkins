import path from "path";
import os from "os";
import { name } from "../../package.json";

/** 数据存贮目录 */
export const workPath = path.join(os.homedir(), name);

/** 数据任务json存放 */
export const projectPath = path.join(workPath, "project.json");

/** 敏感信息存放 */
export const privacyPath = path.join(workPath, "privacyPath.json");

/** jenkins */
export const jenkinsPath = path.join("deploy", "jenkins.config.js");
