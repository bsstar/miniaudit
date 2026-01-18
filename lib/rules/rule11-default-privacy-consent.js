const fs = require('fs');
const path = require('path');

module.exports = {
    id: 'R11',
    async check({ projectPath, appJson }) {
        const homePage = appJson?.pages?.[0] || 'pages/index/index';
        const wxmlPath = path.join(projectPath, `${homePage}.wxml`);

        if (!fs.existsSync(wxmlPath)) {
            return { level: 'pass', message: '首页 WXML 不存在，跳过检查' };
        }

        const content = fs.readFileSync(wxmlPath, 'utf8');

        // 检测 checkbox 是否默认 checked="true" 或 checked="{{true}}"
        const hasDefaultCheckedCheckbox = /<checkbox[^>]*checked\s*=\s*["']?(true|{{\s*true\s*}})["']?/i.test(content);

        // 检测是否包含“隐私政策”“用户协议”等关键词 + 默认选中
        const hasPrivacyKeywords = /隐私|协议|服务条款|user agreement/i.test(content);

        if (hasDefaultCheckedCheckbox && hasPrivacyKeywords) {
            return {
                level: 'error',
                message: '隐私协议同意框被默认勾选（违反“用户自主选择”原则）',
                location: wxmlPath,
                suggestion: '请移除 checkbox 的 checked 属性，默认不勾选，由用户主动操作'
            };
        }

        return { level: 'pass', message: '未发现默认勾选隐私协议' };
    }
};
