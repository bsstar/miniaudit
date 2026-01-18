const fs = require('fs');

module.exports = {
    id: 'R3',
    async check({ jsFiles, fix }) {
        let totalRemoved = 0;

        for (const file of jsFiles) {
            let content = fs.readFileSync(file, 'utf8');
            const original = content;

            // 注释掉 console.log / debugger
            content = content.replace(/console\.(log|warn|error|info)\s*\([^)]*\);?/g, '// $&');
            content = content.replace(/debugger\s*;?/g, '// debugger');

            if (content !== original) {
                if (fix) {
                    fs.writeFileSync(file, content);
                    const count = (original.match(/console\./g) || []).length;
                    totalRemoved += count;
                } else {
                    return {
                        level: 'warn',
                        message: '发现调试日志（console.log / debugger）',
                        suggestion: '提审前建议清理，可使用 --fix 自动注释'
                    };
                }
            }
        }

        if (fix && totalRemoved > 0) {
            return {
                level: 'pass',
                message: `已自动注释 ${totalRemoved} 处调试日志`
            };
        }

        return { level: 'pass', message: '无调试日志' };
    }
};
