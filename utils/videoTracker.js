// 视频观看进度跟踪工具
const api = require('./request.js');

class VideoTracker {
  constructor() {
    this.videoId = null;
    this.duration = 0;
    this.currentTime = 0;
    this.hasReported = false;
    this.isTracking = false;
  }

  // 开始跟踪视频
  startTracking(videoId, duration = 0) {
    this.videoId = videoId;
    this.duration = duration;
    this.currentTime = 0;
    this.hasReported = false;
    this.isTracking = true;
    console.log(`开始跟踪视频: ${videoId}, 时长: ${duration}秒`);
  }

  // 更新视频时长（当视频元数据加载完成后调用）
  updateDuration(duration) {
    this.duration = duration;
    console.log(`更新视频时长: ${duration}秒`);
  }

  // 更新观看进度
  updateProgress(currentTime) {
    if (!this.isTracking || this.hasReported) {
      return;
    }

    this.currentTime = currentTime;
    
    // 检查是否观看了80%
    if (this.duration > 0 && currentTime >= this.duration * 0.8) {
      this.reportVideoPoints();
    }
  }

  // 上报视频观看积分
  reportVideoPoints() {
    if (this.hasReported || !this.videoId) {
      return;
    }

    this.hasReported = true;
    
    api.videoWatchPoints({
      video_id: this.videoId,
      watch_duration: this.currentTime,
      total_duration: this.duration
    }).then(res => {
      if (res.success) {
        wx.showToast({
          title: `观看视频获得${res.points}积分`,
          icon: 'success',
          duration: 2000
        });
        console.log(`视频观看积分上报成功: ${res.points}分`);
      } else {
        console.log('视频观看积分上报失败:', res.message);
      }
    }).catch(err => {
      console.error('视频观看积分上报错误:', err);
      this.hasReported = false; // 重置状态，允许重试
    });
  }

  // 停止跟踪
  stopTracking() {
    this.isTracking = false;
    this.videoId = null;
    this.duration = 0;
    this.currentTime = 0;
    this.hasReported = false;
    console.log('停止视频跟踪');
  }
}

// 创建单例实例
const videoTracker = new VideoTracker();

module.exports = videoTracker;