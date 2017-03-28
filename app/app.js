//app.js
const aldstat = require("./utils/ald-stat.js");
const CustomWx = require('./common/customWx');

App({
    globalData: {
        userInfo: null,
        wx: null,
    },
    onLaunch: function () {

    },
    /**
     * 对原有的 wx 进行简单封装
     *  前置条件是必须已经有获得 loginString
     */
    getWx: function () {
        if (!this.globalData.wx) {
            this.globalData.wx = new CustomWx(this);
        }
        return this.globalData.wx;
    },
    getUserInfo: function (cb) {
        if (this.globalData.userInfo) {
            typeof cb === "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            //调用登录接口
            wx.showNavigationBarLoading();
            wx.login({
                success: (res) => {
                    const code = res.code;
                    wx.getUserInfo({
                        success: (info) => {
                            // 获了加密信息和解密向量
                            const userInfo = info.userInfo;
                            userInfo.code = code;
                            userInfo.encryptedData = info.encryptedData;
                            userInfo.iv = info.iv;
                            // 回调用户信息
                            this.globalData.userInfo = userInfo;
                            typeof cb === "function" && cb(this.globalData.userInfo)
                            wx.hideNavigationBarLoading();
                        },
                    })
                },
            })
        }
    },
})