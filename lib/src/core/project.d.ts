import { JenkinsConfig, ProjectConfig } from "../typings/ProjectConfig";
/**
 * 当前文件是否在项目配置中
 * @returns bool
 */
export declare const getProject: (path: string) => ProjectConfig;
/** 加载Jenkins配置文件 */
export declare const loadJenkinsConfig: (filePath: string) => Promise<JenkinsConfig>;
/** 获取隐私信息 */
export declare const getPrivacyJson: (key: string) => any;
