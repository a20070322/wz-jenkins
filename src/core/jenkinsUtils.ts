import prompts, { PromptObject } from "prompts";
import {
  JenkinsJobConfig,
  ParameterOption,
  ProjectConfig,
} from "../typings/ProjectConfig";
import { getCurrentBranch } from "../utils/git";

/** 获取选中项目 */
export const getCurrentJob = async (
  project: ProjectConfig
): Promise<JenkinsJobConfig | undefined> => {
  const { selectJobIndex } = await prompts(
    [
      {
        type: "select",
        name: "selectJobIndex",
        message: `请选择使用的job`,
        choices: project?.jenkins?.jobs?.map((job, index) => ({
          value: index,
          title: job.aliasName || job.jobName,
        })),
      },
    ],
    {
      onCancel: () => {
        throw new Error("用户退出，程序终止");
      },
    }
  );
  return project?.jenkins?.jobs?.[selectJobIndex];
};

/** 获取运行时参数 */
export const getJobRunParam = async (jenkinsPrompts: ParameterOption[]) => {
  let parameter: { [key: string]: string | number } = {};
  parameter = await prompts(
    jenkinsPrompts
      .filter((item) => item.type === "choose")
      .map((item) => {
        const prompt: PromptObject = {
          type: "select",
          name: item?.name || "",
          message: `请选择${item?.name}`,
          choices: (item?.value as string[]).map((item) => ({
            value: item,
            title: item,
          })),
        };
        return prompt;
      }),
    {
      onCancel: () => {
        throw new Error("程序终止");
      },
    }
  );
  return parameter;
};

/** 自动填充 */
export const getAutoValue = (name: string, path: string) => {
  /** 自动获取GIT当前分支 */
  if (name === "GIT_CURRENT_BRANCH") {
    return `origin/${getCurrentBranch(path)?.value || ""}`;
  }
  return "";
};
