export interface Branch {
    /** 分支名字 */
    branchName: string;
    /** 是否当前选中 */
    isCurrent: boolean;
    /** 分支索引 */
    index: number;
    value: string;
}
/** 判断工程是否存在git */
export declare const isHasGit: (cwdPath: string) => boolean;
/** 获取全部分支 */
export declare const getAllBranch: (path: string) => Branch[];
/** 获取当前分支 */
export declare const getCurrentBranch: (path: string) => Branch | null;
/** 切换分支 */
export declare const switchBranch: (path: string, branchName: string) => string;
