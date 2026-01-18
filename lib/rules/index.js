// 自动加载所有规则


module.exports = [
    require('./rule1-silent-api'),
    require('./rule2-missing-permission'),
    require('./rule3-console-log'),
    require('./rule4-privacy-page'),
    require('./rule5-deprecated-api'),
    require('./rule6-missing-fail'),
    require('./rule7-category-mismatch'),
    require('./rule8-reportable-api'),
    require('./rule9-loading-state'),
    require('./rule10-login-failure'),
    // 新增 ↓
    require('./rule11-default-privacy-consent'),
    require('./rule12-immediate-auth-on-launch'),
    require('./rule13-missing-specific-user-notice')
];
