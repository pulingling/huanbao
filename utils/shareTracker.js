// 分享功能积分跟踪工具
const pointsTracker = require('./points.js');

class ShareTracker {
  constructor() {
    this.hasSharedToday = false;
    this.shareCount = 0;
  }

  // 处理分享事件
  async handleShare(shareType, contentId = '', contentTitle = '') {
    try {
      // 使用积分追踪系统记录分享
      await pointsTracker.recordShare(shareType, contentTitle);
      return true;
    } catch (err) {
      console.error('分享积分上报错误:', err);
      return false;
    }
  }

  // 获取分享配置（用于onShareAppMessage）
  getShareConfig(title, path, imageUrl = '') {
    return {
      title: title || '四川生态环境宣教中心 - 一起学习环保知识',
      path: path || '/pages/index/index',
      imageUrl: imageUrl,
      success: (res) => {
        console.log('分享成功', res);
        // 分享成功后上报积分
        this.handleShare('wechat', path, title);
      },
      fail: (res) => {
        console.log('分享失败', res);
      }
    };
  }

  // 重置每日分享状态（可在每日登录时调用）
  resetDailyStatus() {
    this.hasSharedToday = false;
    this.shareCount = 0;
  }
}

// 创建单例实例
const shareTracker = new ShareTracker();

module.exports = shareTracker;