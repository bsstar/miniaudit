const fs = require('fs');

module.exports = {
    id: 'R8',
    async check({ jsFiles }) {
        const reportableApis = ['startRecord', 'openBluetoothAdapter', 'startWifi'];
        const used = [];

        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            for (const api of reportableApis) {
                if (content.includes(`wx.${api}`)) {
                    used.push(api);
                }
            }
        }

        if (used.length > 0) {
            return {
                level: 'warn',
                message: `使用了需报备的能力: ${used.join(', ')}`,
                suggestion: '请登录微信公众平台 → 开发管理 → 接口设置，完成能力报备'
            };
        }

        return { level: 'pass', message: '未使用需报备能力' };
    }
};
