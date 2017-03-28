const app = getApp();
const _wx = app.getWx();

Page({
    data: {
        userInfo: {},
        groupId: null,
        groupData: null,
        chooseIndex: null,
        isEditing: false,
        editValue: '',
        // 彩蛋
        activeEggs: false,
        animationData: [],
    },
    onLoad: function (options) {
        let group_id = parseInt(options.group_id, 10);
        this.setData({
            groupId: group_id,
            
        });
        app.getUserInfo((userInfo) => {
            userInfo.uid = _wx.getUid();
            this.setData({
                userInfo: userInfo,
            });
        });
    },
    onShow: function () {
        // setTimeout(() => {
        // 	this._activeSecretEggs();
        // }, 2000);
        this._getGroupInfo();
    },
    /**
     * 分享部分
     * @returns
     */
    onShareAppMessage: function () {
        return {
            title: this.data.userInfo.nickName + '邀请你一起加入' + this.data.groupData.name,
            path: 'pages/groupList/groupList?group_id=' + this.data.groupId + '&group_name=' + this.data.groupData.name,
        }
    },


    /**
     * 获取此清单的详细信息
     *      成员
     *      基本信息 标题，创建者等
     *      需求项
     */
    _getGroupInfo: function () {
        _wx.req({
            url: '/shopping/getGroupInfo',
            data: {
                group_id: this.data.groupId,
            },
            success: (res) => {
                const result = res.data;
                if (result.status === 'success') {
                    this._render(result.data);
                }
            },
            fail: (err) => {
                _wx.showToast({
                    title: '群组清单信息获取失败' + err,
                    icon: 'success',
                    duration: 2000,
                });
            },
        });
    },
    /**
     * 渲染页面方法
     * 包括列表事项的分类排序
     * @param {any} groupData
     */
    _render: function (groupData) {
        groupData = groupData || this.data.groupData;
        const _todos = groupData.todos;
        const _list = {
            '0': [],
            '1': [],
            '2': [],
        };
        const result = [];
        _todos.forEach((item) => {
            _list[item.state].push(item);
        });
        Array.prototype.push.apply(result, _list['0']);
        Array.prototype.push.apply(result, _list['1']);
        Array.prototype.push.apply(result, _list['2']);
        groupData.todos = result;
        this.setData({
            groupData: groupData,
        });
    },
    // ==============================================
    /**
     * 点击清单项
     * @param {any} evt
     */
    bindTapNeedItem: function (evt) {
        if (this.isLongTap) {
            this.isLongTap = false;
            return;
        }
        const dataset = evt.currentTarget.dataset;
        const i = dataset.i;
        // 打开所选的需求项详情
        if (i === this.data.chooseIndex) {
            this.setData({
                chooseIndex: null,
            });
        } else {
            this.setData({
                chooseIndex: i,
            });
        }
        // 
        const type = evt.target.dataset.type;
        const _item = this.data.groupData.todos[i];
        if (type === 'mine') {
            _wx.req({
                url: '/shopping/changeTodoState',
                data: {
                    todo_id: dataset.value.id,
                    state: 2,
                },
                success: (res) => {
                    const result = res.data;
                    if (result.status === 'success') {
                        _item.finish_ts = new Date().getTime();
                        _item.finisher_avatar = this.data.userInfo.avatarUrl;
                        _item.finisher_id = this.data.userInfo.uid;
                        _item.finisher_name = this.data.userInfo.nickName;
                        _item.state = 2;
                        this.data.groupData.todos[i] = _item;
                        this._render();
                    } else {
                        _wx.showToast({
                            title: result.message,
                            icon: 'success',
                            duration: 2000,
                        });
                    }
                },
                fail: (err) => {
                    cnosole.log(err);
                },
            });
        } else if (type === 'todo'){
            _wx.showModal({
                title: '',
                content: '确定要认领此任务吗？一言既出驷马难追哦！',
                showCancel: true,
                success: (res) => {
                    if (res.confirm) {
                        _wx.req({
                            url: '/shopping/changeTodoState',
                            data: {
                                todo_id: dataset.value.id,
                                state: 1,
                            },
                            success: (res) => {
                                const result = res.data;
                                if (result.status === 'success') {
                                    _item.finish_ts = new Date().getTime();
                                    _item.finisher_avatar = this.data.userInfo.avatarUrl;
                                    _item.finisher_id = this.data.userInfo.uid;
                                    _item.finisher_name = this.data.userInfo.nickName;
                                    _item.state = 1;
                                    this.data.groupData.todos[i] = _item;
                                    this._render();
                                } else {
                                    _wx.showToast({
                                        title: result.message,
                                        icon: 'success',
                                        duration: 2000,
                                    });
                                }
                            },
                            fail: (err) => {
                                cnosole.log(err);
                            },
                        });
                    } else {
                        console.log('用户点击取消');
                    }
                },
            })
        }
    },
    /**
     * 长按一个需求项
     *      可以进行删除操作
     * @param {any} evt 
     */
    bindLongTapAction: function (evt) {
        this.isLongTap = true;
        console.log(evt.currentTarget.dataset.value);
        const todo = evt.currentTarget.dataset.value;
        const todo_id = parseInt(todo.id, 10);
        const presenter_id = parseInt(todo.presenter_id, 10);
        const group_id = this.data.groupId;
        const uid = parseInt(this.data.userInfo.uid, 10);
        if (uid === presenter_id) {
            _wx.showModal({
                title: '',
                content: '确定要删除‘' + todo.todo_cont + '’吗?',
                showCancel: true,
                success: (res) => {
                    if (res.confirm) {
                        _wx.req({
                            url: '/shopping/deleteTodo',
                            data: {
                                todo_id: todo_id,
                                group_id: group_id,
                            },
                            success: (res) => {
                                const result = res.data;
                                if (result.status === 'success') {
                                    this._getGroupInfo();
                                } else {
                                    _wx.showToast({
                                        title: result.message,
                                        icon: 'success',
                                        duration: 2000,
                                    });
                                }
                            },
                            fail: (err) => {
                                _wx.showToast({
                                    title: err,
                                    icon: 'success',
                                    duration: 2000,
                                });
                            },
                        });
                    }
                },
            });
            
        } else {
            console.log('只允许删除自己的需求。');
        }
    },

    /**
     * 点击输入框或加号进行添加需求
     * @param {any} evt 
     */
    bindTapEdit: function (evt) {
        this.setData({
            isEditing: true,
        });
    },

    /**
     * 
     * 
     * @param {any} evt 
     */
    bintInput: function (evt) {
        const value = evt.detail.value;
        this.setData({
            editValue: value,
        });
    },

    /**
     * 保存需求
     * 
     * @param {any} evt 
     * @returns 
     */
    bindTapSaveNeed: function (evt) {
        const value = this.data.editValue;
        if (!value) {
            // 还原编辑框
            this.setData({
                isEditing: false,
                editValue: '',
            });
            return;
        }
        if (this.doing) {
            return;
        }
        this.doing = true;
        _wx.req({
            url: '/shopping/addTodo',
            data: {
                cont: value,
                group: this.data.groupId,
            },
            success: (res) => {
                const result = res.data;
                if (result.status === 'success' && result.data.todo_id) {
                    const newTodo = {
                        id: result.data.todo_id,
                        present_ts: new Date().getTime(),
                        presenter_avatar: this.data.userInfo.avatarUrl,
                        presenter_id: this.data.userInfo.uid,
                        presenter_name: this.data.userInfo.nickName,
                        todo_cont: value,
                        state: 0,
                    };
                    this.data.groupData.todos.push(newTodo);
                    this._render();
                    this.setData({
                        isEditing: false,
                        editValue: '',
                    });
                }
            },
            fail: (err) => {
                console.log(err);
            },
            complete: () => {
                this.doing = false;
            }
        });
        /**
         * 彩蛋部分
         */
        if (value.indexOf('情人节') > -1 || value.indexOf('玫瑰花') > -1) {
            this._activeSecretEggs();
        }
    },
    /**
     * 返回我的清单
     * @param {any} evt 
     */
    bindTapGotoList: function (evt) {
        _wx.navigateBack();
    },
    /**
     * 修改清单标题
     * @param {any} evt 
     * @returns 
     */
    bindConfirmTitle: function (evt) {
        const value = evt.detail.value;
        if (!value) {
            return;
        }
        _wx.req({
            url: '/shopping/modifyGroupName',
            data: {
                group_id: this.data.groupId,
                group_name: value,
            },
            success: (res) => {
                const result = res.data;
                if (result.status === 'success') {
                    console.log('标题修改成功');
                }
            },
        });
    },
    /**
     * ==============开始彩蛋===============================
     */
    _activeSecretEggs: function () {
        this.setData({
            activeEggs: true,
        });
        if (!this.animation) {
            const _animData =[];
            let i = 6;
            while (i > 0) {
                const animation = _wx.createAnimation({
                    transformOrigin: "50% 50%",
                    duration: 3000,
                    timingFunction: "ease-in",
                    delay: 0 + i * 100,
                });
                _animData.push(animation);
                --i;
            }
            this.animation = _animData;
        }
        const _animationData = this.data.animationData;
        const self = this;
        setTimeout(function () {
            self.animation.map((item, index) => {
                item.translate(0, 800).step();
                _animationData[index] = item.export();
                return item;
            });
            self.setData({
                animationData: _animationData,
            });
        }, 100);
        setTimeout(function () {
            self.setData({
                activeEggs: false,
            });
        }, 3900);
        setTimeout(function () {
            // const _animationData = this.data.animationData;
            self.animation.map((item, index) => {
                item.translate(0, -600).step();
                _animationData[index] = item.export();
                return item;
            });
            self.setData({
                animationData: _animationData,
            });
        }, 4000);
    },
});