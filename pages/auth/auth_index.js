const app = getApp();
Page({

  /**
   * Page initial data
   */
  data: {
    type:'',
    id:0
  },
  getuserInfo(e) {
    app.event.emit('getUserAndLogin')
    const that = this
    if (this.data.type == 'order') {
      wx.redirectTo({
        url: `/pages/open_order/open_order?id=${that.data.id}`,
      })

    } else
      wx.switchTab({
        url: '/pages/index/index',
      })
  },
  userReject(e) {

    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    if(options)
    this.setData({
      type: options.type,
      id:options.id
    })
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

  }
})