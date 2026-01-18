Page({
    onLoad() {
        // R6: authorize 无 fail
        wx.authorize({
            scope: 'scope.userLocation',
            success: () => console.log('ok')
        });
    }
});
