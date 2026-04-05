"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class CacheManager {
    static CACHE_DIR = path_1.default.join(process.cwd(), 'data');
    static CACHE_FILE = path_1.default.join(this.CACHE_DIR, 'problems-cache.json');
    static async loadCache() {
        if (await fs_extra_1.default.pathExists(this.CACHE_FILE)) {
            try {
                return await fs_extra_1.default.readJson(this.CACHE_FILE);
            }
            catch (error) {
                console.error('Failed to read cache file:', error);
                return [];
            }
        }
        return [];
    }
    static async saveCache(problems) {
        await fs_extra_1.default.ensureDir(this.CACHE_DIR);
        await fs_extra_1.default.writeJson(this.CACHE_FILE, problems, { spaces: 2 });
    }
    static async clearCache() {
        if (await fs_extra_1.default.pathExists(this.CACHE_FILE)) {
            await fs_extra_1.default.remove(this.CACHE_FILE);
        }
    }
    static getCachePath() {
        return this.CACHE_FILE;
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cache-manager.js.map