const traverse = require('@babel/traverse').default;

module.exports = {
    id: 'R10',
    async check({ jsFiles, parseJS }) {
        for (const file of jsFiles) {
            try {
                const ast = parseJS(file);
                let hasLoginWithoutFail = false;

                traverse(ast, {
                    CallExpression(path) {
                        const callee = path.get('callee');
                        if (callee.matchesPattern('wx.login')) {
                            const args = path.get('arguments')[0];
                            if (args && args.isObjectExpression()) {
                                const hasFail = args.get('properties').some(prop =>
                                    prop.get('key').isIdentifier({ name: 'fail' })
                                );
                                if (!hasFail) {
                                    hasLoginWithoutFail = true;
                                }
                            }
                        }
                    }
                });

                if (hasLoginWithoutFail) {
                    return {
                        level: 'warn',
                        message: 'wx.login 调用缺失 fail 回调',
                        location: file,
                        suggestion: '登录失败时应提示用户重试，避免功能瘫痪'
                    };
                }
            } catch (e) {}
        }

        return { level: 'pass', message: '登录调用已处理失败场景' };
    }
};
