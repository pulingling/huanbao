/**
 * 积分追踪系统
 * 用于处理小程序中的各种积分获取场景
 */

const app = getApp();

class PointsTracker {
  constructor() {
    this.isInitialized = false;
    this.currentPageStartTime = null;
    this.currentPage = null;
    this.videoTrackingData = {};
    
    // 积分管理后台API基础URL
    // this.pointsApiBase = 'http://localhost:81/tll_edu/api/';
    this.pointsApiBase = 'https://scsthj.peisbaby.com/api/';
  }

  /**
   * 初始化积分追踪
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('积分追踪系统初始化');
    this.isInitialized = true;
  }

  /**
   * 记录每日首次登录积分
   */
  async recordDailyLogin() {
    // if (!app.globalData.usr || !app.globalData.usr.user) {
    //   console.log('用户未登录，跳过每日登录积分记录');
    //   return;
    // }

    // const openid = app.globalData.usr.user.openid;
    // if (!openid) {
    //   console.log('用户openid不存在，跳过每日登录积分记录');
    //   return;
    // }

    try {
      const result = await this.makeRequest('/event/save', 'POST', { event: 'login' });
      if (result && result.error_code == 0) {
        console.log('每日登录积分记录成功:', result);
        this.showPointsEarned(result.points, '每日登录');
      }
    } catch (error) {
      console.error('记录每日登录积分失败:', error);
    }
  }

  /**
   * 开始页面浏览追踪
   */
  startPageTracking(pageName) {
    this.currentPage = pageName;
    this.currentPageStartTime = Date.now();
    console.log(`开始追踪页面浏览: ${pageName}`);
  }

  /**
   * 记录浏览时长积分
   */
  async recordBrowseDuration(contentType, duration) {
    // if (!app.globalData.usr || !app.globalData.usr.user) {
    //   console.log('用户未登录，跳过浏览时长积分记录');
    //   return;
    // }

    // const openid = app.globalData.usr.user.openid;
    // if (!openid) {
    //   console.log('用户openid不存在，跳过浏览时长积分记录');
    //   return;
    // }

    try {
      const result = await this.makeRequest('/browse-duration', 'POST', {
         openid,
         content_type: contentType,
         duration_seconds: Math.floor(duration / 1000) // 转换为秒
       });
      
      if (result && result.success) {
        console.log('浏览时长积分记录成功:', result);
        this.showPointsEarned(result.points, '浏览内容');
      }
    } catch (error) {
      console.error('记录浏览时长积分失败:', error);
    }
  }

  /**
   * 根据页面路径获取内容类型
   */
  getContentTypeFromPage(pageName) {
    const contentTypeMap = {
      'knowledge_detail': 'knowledge',
      'learn': 'reading',
      'activity_detail': 'action',
      'index': 'general'
    };
    
    return contentTypeMap[pageName] || 'general';
  }

  /**
   * 开始视频观看追踪
   */
  startVideoTracking(videoId, videoTitle) {
    this.videoTrackingData[videoId] = {
      title: videoTitle,
      startTime: Date.now(),
      totalDuration: 0,
      watchedDuration: 0,
      lastPosition: 0
    };
    console.log(`开始追踪视频观看: ${videoTitle}`);
  }

  /**
   * 更新视频观看进度
   */
  updateVideoProgress(videoId, currentTime, duration) {
    if (!this.videoTrackingData[videoId]) return;
    
    const trackingData = this.videoTrackingData[videoId];
    trackingData.totalDuration = duration;
    
    // 计算观看时长增量
    if (currentTime > trackingData.lastPosition) {
      trackingData.watchedDuration += (currentTime - trackingData.lastPosition);
    }
    trackingData.lastPosition = currentTime;
  }

  /**
   * 记录视频观看积分
   */
  async recordVideoWatch(videoId) {
    if (!this.videoTrackingData[videoId]) return;
    // if (!app.globalData.usr || !app.globalData.usr.user) {
    //   console.log('用户未登录，跳过视频观看积分记录');
    //   return;
    // }

    // const openid = app.globalData.usr.user.openid;
    // if (!openid) {
    //   console.log('用户openid不存在，跳过视频观看积分记录');
    //   return;
    // }

    const trackingData = this.videoTrackingData[videoId];
    const completionRate = trackingData.totalDuration > 0 ? 
      (trackingData.watchedDuration / trackingData.totalDuration) : 0;

    try {
      const result = await this.makeRequest('/video-watch', 'POST', {
        openid,
        video_id: videoId,
        video_title: trackingData.title,
        watched_duration: Math.floor(trackingData.watchedDuration),
        total_duration: Math.floor(trackingData.totalDuration)
      });
      
      if (result && result.success) {
        console.log('视频观看积分记录成功:', result);
        this.showPointsEarned(result.points, '观看视频');
      }
    } catch (error) {
      console.error('记录视频观看积分失败:', error);
    } finally {
      // 清理追踪数据
      delete this.videoTrackingData[videoId];
    }
  }

