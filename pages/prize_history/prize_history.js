// pages/prize_delivery/prize_delivery.js
const app = getApp()
const pointsTracker = require("../../utils/points.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    data:[],
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    const now = new Date();
    const month = now.getMonth() + 1; // 月份需要加1
    const day = now.getDate();
    this.setData({
      from: options.from ? options.from : '',
      today: `${month}${day}`,
    })
    // 如果有奖品信息传递过来，可以在这里接收
    
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我的福袋'
    })
  },

  onShow() {
    this.loadPrize()
  },

  async loadPrize() {
    wx.showLoading();
    this.setData({loading: true})
    wx.request({
        url: `${pointsTracker.pointsApiBase}/prize/history`,
        method: 'GET',
        data: { access_token: wx.getStorageSync('pointsToken') },
        timeout: 10000,
        success: (response) => {
          if(response.statusCode !== 200 || !response.data) {
            wx.showToast({
              title: '获取中奖信息失败',
              icon: 'none'
            });
            return;
          }
          wx.hideLoading()
          this.setData({ 
            loading: false,
            data: response.data.data,
          });
          
        },
        fail: (error) => {
          wx.hideLoading()
          console.error('获取中奖信息失败:', error);
          wx.showToast({
            title: '获取中奖信息失败',
            icon: 'none'
          });
        }
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }

})