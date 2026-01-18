// lib/rules/rule12-immediate-auth-on-launch.js
const traverse = require('@babel/traverse').default;

module.exports = {
    id: 'R12',
    async check({ jsFiles, parseJS }) {
        const sensitiveApis = new Set(['login', 'getUserProfile', 'getPhoneNumber']);
        const entryMethods = new Set(['onLaunch', 'onLoad', 'onShow']);

        for (const file of jsFiles) {
            try {
                const ast = parseJS(file);
                let found = null;

                // 遍历所有 CallExpression，找 App 或 Page
                traverse(ast, {
                    CallExpression(path) {
                        if (found) return; // 已找到，提前退出

                        const callee = path.get('callee');
                        let targetName = null;

                        if (callee.isIdentifier({ name: 'App' })) {
                            targetName = 'App';
                        } else if (callee.isIdentifier({ name: 'Page' })) {
                            targetName = 'Page';
                        }

                        if (targetName) {

                            if (path.node.arguments.length === 0) {
                                return;
                            }

                            const configArg = path.get('arguments')[0];
                            if (!configArg.isObjectExpression()) {
                                return;
                            }

                            const props = configArg.get('properties');

                            if (!Array.isArray(props)) {
                                return;
                            }

                            for (const propPath of props) {
                                let methodName = '';
                                let valuePath = null;

                                // ✅ 支持 ObjectMethod (onLaunch() {})
                                if (propPath.isObjectMethod()) {
                                    const keyNode = propPath.node.key;
                                    if (keyNode.type === 'Identifier') {
                                        methodName = keyNode.name;
                                    } else {
                                        continue;
                                    }
                                    valuePath = propPath.get('body'); // ObjectMethod 的函数体

                                    // ✅ 支持 ObjectProperty (onLaunch: function() {})
                                } else if (propPath.isObjectProperty()) {
                                    const keyNode = propPath.node.key;
                                    if (keyNode.type === 'Identifier') {
                                        methodName = keyNode.name;
                                    } else if (keyNode.type === 'StringLiteral') {
                                        methodName = keyNode.value;
                                    } else {
                                        continue;
                                    }
                                    valuePath = propPath.get('value');

                                } else {
                                    continue;
                                }

                                // 检查是否是入口方法
                                if (!entryMethods.has(methodName)) {
                                    continue;
                                }

                                // 确保 value 是函数体（ObjectMethod 的 body 是 BlockStatement）
                                if (!valuePath || !valuePath.isBlockStatement && !valuePath.isFunction()) {
                                    continue;
                                }


                                // 在函数体内查找 wx. 敏感调用
                                valuePath.traverse({
                                    CallExpression(innerPath) {
                                        if (found) return;

                                        const innerCallee = innerPath.get('callee');
                                        if (
                                            innerCallee.isMemberExpression() &&
                                            innerCallee.get('object').isIdentifier({ name: 'wx' }) &&
                                            innerCallee.get('property').isIdentifier()
                                        ) {
                                            const apiName = innerCallee.node.property.name;

                                            if (sensitiveApis.has(apiName)) {
                                                found = {
                                                    file,
                                                    line: innerPath.node.loc?.start.line || '?',
                                                    api: apiName,
                                                    method: methodName
                                                };
                                                innerPath.stop();
                                            } else {
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                });

                if (found) {

                    return {
                        level: 'error',
                        message: `在 ${found.method} 中立即调用 wx.${found.api}（未先提供功能体验）`,
                        location: `${found.file}:${found.line}`,
                        suggestion: '请先让用户浏览/使用核心功能，再在用户主动操作时请求授权'
                    };
                } else {
                }
            } catch (e) {
            }
        }

        return { level: 'pass', message: '未发现启动时立即授权' };
    }
};
