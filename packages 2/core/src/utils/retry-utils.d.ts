export declare function sleep(ms: number): Promise<void>;
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
//# sourceMappingURL=retry-utils.d.ts.map