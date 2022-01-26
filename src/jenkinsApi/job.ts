import axios, { AxiosInstance, AxiosPromise } from "axios";
import qs from "qs";

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
export const createJenkinsRequest = (options: JenkinsRequestOptions) => {
  const request = axios.create({
    baseURL: options.host,
    auth: options.auth,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  request.interceptors.request.use(function (config) {
    if (config.method !== "get" && config.method !== "GET") {
      config.data = qs.stringify(config.data || {});
    }
    return config;
  });
  return request;
};

/**
 * 构建项目
 * @param request axios实例
 * @param jobName 项目名称
 * @returns
 */
export const buildJob = (
  request: AxiosInstance,
  jobName: string
): AxiosPromise<null> => {
  return request({
    url: `/job/${jobName}/build/api/json`,
    method: "POST",
  });
};

/**
 * 构建带参数项目
 * @param request axios实例
 * @param jobName 项目名称
 * @param form 参数
 * @returns
 */
export const buildParametersJob = (
  request: AxiosInstance,
  jobName: string,
  form: { [key: string]: number | string }
): AxiosPromise<null> => {
  return request({
    url: `/job/${jobName}/buildWithParameters`,
    method: "POST",
    data: form,
  });
};
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
export const getJobLastBuild = (
  request: AxiosInstance,
  jobName: string
): AxiosPromise<GetJobLastBuildRep> => {
  return request({
    url: `/job/${jobName}/lastBuild/api/json`,
    method: "GET",
  });
};
