const fs = require('fs');

module.exports = {
    id: 'R2',
    async check({ jsFiles, appJson }) {
        const apiToScope = {
            'getLocation': 'scope.userLocation',
            'saveImageToPhotosAlbum': 'scope.writePhotosAlbum',
            'chooseAddress': 'scope.address',
            'record': 'scope.record'
        };

        const usedScopes = new Set();
        const declaredScopes = new Set(
            (appJson?.permission?.['scope'] || []).map(s => s.trim())
        );

        for (const file of jsFiles) {
            const code = fs.readFileSync(file, 'utf8');
            for (const [api, scope] of Object.entries(apiToScope)) {
                if (code.includes(`wx.${api}`)) {
                    usedScopes.add(scope);
                }
            }
        }

        const missing = [...usedScopes].filter(s => !declaredScopes.has(s));
        if (missing.length > 0) {
            return {
                level: 'warn',
                message: `使用了敏感 API 但未声明权限: ${missing.join(', ')}`,
                suggestion: '请在 app.json.permission 中添加对应 scope'
            };
        }

        return { level: 'pass', message: '权限声明完整' };
    }
};
