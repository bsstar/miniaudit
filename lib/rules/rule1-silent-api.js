const traverse = require('@babel/traverse').default;

module.exports = {
    id: 'R1',
    async check({ jsFiles, parseJS }) {
        const sensitiveApis = ['getUserProfile', 'getPhoneNumber', 'chooseAddress'];
        const lifecycleMethods = ['onLaunch', 'onLoad', 'onShow'];

        for (const file of jsFiles) {
            try {
                const ast = parseJS(file);
                let found = null;

                traverse(ast, {
                    ObjectMethod(path) {
                        if (lifecycleMethods.includes(path.node.key.name)) {
                            path.traverse({
                                CallExpression(innerPath) {
                                    const callee = innerPath.get('callee');
                                    if (callee.isMemberExpression() &&
                                        callee.get('object').matchesPattern('wx') &&
                                        sensitiveApis.includes(callee.get('property').node.name)) {
                                        found = {
                                            file,
                                            line: innerPath.node.loc?.start.line || '?'
                                        };
                                    }
                                }
                            });
                        }
                    }
                });

                if (found) {
                    return {
                        level: 'error',
                        message: '在生命周期中静默调用敏感 API',
                        location: `${found.file}:${found.line}`,
                        suggestion: '请将调用移至用户点击事件处理函数中'
                    };
                }
            } catch (e) {
                // 解析失败跳过
            }
        }

        return { level: 'pass', message: '未发现静默调用' };
    }
};
