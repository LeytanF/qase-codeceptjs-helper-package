/**
 * Logger utility for Qase helper
 */
export declare class Logger {
    private static instance;
    private debugMode;
    private constructor();
    static getInstance(): Logger;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error | any): void;
    debug(message: string, data?: any): void;
    setDebugMode(enabled: boolean): void;
}
//# sourceMappingURL=Logger.d.ts.map