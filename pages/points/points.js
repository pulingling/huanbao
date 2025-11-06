// pages/points/points.js
const app = getApp();
const pointsTracker = require("../../utils/points.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    refreshing: false,
    userInfo: {},
    userLevel: 1,
    totalPoints: 0,
    todayPoints: 0,
    dailyStatus: {
      login: false,
      browse: 0,
      video: 0,
      share: 0
    },
    completedTasksCount: 0,
    pointsRecords: [],
    tasks: [],
    icons: {
      view_hbzs: '📄',
      view_hbdw: '📋',
      view_hbkj: '🎯',
      view_mjxd: '🌿',
      view_video: '▶',
      share: '🎉',
    },
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initPage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.refreshData();
  },

  /**
   * 初始化页面
   */
  async initPage() {
    const token = wx.getStorageSync('pointsToken');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    this.loadUserInfo();
  },

  /**
   * 获取每日状态
   */
  async loadUserInfo() {
    wx.request({
        url: `${pointsTracker.pointsApiBase}/user`,
        method: 'GET',
        data: { access_token: wx.getStorageSync('pointsToken') },
        timeout: 10000,
        success: (response) => {
          if(response.statusCode !== 200 || !response.data) {
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            });
            return;
          }
          this.setData({ 
            loading: false,
            totalPoints: response.data.data.available_credit || 0,
            userLevel: response.data.data.level || 1,
            todayPoints: response.data.data.today_credit || 0,
            tasks: response.data.data.tasks || [],
          });
          
        },
        fail: (error) => {
          console.error('获取用户信息失败:', error);
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
        }
    });
  },

  /**
   * 获取积分记录
   */
  async getPointsRecords(page = 1, limit = 10) {
    try {
      const response = await wx.request({
        url: `${pointsTracker.pointsApiBase}/points/records`,
        method: 'GET',
        data: { 
          openid: this.data.userInfo.openid,
          page, 
          limit 
        },
        timeout: 10000
      });

      if (response.statusCode === 200 && response.data) {
        return response.data.data || [];
      }
    } catch (error) {
      console.error('获取积分记录失败:', error);
    }
    return [];
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    // if (this.data.refreshing) return;
    
    // this.setData({ refreshing: true });
    
    // try {
    //   await this.loadPointsData();
    // } catch (error) {
    //   wx.showToast({
    //     title: '刷新失败',
    //     icon: 'none'
    //   });
    // } finally {
    //   this.setData({ refreshing: false });
    //   wx.stopPullDownRefresh();
    // }
  },

  /**
   * 加载更多记录
   */
  async loadMoreRecords() {
    // if (!this.data.hasMore || this.data.loading) return;

    // this.setData({ loading: true });

    // try {
    //   const nextPage = this.data.currentPage + 1;
    //   const moreRecords = await this.getPointsRecords(nextPage, this.data.pageSize);
      
    //   if (moreRecords && moreRecords.length > 0) {
    //     this.setData({
    //       pointsRecords: [...this.data.pointsRecords, ...moreRecords],
    //       currentPage: nextPage,
    //       hasMore: moreRecords.length === this.data.pageSize
    //     });
    //   } else {
    //     this.setData({ hasMore: false });
    //   }
    // } catch (error) {
    //   wx.showToast({
    //     title: '加载失败',
    //     icon: 'none'
    //   });
    // } finally {
    //   this.setData({ loading: false });
    // }
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadMoreRecords();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '四川生态环境宣教中心 - 积分中心',
      path: '/pages/points/points'
    };
  },

  /**
   * 执行任务
   */
  doTask(e) {
    const taskType = e.currentTarget.dataset.task;
    
    switch(taskType) {
      case 'view_hbzs':
        wx.setStorageSync('eduNowPage', 'knowledge');
        wx.switchTab({url: '/pages/enviromentEdu/enviromentEdu'});
        break;
      case 'view_hbdw':
        wx.setStorageSync('eduNowPage', 'books');
        wx.switchTab({url: '/pages/enviromentEdu/enviromentEdu'});
        break;
      case 'view_hbkj':
        wx.setStorageSync('eduNowPage', 'ppts');
        wx.switchTab({url: '/pages/enviromentEdu/enviromentEdu'});
        break;
      case 'view_mjxd':
        wx.switchTab({url: '/pages/passport/passport'});
        break;
      case 'view_video':
        wx.switchTab({url: '/pages/learn/learn'});
        break;
      case 'share':
        this.shareToFriend();
        break;
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
    }
  },
  /**
   * 执行签到
   */
  doSignin() {
    wx.showLoading({
      title: '签到中...'
    });
    
    // 模拟签到API调用
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '签到成功，获得10积分',
        icon: 'success'
      });
      
      // 更新积分
      this.setData({
        totalPoints: this.data.totalPoints + 10,
        completedTasksCount: this.data.completedTasksCount + 1
      });
    }, 1000);
  },

  /**
   * 观看视频
   */
  watchVideo() {
    wx.showToast({
      title: '视频功能开发中',
      icon: 'none'
    });
  },

  /**
   * 分享给好友
   */
  shareToFriend() {
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        
        // wx.showToast({
        //   title: '分享成功，获得40积分',
        //   icon: 'success'
        // });
        
        // // 更新积分
        // this.setData({
        //   totalPoints: this.data.totalPoints + 40,
        //   completedTasksCount: this.data.completedTasksCount + 1
        // });
      }
    });
  },

  /**
   * 打开积分规则页面
   */
  openPointsRules() {
    wx.navigateTo({
      url: '/pages/points_rules/points_rules'
    });
  },

  /**
   * 打开抽奖页面
   */
  openLottery() {
    wx.navigateTo({
      url: '/pages/lottery/lottery'
    });
  }
})