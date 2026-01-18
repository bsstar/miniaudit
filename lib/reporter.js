// lib/reporter.js
const chalk = require('chalk');

function printReport(report, format = 'terminal') {
    if (format === 'json') {
        console.log(JSON.stringify(report, null, 2));
        return;
    }

    console.log('\n' + chalk.bold.blue('📊 微信小程序审核预检报告'));
    console.log(chalk.dim(`项目路径: ${report.projectPath}`));
    console.log('─'.repeat(60));

    const { summary } = report;
    console.log(chalk.green(`✅ 通过: ${summary.passed}/${report.totalRules} 项`));
    if (summary.warnings > 0) {
        console.log(chalk.yellow(`⚠️  警告: ${summary.warnings} 项`));
    }
    if (summary.errors > 0) {
        console.log(chalk.red(`❌ 高危: ${summary.errors} 项`));
    }

    if (report.issues.length > 0) {
        console.log('\n' + chalk.bold('🔍 问题详情:'));
        report.issues.forEach((issue, i) => {
            const prefix = `${i + 1}. `;
            const color = issue.level === 'error' ? chalk.red : chalk.yellow;
            console.log(color(`${prefix}[${issue.ruleId}] ${issue.message}`));
            if (issue.location) console.log(`   ${chalk.dim('→ 位置:')} ${issue.location}`);
            if (issue.suggestion) console.log(`   ${chalk.dim('→ 建议:')} ${issue.suggestion}`);
            console.log('');
        });
    }

    // 结论
    if (summary.errors === 0) {
        console.log(chalk.green('🎉 恭喜！未发现高危问题，可放心提审！'));
    } else {
        console.log(chalk.red('💡 提示：修复高危项后，预计审核通过率 > 95%'));
    }
}

module.exports = { printReport };
