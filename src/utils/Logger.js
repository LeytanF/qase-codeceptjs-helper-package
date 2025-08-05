"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * Logger utility for Qase helper
 */
class Logger {
    constructor() {
        this.debugMode = process.env.QASE_DEBUG === 'true' || process.env.NODE_ENV === 'development';
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    info(message, data) {
        console.log(`[Qase Helper] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    warn(message, data) {
        console.warn(`[Qase Helper] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    error(message, error) {
        console.error(`[Qase Helper] ERROR: ${message}`);
        if (error) {
            if (error instanceof Error) {
                console.error(`Stack: ${error.stack}`);
            }
            else {
                console.error(`Details: ${JSON.stringify(error, null, 2)}`);
            }
        }
    }
    debug(message, data) {
        if (this.debugMode) {
            console.debug(`[Qase Helper] DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
        }
    }
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map