const fs = require('fs');

module.exports = {
    id: 'R5',
    async check({ jsFiles }) {
        const deprecatedApis = {
            'getUserInfo': 'wx.getUserProfile',
            'showModal with showCancel=false': '使用 wx.showActionSheet'
        };

        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('wx.getUserInfo')) {
                return {
                    level: 'warn',
                    message: '使用了已废弃的 wx.getUserInfo',
                    location: file,
                    suggestion: '请改用 wx.getUserProfile（需用户主动触发）'
                };
            }
        }

        return { level: 'pass', message: '未使用废弃 API' };
    }
};
