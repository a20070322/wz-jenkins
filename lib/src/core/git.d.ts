export interface GitSetUserOptions {
    name: string;
    email: string;
    global?: boolean;
}
/** 设置提交代码时的用户信息 */
export declare const gitSetUser: (options: GitSetUserOptions) => GitSetUserOptions;
/** 获取用户信息 */
export declare const gitGetUser: (global?: boolean) => GitSetUserOptions;
