const fs = require('fs');
const path = require('path');

// 简化类目关键词映射（实际可扩展）
const categoryKeywords = {
    '53': ['支付', '购买', '下单', '订单'], // 电商
    '3': ['课程', '学习', '教育'],         // 教育
};

module.exports = {
    id: 'R7',
    async check({ projectPath, appJson }) {
        const category = appJson?.category || '0';
        const allowedWords = categoryKeywords[category] || [];

        if (allowedWords.length === 0) return { level: 'pass', message: '无法识别类目，跳过检查' };

        // 读取首页 WXML
        const homePage = appJson?.pages?.[0] || 'pages/index/index';
        const wxmlPath = path.join(projectPath, `${homePage}.wxml`);

        if (!fs.existsSync(wxmlPath)) return { level: 'pass', message: '首页未找到，跳过检查' };

        const content = fs.readFileSync(wxmlPath, 'utf8');
        const forbiddenWords = Object.values(categoryKeywords)
            .flat()
            .filter(word => !allowedWords.includes(word))
            .filter(word => content.includes(word));

        if (forbiddenWords.length > 0) {
            return {
                level: 'warn',
                message: `首页包含与类目不符的关键词: ${forbiddenWords.slice(0, 3).join(', ')}`,
                location: wxmlPath,
                suggestion: '请修改文案或调整小程序类目'
            };
        }

        return { level: 'pass', message: '首页内容与类目一致' };
    }
};
