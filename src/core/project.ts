import fs from "fs";
import { privacyPath, projectPath } from "../config/config";
import { JenkinsConfig, ProjectConfig } from "../typings/ProjectConfig";
/**
 * 当前文件是否在项目配置中
 * @returns bool
 */
export const getProject = (path: string): ProjectConfig => {
  const projects: ProjectConfig[] = JSON.parse(
    fs.readFileSync(projectPath, { encoding: "utf8" })
  );
  const index = projects.findIndex((item) => item.path === path);
  if (index == -1) {
    throw new Error(`此目录下不存在项目工程 ${path}`);
  }
  return projects[index];
};

/** 加载Jenkins配置文件 */
export const loadJenkinsConfig = async (
  filePath: string
): Promise<JenkinsConfig> => {
  /** 动态加载模块配置文件 */
  const moduleConfig = await import(filePath);
  let config: JenkinsConfig = {};
  if (typeof moduleConfig.generateConfig === "function") {
    config = await moduleConfig.generateConfig();
  }
  return config;
};

/** 获取隐私信息 */
export const getPrivacyJson = (key: string) => {
  return JSON.parse(fs.readFileSync(privacyPath, { encoding: "utf8" }))[key];
};
