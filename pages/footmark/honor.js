// pages/footmark/honor.js
const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Page({

  /**
   * Page initial data
   */
  data: {
    honors: [],
    levels: [],
    progress: 0,
    rest: 0,
    userData: {},
    year: 2020,
    shareVisible: false,
    src: '',
    savedImgUrl: ''
  },
  getList() {
    api.footprint_userinfo(app).then(res => {

      this.setData({
        userData: res
      })
      api.footprint_levels(app).then(res1 => {
        this.setData({
          levels: res1.data
        })
        var honorList = []
        if (this.data.userData.level >= 2 && this.data.userData.level <= 4) {
          honorList.push(this.data.levels[this.data.userData.level - 2].comment)
          honorList.push(this.data.levels[this.data.userData.level - 1].comment)
          honorList.push(this.data.levels[this.data.userData.level].comment)
        } else if (this.data.userData.level === 1) {
          honorList.push('')
          honorList.push(this.data.levels[this.data.userData.level - 1].comment)
          honorList.push(this.data.levels[this.data.userData.level].comment)
        } else {
          honorList.push(this.data.levels[this.data.userData.level - 2].comment)
          honorList.push(this.data.levels[this.data.userData.level - 1].comment)
          honorList.push('')
        }
        this.setData({
          honors: honorList,
          progress: this.data.userData.level !== 5 ? ((this.data.userData.score - this.data.levels[this.data.userData.level - 1].min_score) / (this.data.levels[this.data.userData.level - 1].max_score - this.data.levels[this.data.userData.level - 1].min_score)) * 100 : 0,
          rest: this.data.userData.level !== 5 ? '距下一等级还差' + (this.data.levels[this.data.userData.level - 1].max_score - this.data.userData.score) + '里程' : '你已升至满级'
        })
      })
    })


  },

  share(e) {
    this.setData({
      shareVisible: true
    })
  },
  cancel(e) {
    this.setData({
      shareVisible: false
    })
  },
  doNothing() {},
  //这是一个封装好的方法  
  promisify: api => {
    return (options, ...params) => {
      return new Promise((resolve, reject) => {
        const extras = {
          success: resolve,
          fail: reject
        }
        api({
          ...options,
          ...extras
        }, ...params)
      })
    }
  },
  sharepyq() {
    const wxGetImageInfo = this.promisify(wx.getImageInfo)
    Promise.all([
      wxGetImageInfo({
        src: 'https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com/image/cert2.png'
      })
    ]).then(res => {
      
      const ctx = wx.createCanvasContext('shareCanvas')
      
      // 底图
      ctx.drawImage(res[0].path, 0, 0, 236, 360)
      // 名称
      ctx.setTextAlign('right') // 文字居中
      ctx.setFillStyle('#333333') // 文字颜色：黑色
      ctx.setFontSize(16) // 文字字号：22px
      ctx.fillText(wx.getStorageSync('nickName'), 200, 154)
      ctx.setTextAlign('center') // 文字居中
      ctx.setFillStyle('#333333') // 文字颜色：黑色
      ctx.setFontSize(14) // 文字字号：22px
      ctx.fillText(`在2020年度积极践行环保行`, 120, 184)
      ctx.setTextAlign('center') // 文字居中
      ctx.setFillStyle('#333333') // 文字颜色：黑色
      ctx.setFontSize(14) // 文字字号：22px
      ctx.fillText(`为，获得了「${this.data.userData.comment}。]`, 120, 210)
      // // 小程序码
      // const qrImgSize = 180
      // ctx.drawImage(res[1].path, (600 - qrImgSize) / 2, 530, qrImgSize, qrImgSize)
      ctx.stroke()
      ctx.draw()
      var that = this;
      
      setTimeout(function () {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 236,
          height: 360,
          destWidth: 1035,
          destHeight: 1560,
          canvasId: 'shareCanvas',
          success: function (res) {
            
            that.setData({
              savedImgUrl: res.tempFilePath
            })
          },
          fail: function (res) {
            
          }
        })
      }, 100)
      setTimeout(function () {
        if (that.data.savedImgUrl != "") {
          wx.saveImageToPhotosAlbum({
            filePath: that.data.savedImgUrl,
            success: function () {
              wx.showModal({
                title: '保存图片成功',
                content: '图片已经保存到相册，快去炫耀吧！',
                showCancel: false,
                success: function (res) {
                  that.setData({
                    canvasShow: false,
                  })
                },
                fail: function (res) {},
                complete: function (res) {},
              });
            },
            fail: function (res) {
              ;
              if (res.errMsg == "saveImageToPhotosAlbum:fail cancel") {
                wx.showModal({
                  title: '保存图片失败',
                  content: '您已取消保存图片到相册！',
                  showCancel: false
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: '保存图片失败，您可以点击确定设置获取相册权限后再尝试保存！',
                  complete: function (res) {
                    ;
                    if (res.confirm) {
                      wx.openSetting({}) //打开小程序设置页面，可以设置权限
                    } else {
                      wx.showModal({
                        title: '保存图片失败',
                        content: '您已取消保存图片到相册！',
                        showCancel: false
                      });
                    }
                  }
                });
              }
            }
          })
        }
      }, 150)
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.widget = this.selectComponent('.widget')
    utils.loginCB(this.getList, app)
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年份  
    var Y = date.getFullYear();
    this.setData({
      year: Y
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {},

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
      title: '我获得了公众环保足迹证书，快来查收你的~'
    }
  }
})