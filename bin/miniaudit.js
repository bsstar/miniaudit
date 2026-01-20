#!/usr/bin/env node

// 引入依赖
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const { printReport } = require('../lib/reporter');
// 引入核心逻辑（后续实现）
const { runAudit } = require('../lib/core');

// 创建命令
const program = new Command();

program
    .name('miniaudit')
    .description(chalk.bold.blue('微信小程序审核预检工具 —— 提审前自动排查 13 大雷区'))
    .version('0.1.0')
    // 必选参数：项目路径
    .argument('<projectPath>', '小程序项目根目录路径')
    // 可选参数
    .option('-f, --fix', '自动修复简单问题（如 console.log）')
    .option('-o, --output <format>', '输出格式: terminal (默认), json', 'terminal')
    .option('-v, --verbose', '显示详细日志')
    // 执行动作
    .action(async (projectPath, options) => {
        try {
            // 验证路径是否存在
            const resolvedPath = path.resolve(projectPath);
            if (!require('fs').existsSync(resolvedPath)) {
                console.error(chalk.red(`❌ 路径不存在: ${resolvedPath}`));
                process.exit(1);
            }

            // 显示启动信息
            console.log(chalk.blue(`🔍 正在扫描项目: ${resolvedPath}`));
            if (options.fix) console.log(chalk.yellow('🔧 启用自动修复模式'));

            // 执行核心检测
            const report = await runAudit(resolvedPath, options);

            // 输出结果
            printReport(report, options.output);

            // 如果有高危问题，退出码非 0（便于 CI 判断）
            if (report.highRiskCount > 0) {
                process.exit(1);
            }
        } catch (err) {
            console.error(chalk.red(`💥 运行出错: ${err.message}`));
            if (options.verbose) console.error(err.stack);
            process.exit(1);
        }
    });

// 解析命令行参数并执行
program.parse();