  /**
   * 记录分享积分
   */
  async recordShare(shareType, shareTitle) {
    // if (!app.globalData.usr || !app.globalData.usr.user) {
    //   console.log('用户未登录，跳过分享积分记录');
    //   return;
    // }

    // const openid = app.globalData.usr.user.openid;
    // if (!openid) {
    //   console.log('用户openid不存在，跳过分享积分记录');
    //   return;
    // }
    console.log(`记录分享: ${shareTitle}`);
    try {
      const result = await this.makeRequest('/event/save', 'POST', {});
      
      if (result && result.error_code == 0) {
        console.log('分享积分记录成功:', result);
        this.showPointsEarned(result.points, '分享内容');
      }
    } catch (error) {
      console.error('记录分享积分失败:', error);
    }
  }

  /**
   * 记录活动参与积分
   */
  async recordActivityParticipation(activityId, activityTitle) {
    // 这里可以根据具体的活动类型调用相应的积分接口
    console.log(`记录活动参与: ${activityTitle}`);
  }

  /**
   * 获取用户当日积分状态
   */
  async getDailyStatus() {
    if (!app.globalData.usr || !app.globalData.usr.user) {
      console.log('用户未登录，无法获取积分状态');
      return null;
    }

    const openid = app.globalData.usr.user.openid;
    if (!openid) {
      console.log('用户openid不存在，无法获取积分状态');
      return null;
    }

    try {
      const result = await this.makeRequest(`/daily-status?openid=${openid}`, 'GET');
      return result;
    } catch (error) {
      console.error('获取每日积分状态失败:', error);
      return null;
    }
  }

  /**
   * 获取用户积分信息
   */
  async getUserPointsInfo() {
    if (!app.globalData.usr || !app.globalData.usr.user) {
      console.log('用户未登录，无法获取积分信息');
      return { score: 0, points: 0, level: 1, total_earned_points: 0 };
    }

    const openid = app.globalData.usr.user.openid;
    if (!openid) {
      console.log('用户openid不存在，无法获取积分信息');
      return { score: 0, points: 0, level: 1, total_earned_points: 0 };
    }

    try {
      const result = await this.makeRequest(`/user-info?openid=${openid}`, 'GET');
      return {
        score: result.total_points || 0,
        points: result.total_points || 0,
        level: result.level || 1,
        total_earned_points: result.total_earned_points || 0
      };
    } catch (error) {
      console.error('获取用户积分信息失败:', error);
      return { score: 0, points: 0, level: 1, total_earned_points: 0 };
    }
  }

  /**
   * 获取今日抽奖次数
   */
  async getLotteryTodayCount() {
    if (!app.globalData.usr || !app.globalData.usr.user) {
      console.log('用户未登录，无法获取抽奖次数');
      return { count: 0 };
    }

    const openid = app.globalData.usr.user.openid;
    if (!openid) {
      console.log('用户openid不存在，无法获取抽奖次数');
      return { count: 0 };
    }

    try {
      const result = await this.makeRequest(`/lottery/today-count?openid=${openid}`, 'GET');
      return { count: result.count || 0 };
    } catch (error) {
      console.error('获取今日抽奖次数失败:', error);
      return { count: 0 };
    }
  }

  /**
   * 执行抽奖请求
   */
  async lotterySpinRequest(params) {
    if (!app.globalData.usr || !app.globalData.usr.user) {
      console.log('用户未登录，无法进行抽奖');
      throw new Error('用户未登录');
    }

    const openid = app.globalData.usr.user.openid;
    if (!openid) {
      console.log('用户openid不存在，无法进行抽奖');
      throw new Error('用户信息不完整');
    }

    try {
      const requestData = {
        openid: openid,
        cost_points: params.cost_points || 100
      };
      
      const result = await this.makeRequest('/lottery/spin', 'POST', requestData);
      return result;
    } catch (error) {
      console.error('抽奖请求失败:', error);
      throw error;
    }
  }

  /**
   * 发起HTTP请求
   */
  async makeRequest(endpoint, method = 'POST', data = {}) {
    data.access_token = wx.getStorageSync('pointsToken') || '';
    return new Promise((resolve, reject) => {
      const requestOptions = {
        url: this.pointsApiBase + endpoint,
        method: method.toUpperCase(),
        data: data,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
          //'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        }
      };

      if (data && method.toUpperCase() !== 'GET') {
        requestOptions.data = data;
      }

      wx.request(requestOptions);
    });
  }

  /**
   * 显示积分获得提示
   */
  showPointsEarned(points, action) {
    if (points > 0) {
      wx.showToast({
        title: `${action}+${points}积分`,
        icon: 'success',
        duration: 2000
      });
    }
  }

  /**
   * 页面隐藏时处理浏览时长
   */
  onPageHide() {
    if (this.currentPage && this.currentPageStartTime) {
      const duration = Date.now() - this.currentPageStartTime;
      const contentType = this.getContentTypeFromPage(this.currentPage);
      
      // 只有浏览时长超过30秒才记录积分
      if (duration > 30000) {
        this.recordBrowseDuration(contentType, duration);
      }
      
      this.currentPage = null;
      this.currentPageStartTime = null;
    }
  }
}

// 创建全局实例
const pointsTracker = new PointsTracker();

module.exports = pointsTracker;