/** 控制台输出封装 */
export declare const Log: {
    /** info */
    info(...args: unknown[]): void;
    /** warn */
    warn(...args: unknown[]): void;
    /** error */
    error(...args: unknown[]): void;
    /**
     * loadingPromise
     * @param msg 值
     * @param fn 异步函数
     * @returns
     */
    loadingPromise<T>(msg: string, fn: (...arg: any[]) => Promise<T>, that: unknown, ...arg: any[]): Promise<T>;
};
