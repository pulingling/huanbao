// pages/points/rankings.js
const pointsTracker = require("../../utils/points.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ranks: [],
    in_rank: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
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

  async loadData() {
    wx.showLoading();
    wx.request({
        url: `${pointsTracker.pointsApiBase}/user/rank`,
        method: 'GET',
        data: { access_token: wx.getStorageSync('pointsToken') },
        timeout: 10000,
        success: (response) => {
          wx.hideLoading()
          if(response.statusCode !== 200 || !response.data) {
            wx.showToast({
              title: '获取信息失败',
              icon: 'none'
            });
            return;
          }
          this.setData({ 
            ranks: response.data.data.ranks || [],
            in_rank: response.data.data.in_rank,
          });
        },
        fail: (error) => {
          wx.hideLoading();
          console.error('获取信息失败:', error);
          wx.showToast({
            title: '获取信息失败',
            icon: 'none'
          });
        }
    });
  },

  openMyPrizes() {
    // 打开我的福袋
    wx.navigateTo({
      url: '/pages/prize_delivery/prize_delivery'
    });
  },
  openPrizes() {
    // 打开奖品设置
    wx.navigateTo({
      url: '/pages/points/prizes'
    });
  }
})