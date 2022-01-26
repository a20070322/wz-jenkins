import { JenkinsJobConfig, ParameterOption, ProjectConfig } from "../typings/ProjectConfig";
/** 获取选中项目 */
export declare const getCurrentJob: (project: ProjectConfig) => Promise<JenkinsJobConfig | undefined>;
/** 获取运行时参数 */
export declare const getJobRunParam: (jenkinsPrompts: ParameterOption[]) => Promise<{
    [key: string]: string | number;
}>;
/** 自动填充 */
export declare const getAutoValue: (name: string, path: string) => string;
