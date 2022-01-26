import { AxiosInstance, AxiosPromise } from "axios";
/** jenkins 用户授权 */
export interface JenkinsRequestAuthOptions {
    /** jenkins 用户名 */
    username: string;
    /** jenkins token */
    password: string;
}
export interface JenkinsRequestOptions {
    /** jenkins 域名 */
    host: string;
    auth: JenkinsRequestAuthOptions;
}
/**
 * 创建jenkins axios 请求
 * @param options 配置
 * @returns
 */
export declare const createJenkinsRequest: (options: JenkinsRequestOptions) => AxiosInstance;
/**
 * 构建项目
 * @param request axios实例
 * @param jobName 项目名称
 * @returns
 */
export declare const buildJob: (request: AxiosInstance, jobName: string) => AxiosPromise<null>;
/**
 * 构建带参数项目
 * @param request axios实例
 * @param jobName 项目名称
 * @param form 参数
 * @returns
 */
export declare const buildParametersJob: (request: AxiosInstance, jobName: string, form: {
    [key: string]: string | number;
}) => AxiosPromise<null>;
export interface GetJobLastBuildRep {
    /** 构建中 */
    building: boolean;
    /** 描述 */
    description?: string;
    displayName: string;
    /** 展示名字 #${number} */
    duration: number;
    /** 预计构建时间 */
    estimatedDuration: number;
    /** 全名 */
    fullDisplayName: string;
    /** 构建ID */
    id: string;
    /** 构建ID */
    number: number;
    /** 执行队列ID */
    queueId: number;
    /** 结果 */
    result: "FAILURE" | "SUCCESS";
    /** 时间戳 */
    timestamp: number;
}
/**
 * 获取项目最后的结果
 * @param request axios实例
 * @param jobName 项目名称
 * @returns
 */
export declare const getJobLastBuild: (request: AxiosInstance, jobName: string) => AxiosPromise<GetJobLastBuildRep>;
