import { getPrivacyJson, getProject, loadJenkinsConfig } from "../core/project";
import path from "path";
import { jenkinsPath } from "../config/config";
import {
  getAutoValue,
  getCurrentJob,
  getJobRunParam,
} from "../core/jenkinsUtils";
import { Parameter } from "../typings/ProjectConfig";
import { Log } from "../utils/log";
import {
  GetJobLastBuildRep,
  JenkinsRequestAuthOptions,
} from "../jenkinsApi/job";
import { JenkinsClient } from "../core/jenkins";

/** 启动jenkins */
export const startJenkinsJob = async () => {
  /** 当期工作目录 */
  const cwd = process.cwd();

  /** 获取项目 */
  const project = getProject(cwd);
  project.jenkins = await loadJenkinsConfig(
    path.join(project.path, jenkinsPath)
  );

  /** 获取用户选择的任务 */
  const currentJob = await getCurrentJob(project);
  if (typeof currentJob === "undefined") {
    throw new Error("未选择jenkins 运行任务");
  }

  /** 运行参数 */
  let runParam: {
    [key: string]: string | number;
  } = {};

  /** 运行参数处理 */
  if (typeof currentJob.parameter !== "undefined") {
    const parameterTmp = currentJob.parameter;
    const jenkinsPrompts = Object.keys(parameterTmp).map(
      (key: keyof Parameter) => parameterTmp[key]
    );
    runParam = await getJobRunParam(jenkinsPrompts);
    jenkinsPrompts
      .filter((item) => item.type === "auto")
      .forEach((item) => {
        runParam[item.name] = getAutoValue(item.value as string, project.path);
      });
    Log.info(`运行参数: ${JSON.stringify(runParam)}`);
  }
  if (project.jenkins.host === "") {
    throw new Error("未配置 Jenkins host");
  }
  const host = project.jenkins.host as string;
  /** 获取Jenkins配置 */
  const auth: JenkinsRequestAuthOptions = getPrivacyJson(host);
  /** 实例化jenkins */
  const client = new JenkinsClient({
    host: host,
    auth: auth,
  });

  const lastBuild = await Log.loadingPromise<GetJobLastBuildRep>(
    `检测[${currentJob.jobName}]是否正在执行任务`,
    client.getJobLastBuild,
    client,
    currentJob.jobName
  );

  /** 本次发布号 */
  const buildNumber = lastBuild.number + 1;

  if (lastBuild.building) {
    await Log.loadingPromise<boolean>(
      `等待[${currentJob.jobName}]的上一个任务执行完毕`,
      client.getLoopLastBuildStatus,
      client,
      currentJob.jobName,
      lastBuild.number
    );
  }

  await Log.loadingPromise<boolean>(
    `推送[${currentJob.jobName}]至队列`,
    client.buildJob,
    client,
    currentJob.jobName,
    runParam
  );

  await Log.loadingPromise<boolean>(
    `推送[${currentJob.jobName}]至执行队列`,
    client.waitJobJoinStatus,
    client,
    currentJob.jobName,
    buildNumber
  );

  await Log.loadingPromise<boolean>(
    `部署[${currentJob.jobName}]至服务器`,
    client.getLoopLastBuildStatus,
    client,
    currentJob.jobName,
    buildNumber
  );
  Log.info(`任务部署成功`);
};
