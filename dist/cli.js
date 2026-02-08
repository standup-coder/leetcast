#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const leetcode_1 = require("./services/leetcode");
const mcp_1 = require("./services/mcp");
const audio_1 = require("./services/audio");
const prompts_1 = __importDefault(require("prompts"));
const program = new commander_1.Command();
program
    .name('leetcast')
    .description('LeetCast: Listen to LeetCode problem explanations as podcasts.')
    .version('1.0.0');
program
    .command('list')
    .description('List popular LeetCode problems')
    .action(async () => {
    const problems = await leetcode_1.LeetCodeService.getPopularProblems();
    console.log(chalk_1.default.bold.blue('\n--- Popular LeetCode Problems ---\n'));
    problems.forEach(p => {
        const difficultyColor = p.difficulty === 'Easy' ? chalk_1.default.green : (p.difficulty === 'Medium' ? chalk_1.default.yellow : chalk_1.default.red);
        console.log(`${chalk_1.default.bold(p.id.padStart(3))} | ${p.title.padEnd(40)} | ${difficultyColor(p.difficulty)}`);
    });
    console.log('');
});
program
    .command('listen <id>')
    .description('Generate and listen to a podcast for a specific problem')
    .action(async (id) => {
    const problem = await leetcode_1.LeetCodeService.getProblemById(id);
    if (!problem) {
        console.error(chalk_1.default.red(`Problem with ID ${id} not found.`));
        return;
    }
    console.log(chalk_1.default.cyan(`Selected: ${problem.title} (${problem.difficulty})`));
    try {
        const podcast = await mcp_1.MCPService.generatePodcast(problem);
        console.log(chalk_1.default.green(`Podcast generated: ${podcast.title}`));
        const filePath = await audio_1.AudioService.downloadAudio(podcast.audioUrl, `lc-${id}.mp3`);
        await audio_1.AudioService.playAudio(filePath);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error}`));
    }
});
program
    .command('search <query>')
    .description('Search for problems by title or topic')
    .action(async (query) => {
    const results = await leetcode_1.LeetCodeService.searchProblems(query);
    if (results.length === 0) {
        console.log(chalk_1.default.yellow(`No problems found matching "${query}"`));
        return;
    }
    console.log(chalk_1.default.bold.blue(`\n--- Search Results for "${query}" ---\n`));
    results.forEach(p => {
        const difficultyColor = p.difficulty === 'Easy' ? chalk_1.default.green : (p.difficulty === 'Medium' ? chalk_1.default.yellow : chalk_1.default.red);
        console.log(`${chalk_1.default.bold(p.id.padStart(3))} | ${p.title.padEnd(40)} | ${difficultyColor(p.difficulty)}`);
    });
    console.log('');
});
program
    .command('interactive')
    .alias('i')
    .description('Start interactive mode')
    .action(async () => {
    const problems = await leetcode_1.LeetCodeService.getPopularProblems();
    const response = await (0, prompts_1.default)({
        type: 'select',
        name: 'problem',
        message: 'Select a problem to listen to:',
        choices: problems.map(p => ({
            title: `${p.id} - ${p.title} (${p.difficulty})`,
            value: p
        }))
    });
    if (response.problem) {
        const p = response.problem;
        const podcast = await mcp_1.MCPService.generatePodcast(p);
        const filePath = await audio_1.AudioService.downloadAudio(podcast.audioUrl, `lc-${p.id}.mp3`);
        await audio_1.AudioService.playAudio(filePath);
    }
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
