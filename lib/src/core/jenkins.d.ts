import { AxiosInstance } from "axios";
import { GetJobLastBuildRep, JenkinsRequestOptions } from "../jenkinsApi/job";
export declare class JenkinsClient {
    /** jenkins 请求实例 */
    request: AxiosInstance;
    constructor(config: JenkinsRequestOptions);
    /** 是否有执行中的任务 */
    getJobLastBuild(jobName: string): Promise<GetJobLastBuildRep>;
    /** 执行编译 */
    buildJob(jobName: string, parameter?: {
        [key: string]: string | number;
    }): Promise<boolean>;
    /** 等待任务是进入队列 */
    waitJobJoinStatus(jobName: string, id: number): Promise<boolean>;
    /** 轮询获取最后一次任务状态 */
    getLoopLastBuildStatus(jobName: string, id: number): Promise<boolean>;
}
