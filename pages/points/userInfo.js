// pages/points/userInfo.js
const pointsTracker = require("../../utils/points.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickname: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  bindNicknameInput: function (e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  
  saveNickname() {
    const {nickname} = this.data
    if(!nickname) {
      return;
    }

    // if(nickname.length > 5) {
    //   wx.showToast({
    //     icon: 'none',
    //     title: '昵称只能5个字以内',
    //   })
    //   return;
    // }

    wx.showLoading();

    wx.request({
      url: `${pointsTracker.pointsApiBase}/user/update`,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: { nickname, access_token: wx.getStorageSync('pointsToken') },
      timeout: 10000,
      success: (response) => {
        wx.hideLoading();
        if(response.statusCode !== 200 || !response.data || response.data.error_code != 0) {
          wx.showToast({
            title: '修改失败',
            icon: 'none'
          });
          return;
        }
        wx.showToast({
          title: '修改成功',
          icon: 'none'
        });
        wx.navigateBack();
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('获取用户信息失败:', error);
        wx.showToast({
          title: '修改失败',
          icon: 'none'
        });
      }
  });
  },
})