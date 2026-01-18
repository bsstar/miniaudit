module.exports = {
    id: 'R9',
    async check({ appJson }) {
        const hasLoading = appJson?.window?.navigationBarLoading === true;
        if (!hasLoading) {
            return {
                level: 'warn',
                message: '未启用导航栏 loading 状态',
                suggestion: '建议在 app.json.window 中设置 "navigationBarLoading": true，避免白屏'
            };
        }
        return { level: 'pass', message: '已启用导航栏 loading' };
    }
};
