const fs = require('fs');
const path = require('path');

module.exports = {
    id: 'R13',
    async check({ jsFiles, projectPath, appJson }) {
        // 第一步：检查是否使用了 getPhoneNumber
        let usesPhoneAuth = false;
        for (const file of jsFiles) {
            const code = fs.readFileSync(file, 'utf8');
            if (code.includes('wx.getPhoneNumber')) {
                usesPhoneAuth = true;
                break;
            }
        }

        if (!usesPhoneAuth) {
            return { level: 'pass', message: '未使用手机号授权，跳过检查' };
        }

        // 第二步：检查首页 WXML 是否包含“特定人群”“仅限”等说明
        const homePage = appJson?.pages?.[0] || 'pages/index/index';
        const wxmlPath = path.join(projectPath, `${homePage}.wxml`);

        if (!fs.existsSync(wxmlPath)) {
            return {
                level: 'error',
                message: '使用了手机号授权，但首页 WXML 不存在，无法验证说明文案',
                suggestion: '请在首页添加文字说明：本服务仅限 XXX 人员使用'
            };
        }

        const content = fs.readFileSync(wxmlPath, 'utf8');
        const hasSpecificNotice = /特定人群|仅限|专用|内部|员工|学生|会员/i.test(content);

        if (!hasSpecificNotice) {
            return {
                level: 'error',
                message: '使用了手机号授权，但首页未说明“仅限特定人群使用”',
                location: wxmlPath,
                suggestion: '请在首页显眼位置添加说明文字，例如：“本小程序仅限公司员工使用”'
            };
        }

        return { level: 'pass', message: '已提供特定人群使用说明' };
    }
};
