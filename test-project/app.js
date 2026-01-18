App({
    onLaunch() {
        // R1: 静默调用
        wx.getUserProfile({ desc: '用于完善资料' });

        // R5: 废弃 API
        wx.getUserInfo();

        // R10: login 无 fail
        wx.login({
            success: (res) => console.log(res.code)
        });

        console.log('debug log'); // R3
    }
});
