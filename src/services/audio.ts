import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

export class AudioService {
  private static DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');

  static async ensureDownloadDir() {
    await fs.ensureDir(this.DOWNLOAD_DIR);
  }

  static async downloadAudio(url: string, filename: string): Promise<string> {
    await this.ensureDownloadDir();
    const filePath = path.join(this.DOWNLOAD_DIR, filename);

    if (await fs.pathExists(filePath)) {
      return filePath;
    }

    const spinner = ora(`Downloading audio to ${filename}...`).start();
    try {
      // In a real scenario, we'd download the actual file.
      // For this prototype, we'll create a dummy file if the URL is placeholder.
      if (url.includes('example.com')) {
        await fs.writeFile(filePath, 'Mock audio content');
      } else {
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream'
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', (err) => reject(err));
        });
      }
      spinner.succeed(chalk.green(`Downloaded: ${filename}`));
      return filePath;
    } catch (error) {
      spinner.fail(chalk.red(`Download failed: ${error}`));
      throw error;
    }
  }

  static async playAudio(filePath: string) {
    console.log(chalk.cyan(`Playing: ${path.basename(filePath)}`));
    console.log(chalk.dim('(Press Ctrl+C to stop)'));

    const platform = process.platform;
    let command = '';

    if (platform === 'darwin') {
      command = `afplay "${filePath}"`;
    } else if (platform === 'win32') {
      // Simple way to play on windows using powershell
      command = `powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
    } else {
      // Linux/Others - try to use common players
      command = `play "${filePath}" || aplay "${filePath}" || mpg123 "${filePath}"`;
    }

    try {
      await execAsync(command);
    } catch (error) {
      if ((error as any).killed) return;
      console.error(chalk.red(`Error playing audio: ${error}`));
      console.log(chalk.yellow(`Tip: Please install a command-line audio player for your OS.`));
    }
  }
}
