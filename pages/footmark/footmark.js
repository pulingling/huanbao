// pages/footmark/footmark.js
const app = getApp();
const api = require("../../utils/request.js");
const util = require("../../utils/util");
const utils = require("../../utils/util");
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');
var cxt_arc = wx.createCanvasContext('canvasCircle');
Page({

  /**
   * Page initial data
   */
  data: {
    screenWidth: app.globalData.screenWidth,
    screenHeight: app.globalData.screenHeight,
    addMarkDialogVisible: false,
    coverVisible: false,
    percent: 0,
    page: 0,
    total: 0,
    pageSize: 10,
    bubbleList: [],
    historyList: [],
    userData: {},
    addScore: 0,
    // anime: 0,
    levels: [],
    percent1: 0,
    addCoverVisible: false,
    scroll: true,
    scrollTop: 0,
    coverTitle: '',
    coverScore: 0,
    coverVisibleShare: false,
    platform: '',
    honorCoverVisible: false,
    shareInfo: {},
    savedImgUrl: '',
    len: 0,
    title_type: '',
    enough: false
  },
  close3(e) {
    this.setData({
      coverVisible: false,
      scroll: true
    })
  },
  close(e) {
    this.setData({
      addCoverVisible: false
    })
  },
  move(e) {

  },
  up(e) {

    e.detail.img = e.detail.img.replace(/http:/i, 'https:')
    this.setData({
      scroll: !e.detail.show,
      scrollTop: 0,
      coverVisibleShare: e.detail.show,
      shareInfo: e.detail
    })
  },
  closeshare() {
    this.setData({
      coverVisibleShare: false,
      scroll: true
    })
  },
  close(e) {
    this.setData({
      coverVisible: false
    })
  },
  close1(e) {
    this.setData({
      honorCoverVisible: false
    })
  },
  turn(e) {
    this.setData({
      percent: this.data.percent + 10
    })
  },
  back(e) {
    wx.navigateBack({
      delta: 1,
    })
  },
  // anime_run() {
  //   this.setData({
  //     anime: (this.data.anime + 1) % 7
  //   })
  //   // 
  // },
  addMark(e) {
    
    var data = {
      id: e.currentTarget.dataset.idx
    }
    api.footprint_pick(data, app).then(res => {
      this.data.page = 0
      this.getList()
      // 点击泡泡后重新加载三表
    })
    this.setData({
      addScore: e.currentTarget.dataset.score,
      addMarkDialogVisible: true,
      percent: 0
    })
    for (var i = 0; i < 20; i++) {
      this.sleep(30)
      this.turn()
    }
    // utils.loginCB(this.getList, app)
  },
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  },

  hideAddMark(e) {
    this.setData({
      addMarkDialogVisible: false,
      percent: 0
    })
  },
  navToRank(e) {
    wx.navigateTo({
      url: '/pages/footmark/rank',
    })
  },
  navToStrategy(e) {
    wx.navigateTo({
      url: '/pages/footmark/strategy',
    })
  },
  home(e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  navToActList(e) {
    wx.navigateTo({
      url: '/pages/activity_list/activity_list',
    })
  },
  navToHonor(e) {
    wx.navigateTo({
      url: '/pages/footmark/honor',
    })
  },
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
  sharepyq(e) {
    const wxGetImageInfo = this.promisify(wx.getImageInfo)
    if (this.data.shareInfo.qr) {
      utils.base64src(this.data.shareInfo.qr).then(file => {
        Promise.all([
          wxGetImageInfo({
            src: this.data.shareInfo.img
          }),
          wxGetImageInfo({
            src: file
          }),
          wxGetImageInfo({
            src: 'https://sthjxjzx.oss-cn-chengdu.aliyuncs.com/image/back.bmp'
          }),
          wxGetImageInfo({
            src: 'https://sthjxjzx.oss-cn-chengdu.aliyuncs.com/image/28A0A944037E222A71201D8617D2B864.png'
          })
        ]).then(res => {
          const ctx = wx.createCanvasContext(`shareCanvas2`)
          // 名称
          ctx.drawImage(res[2].path, 0, 0, 320, 417)
          // 图片
          ctx.drawImage(res[0].path, 0, 0, 320, 178)
          ctx.setTextAlign('center') // 文字居中
          ctx.setFillStyle('#333333') // 文字颜色
          ctx.setFontSize(20) // 文字字号
          let text = this.data.shareInfo.shareText
          if (text.length > 10) {
            text = text.slice(0, 10) + '...'
          }
          ctx.fillText(text, 170, 210)
          // 名称
          ctx.setTextAlign('center') // 文字居中
          ctx.setFillStyle('#333333') // 文字颜色
          ctx.setFontSize(20) // 文字字号
          ctx.fillText(`获得了${this.data.shareInfo.score}环保足迹`, 170, 240)
          // // 小程序码
          const qrImgSize = 106
          const mascot = 78
          ctx.drawImage(res[1].path, (320 - qrImgSize + mascot) / 2, 277, qrImgSize, qrImgSize)
          // 吉祥物
          ctx.drawImage(res[3].path, (320 - (qrImgSize + mascot)) / 2, 277, mascot, 115)
          ctx.stroke()
          ctx.draw()
          var that = this;
          setTimeout(function () {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: 320,
              height: 417,
              destWidth: 1035,
              destHeight: 1560,
              canvasId: `shareCanvas2`,
              success: function (res) {

                that.setData({
                  savedImgUrl: res.tempFilePath
                })
              },
              fail: function (res) {

              }
            })
          }, 500)
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
          }, 1000)
        })
      })
    } else {
      Promise.all([
        wxGetImageInfo({
          src: this.data.shareInfo.img
        }),
        wxGetImageInfo({
          src: 'https://sthjxjzx.oss-cn-chengdu.aliyuncs.com/image/back.bmp'
        }),
        wxGetImageInfo({
          src: 'https://sthjxjzx.oss-cn-chengdu.aliyuncs.com/image/gh_b93249df3999_258.jpg'
        }),
        wxGetImageInfo({
          src: 'https://sthjxjzx.oss-cn-chengdu.aliyuncs.com/image/28A0A944037E222A71201D8617D2B864.png'
        })
      ]).then(res => {
        const ctx = wx.createCanvasContext(`shareCanvas2`)
        // 名称
        ctx.drawImage(res[1].path, 0, 0, 320, 417)
        // 图片
        ctx.drawImage(res[0].path, 0, 0, 320, 178)
        ctx.setTextAlign('center') // 文字居中
        ctx.setFillStyle('#333333') // 文字颜色
        ctx.setFontSize(20) // 文字字号
        let text = this.data.shareInfo.shareText
        if (text.length > 10) {
          text = text.slice(0, 10) + '...'
        }
        ctx.fillText(text, 170, 210)
        // 名称
        ctx.setTextAlign('center') // 文字居中
        ctx.setFillStyle('#333333') // 文字颜色
        ctx.setFontSize(20) // 文字字号
        ctx.fillText(`获得了${this.data.shareInfo.score}环保足迹`, 170, 240)
        // // 小程序码
        const qrImgSize = 106
        const mascot = 200
        ctx.drawImage(res[2].path, (320 - qrImgSize + mascot) / 2, 277, qrImgSize, qrImgSize)
        // 吉祥物
        ctx.drawImage(res[3].path, (320 - (qrImgSize + mascot)) / 2, 277, mascot, 95)
        ctx.stroke()
        ctx.draw()
        var that = this;
        setTimeout(function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 320,
            height: 417,
            destWidth: 1035,
            destHeight: 1560,
            canvasId: `shareCanvas2`,
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
    }
  },
  // 获取泡泡表，历史表和用户信息
  getList() {
    api.footprint_pickable(app).then(res => {
      this.setData({
        bubbleList: res.slice(0, 4)
      })
    })
    api.footprint_history({
      page: this.data.page,
      pageSize: this.data.pageSize
    }, app).then(res => {
      // 
      this.setData({
        historyList: res.data,
        len: res.length,
        total: res.total
      })
    })
    api.footprint_userinfo(app).then(res => {
      // 
      this.setData({
        userData: res
      })
      api.footprint_levels(app).then(res1 => {
        this.setData({
          levels: res1.data.reverse(),
        })
        // 

        if (this.data.userData.level >= 1 && this.data.userData.level <= 5) {
          this.setData({
            percent1: this.data.userData.level !== 5 ? ((this.data.userData.score - this.data.levels[this.data.userData.level - 1].min_score) / (this.data.levels[this.data.userData.level - 1].max_score - this.data.levels[this.data.userData.level - 1].min_score)) * 100 : 100
          })

          this.setData({
            percent1: this.data.percent1.toFixed(0)
          })
        } else {
          this.setData({
            percent1: 0
          })
        }
      })
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (option) {
    wx.getSystemInfo({
      success: (systemInfo) => {
        this.setData({
          platform: systemInfo.platform
        });
      }
    });
    // const scene = decodeURIComponent(option.scene)
    const scene = option

    if (scene !== 'undefined' && scene.id) {

      this.setData({
        coverVisible: true,
        scroll: false
      })
      var id = scene.id
      var type = scene.type

      let scores = app.globalData.usr.scores
      
      const score = scores[scores.findIndex(item => item.id == type)].score
      if (type === '2') {
        api.updateStatus(id, app).then(res => {
          if (res.code !== 200) {
            this.setData({
              coverTitle: '请在开放当日扫码',
            })
          } else {
            api.reserve_detail(id, app).then(res => {

              this.setData({
                coverTitle: '参观' + res.title,
                coverScore: '+' + score,
                title_type: '参观环保设施'
              })
              const data = {
                "title": '参观' + res.title,
                "score": score,
                "link": "",
                "ftype_id": 2,
                "history_id": res.id
              }
              api.footprint_add(data, app).then(res1 => {})
            })
          }
        })
      } else {
        api.activity(id).then(res => {
          
          this.setData({
            coverTitle: '参加' + res.title,
            coverScore: '+' + score,
            title_type: '参加环保活动'
          })
          const data = {
            "title": '参加' + res.title,
            "score": score,
            "link": res.link,
            "ftype_id": 3,
            "history_id": res.id
          }
          api.footprint_add(data, app).then(res2 => {})
        })
      }
    } else
      utils.loginCB(this.getList, app)
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
  onPullDownRefresh: function () {},

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    if (this.data.historyList.length < this.data.total) {
      this.setData({
        page: this.data.page + 1
      })
      api.footprint_history({
        page: this.data.page,
        pageSize: this.data.pageSize
      }, app).then(res => {
        
        this.setData({
          historyList: this.data.historyList.concat(res.data),
          len: res.length,
          total: res.total
        })
      })
    }

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function (res) {

    if (res.target) {
      if (res.target.dataset.info.type === 1) {
        return {
          title: '快来和我一起学习环保小知识吧~'
        }
      } else {
        return {
          title: '快来和我一起参与环保活动吧~'
        }
      }
    }
  }
})