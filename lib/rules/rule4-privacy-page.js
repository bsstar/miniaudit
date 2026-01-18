const fs = require('fs');
const path = require('path');

module.exports = {
    id: 'R4',
    async check({ projectPath }) {
        const candidates = [
            'pages/privacy/index.wxml',
            'pages/agreement/index.wxml',
            'pages/protocol/index.wxml',
            'privacy/index.wxml'
        ];

        for (const relPath of candidates) {
            const fullPath = path.join(projectPath, relPath);
            if (fs.existsSync(fullPath)) {
                return {
                    level: 'pass',
                    message: `检测到隐私协议页面: ${relPath}`
                };
            }
        }

        return {
            level: 'error',
            message: '未检测到隐私协议页面',
            suggestion: '请创建 pages/privacy/index 并在微信公众平台配置'
        };
    }
};
