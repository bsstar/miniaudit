// lib/utils/parseJS.js （推荐单独文件）
const parser = require('@babel/parser');
const fs = require('fs');

function parseJS(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    return parser.parse(code, {
        sourceType: 'script',        // 👈 必须是 'script'
        allowReturnOutsideFunction: true,
        plugins: []                  // 小程序 JS 不需要 JSX
    });
}

module.exports = parseJS;
