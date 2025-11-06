// pages/footmark/rank.js
const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Page({

  /**
   * Page initial data
   */
  data: {
    rankList: [],
    levels: [],
    rank1to3: [],
    rank1: {},
    rank2: {},
    rank3: {},
    honors: [],
    honor1: '',
    honor2: '',
    honor3: '',
    encryptedData: '',
    iv: ''
  },
  shareGroup() {

  },
  getList() {
    this.updateUser()
    api.footprint_rank(app).then(res => {
      // 
      this.setData({
        rankList: res
      })
      // 
      api.footprint_levels(app).then(res1 => {
        // 
        this.setData({
          levels: res1.data
        })
        this.setList()
      })
    })
  },
  setList() {
    let rankList = this.data.rankList
    let levels = this.data.levels
    
    rankList.forEach((item) => {
      levels.forEach((val) => {
        if (item.level === val.level) {
          item.comment = val.comment
        }
      })
    })
    this.setData({
      rankList: rankList
    })
  },
  getGroupList() {
    const that = this
    this.updateUser()
    wx.login({
      success: codeInfo => {
        if (codeInfo.code) {
          const params={}
          params.code = codeInfo.code
          // const params = { ...codeInfo, ...{ fakeId: "test1589787838300" } }
          // if (app.options.query) {
          //   params.query = app.options.query;
          // }
          // params.scene = app.options.scene;
          api.getKey(params, app)
          .then(resp => {
            wx.setStorageSync('session_key', resp) 
            wx.getUserInfo({
              success:(res2) =>{
                wx.setStorageSync('avatarUrl', res2.userInfo.avatarUrl)
                wx.setStorageSync('nickName', res2.userInfo.nickName)
              }
            })
            wx.getShareInfo({
              shareTicket: wx.getStorageSync('shareTicket'),
              complete(res) {
                 // 输出加密后的当前群聊的 openGId
                that.setData({
                  iv: res.iv,
                  encryptedData: res.encryptedData
                })
                const get_gid = {
                  session_key: wx.getStorageSync('session_key'),
                  iv: that.data.iv,
                  encryptedData: that.data.encryptedData
                }
                
                api.get_gid(get_gid,app).then(res => {
                  
                  const rank = {
                    openGid: res.openGId
                  }


                  const userInfo = {
                    avatarUrl: wx.getStorageSync('avatarUrl'),
                    nickName: wx.getStorageSync('nickName')
                  }
                  api.update_user(userInfo, app).then(res => {
                    
                  })
                  api.group_add(rank, app).then(res => {
                
                    
                  })
                  api.group_rank(rank, app).then(res => {
                    
                    that.setData({
                      rankList: res
                    })
                    // 
                    api.footprint_levels(app).then(res1 => {
                      
                      that.setData({
                        levels: res1.data
                      })
                      if (that.data.rankList.length > 3) {
                        for (var i = 0; i < 3; i++) {
                          that.data.rank1to3.push(that.data.rankList[i])
                          if (that.data.rankList[i].level !== null) {
                            if (that.data.rankList[i].level === 0) {
                              that.data.honors.push('')
                            } else {
                              that.data.honors.push(that.data.levels[that.data.rankList[i].level - 1].comment)
                            }
                          } else {
                            that.data.honors.push('')
                          }
                        }
              
                        that.setData({
                          rank1: that.data.rank1to3[0],
                          rank2: that.data.rank1to3[1],
                          rank3: that.data.rank1to3[2],
                          honor1: that.data.honors[0],
                          honor2: that.data.honors[1],
                          honor3: that.data.honors[2]
                        })
                      } else {
                        if (that.data.rankList.length === 1) {
                          that.setData({
                            rank1: that.data.rankList[0],
                            honor1: that.data.levels[that.data.rankList[0].level - 1].comment,
                          })
                        } else if (that.data.rankList.length === 2) {
                          that.setData({
                            rank1: that.data.rankList[0],
                            rank2: that.data.rankList[1],
                            honor1: that.data.levels[that.data.rankList[0].level - 1].comment,
                            honor2: that.data.levels[that.data.rankList[1].level - 1].comment,
                          })
                        } else {
                          that.setData({
                            rank1: that.data.rankList[0],
                            rank2: that.data.rankList[1],
                            rank3: that.data.rankList[2],
                            honor1: that.data.levels[that.data.rankList[0].level - 1].comment,
                            honor2: that.data.levels[that.data.rankList[1].level - 1].comment,
                            honor3: that.data.levels[that.data.rankList[2].level - 1].comment
                          })
                        }      
                      }
                    })
                  })
                })
              }
            })
          })
          .catch(resp => console.error(resp));
        }
      },
      fail: () => {
        wx.showToast({
          title: "登录失败",
          image: "/images/raccoon.png"
        });
      }
    })
  },
  updateUser() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            fail: res => {
              
            },
            success: res => {
              
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              const data = {
                nickName: app.globalData.userInfo.nickName,
                avatarUrl: app.globalData.userInfo.avatarUrl,
              }
              api.update_user(data, app)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/auth/auth',
          })
        }
      }
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true,
    })
    if(wx.getStorageSync('shareTicket')){
      utils.loginCB(this.getGroupList, app)
    }else{
      utils.loginCB(this.getList, app)
    }

   
    
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {


  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {
    return {
      title: '点这里查看你的环保里程排名~'
    }
  }
})