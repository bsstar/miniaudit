// lib/scanner.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const parseJS = require('./utils/parseJS');

/**
 * 扫描项目并运行所有规则
 */
async function scanProject(projectPath, rules, options = {}) {
    // 收集文件
    const jsFiles = glob.sync(path.join(projectPath, '**/*.js'), {
        ignore: ['node_modules/**', 'miniprogram_npm/**']
    });
    const wxmlFiles = glob.sync(path.join(projectPath, '**/*.wxml'));

    const appJsonPath = path.join(projectPath, 'app.json');
    const appJson = fs.existsSync(appJsonPath) ? JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) : null;

    const context = {
        jsFiles,
        wxmlFiles,
        appJson,
        projectPath,
        parseJS,
        fix: !!options.fix,
        verbose: !!options.verbose
    };

    // 并行执行所有规则（或串行，按需）
    const results = [];
    for (const rule of rules) {
        try {
            const result = await rule.check(context);
            // 确保结果格式统一
            results.push({
                ruleId: rule.id || rule.name,
                level: result.level || 'pass',
                message: result.message || 'OK',
                location: result.location,
                suggestion: result.suggestion
            });
        } catch (err) {
            // 规则出错不中断整体流程
            results.push({
                ruleId: rule.id || 'unknown',
                level: 'error',
                message: `规则执行失败: ${err.message}`,
                suggestion: '请提交 Issue 到 GitHub'
            });
        }
    }

    return results;
}

module.exports = { scanProject };
