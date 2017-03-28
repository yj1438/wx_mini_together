const ToolUitls = require('../../utils/toolUtils');

const app = getApp();
const _wx = app.getWx();

Page({
    data: {
        groupList: [],          // 群组列表
        inviteGroupId: '',      // 邀请加入的群组ID
    },
    onLoad: function (option) {
        const group_id = option.group_id;
        if (group_id) {
            this.data.inviteGroupId = group_id;
            _wx.showToast({
                title: '进入群组中...',
                icon: 'loading',
                duration: 10000,
            });
            _wx.req({
                url: '/shopping/joinGroup',
                data: {
                    group_id: group_id, 
                },
                success: (res) => {
                    const result = res.data;
                    if (result.status === 'success') {
                        _wx.navigateTo({
                            url: '../index/index?group_id=' + group_id,
                        });
                    }
                },
                fail: (err) => {

                },
                complete: () => {
                    _wx.hideToast();
                },
            });
        }
        console.log('页面LOAD'); 
    },
    onShow: function () {
        this._getGroupList();
        console.log('页面SHOW');
    },
    onHide: function () {
        
    },
    /**
	 * 分享部分
	 * @returns
	 */
    onShareAppMessage: function () {
        return {
            title: '邀请你来一起干干干！',
            path: 'pages/groupList/groupList',
        };
    },
    /**
     * 列表数据的一些格式化
     *      将时间戳转成日期
     * @param {any} listdata 
     * @returns 
     */
    _formatData: function (listdata) {
        return listdata.map((item) => {
            item.create_date = ToolUitls.dateFormat(new Date(item.create_ts), '%Y-%m-%d %H:%M:%S');
            return item;
        });
    },
    /**
     * 获取用户的群组信息
     * @param {any} callback 
     */
    _getGroupList: function (callback) {
        _wx.req({
            url: '/shopping/getGroupList',
            success: (res) => {
                const result = res.data;
                if (result.status === 'success') {
                    this.setData({
                        groupList: this._formatData(result.data),
                    });
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            },
            fail: (err) => {
                _wx.showToast({
                    title: err,
                    icon: 'success',
                    duration: 2000
                })
            },
        });     
    },
    /**
     * 创建按钮点击
     * @param {any} evt
     */
    bindTapCreateGroup: function () {
        if (this.doing) {
            return;
        }
        this.doing = true;
        _wx.req({
            url: '/shopping/createGroup',
            success: (res) => {
                const result = res.data;
                if (result.status === 'success') {
                    _wx.navigateTo({
                        url: '../index/index?group_id=' + result.data.group_id,
                    });
                } else {
                    _wx.showToast({
                        title: result.message,
                        icon: 'success',
                        duration: 2000,
                    });
                }
            },
            fail: (err) => {
                console.log(err);
            },
            complete: () => {
                this.doing = false;
            },
        });
    },
    /**
     * 进入一个群组
     * @param {any} evt
     */
    bindTapGotoGroup: function (evt) {
        if (this.isLongTap) {
            this.isLongTap = false;
            return;
        }
        const group = evt.currentTarget.dataset.item;
        _wx.navigateTo({
            url: '../index/index?group_id=' + group.id,
        });
    }, 

    /**
     * 长按操作
     *      删除一个清单
     * @param {any} evt 
     */
    bindLongTapAction: function (evt) {
        this.isLongTap = true;
        const group = evt.currentTarget.dataset.item;
        console.log(group);
        const group_id = group.id;
        
        if (parseInt(group.creator_id, 10) === _wx.getUid()) {
            _wx.showModal({
                title: '',
                content: '确定要删除' + group.name + '吗?',
                showCancel: true,
                success: (res) => {
                    if (res.confirm) {
                        _wx.req({
                            url: '/shopping/deleteGroup',
                            data: {
                                group_id: group_id, 
                            },
                            success: (res) => {
                                if (res.data.status === 'success') {
                                    this._getGroupList();
                                }
                            },
                            fail: () => {

                            },
                        });
                    }
                },
            });
        } else {
            _wx.showToast({
                title: '只能删除自己创建的清单哦~',
                icon: 'success',
                duration: 2000,
            });
        }
    },
    
});