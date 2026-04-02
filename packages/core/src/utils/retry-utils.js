"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.retryWithBackoff = retryWithBackoff;
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            const delay = initialDelay * Math.pow(2, i);
            console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
    throw lastError;
}
//# sourceMappingURL=retry-utils.js.map