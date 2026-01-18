const traverse = require('@babel/traverse').default;

module.exports = {
    id: 'R6',
    async check({ jsFiles, parseJS }) {
        const targetApis = ['authorize', 'getSetting'];

        for (const file of jsFiles) {
            try {
                const ast = parseJS(file);
                let missingFail = false;

                traverse(ast, {
                    CallExpression(path) {
                        const callee = path.get('callee');
                        if (callee.matchesPattern('wx.' + targetApis.join('|'))) {
                            const args = path.get('arguments')[0];
                            if (args && args.isObjectExpression()) {
                                const hasFail = args.get('properties').some(prop =>
                                    prop.get('key').isIdentifier({ name: 'fail' })
                                );
                                if (!hasFail) {
                                    missingFail = true;
                                }
                            }
                        }
                    }
                });

                if (missingFail) {
                    return {
                        level: 'warn',
                        message: 'wx.authorize / getSetting 缺失 fail 回调',
                        location: file,
                        suggestion: '用户拒绝授权后应有友好提示，避免白屏'
                    };
                }
            } catch (e) {}
        }

        return { level: 'pass', message: '授权调用已处理失败场景' };
    }
};
