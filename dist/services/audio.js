"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class AudioService {
    static DOWNLOAD_DIR = path_1.default.join(process.cwd(), 'downloads');
    static async ensureDownloadDir() {
        await fs_extra_1.default.ensureDir(this.DOWNLOAD_DIR);
    }
    static async downloadAudio(url, filename) {
        await this.ensureDownloadDir();
        const filePath = path_1.default.join(this.DOWNLOAD_DIR, filename);
        if (await fs_extra_1.default.pathExists(filePath)) {
            return filePath;
        }
        const spinner = (0, ora_1.default)(`Downloading audio to ${filename}...`).start();
        try {
            // In a real scenario, we'd download the actual file.
            // For this prototype, we'll create a dummy file if the URL is placeholder.
            if (url.includes('example.com')) {
                await fs_extra_1.default.writeFile(filePath, 'Mock audio content');
            }
            else {
                const response = await (0, axios_1.default)({
                    url,
                    method: 'GET',
                    responseType: 'stream',
                });
                const writer = fs_extra_1.default.createWriteStream(filePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', () => resolve());
                    writer.on('error', (err) => reject(err));
                });
            }
            spinner.succeed(chalk_1.default.green(`Downloaded: ${filename}`));
            return filePath;
        }
        catch (error) {
            spinner.fail(chalk_1.default.red(`Download failed: ${error}`));
            throw error;
        }
    }
    static async playAudio(filePath) {
        console.log(chalk_1.default.cyan(`Playing: ${path_1.default.basename(filePath)}`));
        console.log(chalk_1.default.dim('(Press Ctrl+C to stop)'));
        const platform = process.platform;
        let command = '';
        if (platform === 'darwin') {
            command = `afplay "${filePath}"`;
        }
        else if (platform === 'win32') {
            // Simple way to play on windows using powershell
            command = `powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
        }
        else {
            // Linux/Others - try to use common players
            command = `play "${filePath}" || aplay "${filePath}" || mpg123 "${filePath}"`;
        }
        try {
            await execAsync(command);
        }
        catch (error) {
            if (error.killed)
                return;
            console.error(chalk_1.default.red(`Error playing audio: ${error}`));
            console.log(chalk_1.default.yellow(`Tip: Please install a command-line audio player for your OS.`));
        }
    }
}
exports.AudioService = AudioService;
//# sourceMappingURL=audio.js.map