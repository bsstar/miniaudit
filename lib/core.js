// lib/core.js
const fs = require('fs');
const path = require('path');
const rules = require('./rules'); // 自动加载所有规则
const { scanProject } = require('./scanner');

/**
 * 执行审核预检
 * @param {string} projectPath - 小程序项目路径
 * @param {Object} options - CLI 选项 { fix: boolean, verbose: boolean }
 * @returns {Promise<Object>} 报告对象
 */
async function runAudit(projectPath, options = {}) {
    // 验证 app.json 是否存在（基本合法性检查）
    const appJsonPath = path.join(projectPath, 'app.json');
    if (!fs.existsSync(appJsonPath)) {
        throw new Error('无效的小程序项目：未找到 app.json');
    }

    // 执行所有规则检测
    const results = await scanProject(projectPath, rules, options);

    // 汇总统计
    const summary = {
        passed: 0,
        warnings: 0,
        errors: 0
    };

    const issues = [];
    results.forEach(r => {
        if (r.level === 'error') {
            summary.errors++;
            issues.push(r);
        } else if (r.level === 'warn') {
            summary.warnings++;
            issues.push(r);
        } else {
            summary.passed++;
        }
    });

    return {
        projectPath,
        timestamp: new Date().toISOString(),
        summary,
        highRiskCount: summary.errors,
        issues,
        totalRules: rules.length
    };
}

module.exports = { runAudit };
