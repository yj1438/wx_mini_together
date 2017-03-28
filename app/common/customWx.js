const mergeObj = require('../utils/mergeObj');
const Promise = require('../utils/promise');

/**
 * 对 wx 的本地化带参封装
 * @date 2017-1-11
 */
function CustomWx(self) {
    this.app = self;
    this.uid = '';
    this.loginString = '';
    this.isGetLoginString = false;
    try {
        const localDomain = wx.getStorageSync('setupDev.domain') || 'babytree',
            localEnv = wx.getStorageSync('setupDev.env') || 'www';
        // this.domain = 'https://' + localEnv + '.' + localDomain + '.com';
        this.domain = 'https://m.babytree.com/mini-program-together';
        if (localDomain === 'babytree-test' && localEnv) {
            console.log('+++++++++ 使用线下环境 ' + this.domain + '++++++++++');
        } else {
            console.log('+++++++++ 使用线上环境 ' + this.domain + '++++++++++');
        }
    } catch (err) {
        this.domain = 'https://m.babytree.com/mini-program-together';
    }
};

CustomWx.prototype = wx;

/**
 * 简单封装的 request
 * 1: 加上用户信息的 loginString
 * 2: header 加上默认的 'content-type': 'application/x-www-form-urlencoded'
 * @param {object} options 和 wx.request 的参数一致
 */
CustomWx.prototype.req = function (options, noLogin) {
    const defaults = {
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {'content-type': 'application/x-www-form-urlencoded',},
    };
    options = options ? mergeObj(defaults, options) : {};
    if (!options.url) {
        return null;
    }
    // 按 domain 拼接 url
    if (options.url.indexOf('http') !== 0) {
        options.url = this.domain + options.url;
    }
    const requestData = options.data || {};
    if (noLogin) {
        options.data = requestData;                                                             
        return wx.request(options);
    } else {
        this.getLoginString().then((loginString) => {
            // 请求数据中加入 loginString
            requestData.login_string = loginString;                // 加入用户的 loginString
            options.data = requestData;                                                             
            return wx.request(options);
        }).catch((err) => {
            wx.showModal({
                title: '错误',
                content: '登录失败',
                showCancel: false,
                success: function(res) {
                    console.log(err.toString());
                    if (res.confirm) {
                        console.log('用户点击确定')
                    }
                },
            })
        });
    }                                             
}

/**
 * 用户登录，获取用户的 loginString
 * 如果本地有，从本地获取
 * 如果没有 走 login -> getUserInfo -> login URL 的过程
 */
CustomWx.prototype.getLoginString = function () {
    let interval;
    return new Promise((resolve, reject) => {
        if (this.isGetLoginString) {
            interval = setInterval(() => {
                if (this.loginString) {
                    resolve(this.loginString);
                    clearInterval(interval);
                }
            }, 60);
        } else {
            this.isGetLoginString = true;
            wx.showToast({
                title: '用户登录中',
                icon: 'loading',
                duration: 10000,
            });
            this.app.getUserInfo((info) => {
                /**
                 * 从自己的服务上拉取用户信息
                 * @param {string} code login 获取到的 code 
                 * @param {string} encryptedData getUserInfo 获取到的 encryptedData 
                 * @param {string} iv getUserInfo 获取到的 iv 
                 */
                this.app.getWx().req({
                    url: '/shopping/autoLogin',
                    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    data: {
                        code: info.code,
                        encryptedData: info.encryptedData,
                        iv: info.iv,
                    },
                    success: (res) => {
                        const result = res.data;
                        if (result.status && result.status === 'success') {
                            // 获取到 loginString
                            const loginString = result.data.login_string || result.data.uid;
                            this.setLoginString(loginString);
                            this.setUid(result.data.uid);
                            resolve(loginString);
                            console.log('当前登录用户的 login_string : ' + loginString);
                            // bbt的用户信息
                            this.app.globalData.bbtUserInfo = result.data.user_info;
                        } else {
                            reject('登录失败~' + (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)));
                            clearInterval(interval);
                            this.isGetLoginString = false;
                        }
                    },
                    fail: (err) => {
                        reject(err);
                        clearInterval(interval);
                        this.isGetLoginString = false;
                    },
                    complete: function () {
                        wx.hideToast();
                    },
                }, true);
            });
        }
    });
}
CustomWx.prototype.setLoginString = function (loginString) {
    this.loginString = loginString;
}
CustomWx.prototype.setUid = function (uid) {
    this.uid = uid;
}
CustomWx.prototype.getUid = function () {
    return this.uid;
}
CustomWx.prototype.setDomain = function (domain) {
    this.domain = domain;
}
CustomWx.prototype.getDomain = function () {
    return this.domain;
}

module.exports = CustomWx;