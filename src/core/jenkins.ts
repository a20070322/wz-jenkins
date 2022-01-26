import { AxiosInstance } from "axios";
import {
  buildJob,
  buildParametersJob,
  createJenkinsRequest,
  getJobLastBuild,
  GetJobLastBuildRep,
  JenkinsRequestOptions,
} from "../jenkinsApi/job";
import { sleep } from "../utils/os";

export class JenkinsClient {
  /** jenkins 请求实例 */
  request: AxiosInstance;

  constructor(config: JenkinsRequestOptions) {
    /** 创建axios请求实例 */
    this.request = createJenkinsRequest(config);
  }

  /** 是否有执行中的任务 */
  async getJobLastBuild(jobName: string): Promise<GetJobLastBuildRep> {
    const { data } = await getJobLastBuild(this.request, jobName);
    return data;
  }

  /** 执行编译 */
  async buildJob(
    jobName: string,
    parameter: { [key: string]: string | number } = {}
  ): Promise<boolean> {
    /**判断构建是否有参数 */
    if (Object.keys(parameter).length > 0) {
      await buildParametersJob(this.request, jobName, parameter);
    } else {
      await buildJob(this.request, jobName);
    }
    return true;
  }

  /** 等待任务是进入队列 */
  async waitJobJoinStatus(jobName: string, id: number): Promise<boolean> {
    const { data } = await getJobLastBuild(this.request, jobName);
    if (data.number !== id) {
      await sleep();
      return await this.waitJobJoinStatus(jobName, id);
    }
    return true;
  }

  /** 轮询获取最后一次任务状态 */
  async getLoopLastBuildStatus(jobName: string, id: number): Promise<boolean> {
    const { data } = await getJobLastBuild(this.request, jobName);
    if (data.building || data.number !== id) {
      await sleep();
      return await this.getLoopLastBuildStatus(jobName, id);
    }
    if (data.result !== "SUCCESS") {
      throw new Error(`任务执行失败---${data.result}`);
    }
    return true;
  }
}
