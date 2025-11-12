/**
 * 浏览时长统计工具类
 * 用于统计用户在各个页面的浏览时长，并上报积分
 */

const pointsTracker = require("./points.js");
const app = getApp();

class BrowseTracker {
  constructor() {
    this.startTime = null;
    this.contentType = null;
    this.contentId = null;
    this.minDuration = {
      'knowledge': 60,    // 环保知识：1分钟
      'reading': 60,      // 环保读物：90秒
      'courseware': 60,   // 环保课件：90秒
      'action': 60        // 美境行动：1分钟
    };

    this.timeRecord = {
      'knowledge': 0,
      'reading': 0,
      'courseware': 0,
      'action': 0
    };

    this.eventType = {
      'knowledge': 'view_hbzs',    // 环保知识：1分钟
      'reading': 'view_hbdw',      // 环保读物：90秒
      'courseware': 'view_hbkj',   // 环保课件：90秒
      'action': 'view_mjxd'        // 美境行动：1分钟
    }
  }

  /**
   * 开始统计浏览时长
   * @param {string} contentType - 内容类型：knowledge/reading/courseware/action
   * @param {string} contentId - 内容ID（可选）
   */
  startTracking(contentType, contentId = null) {
    if(this.contentType == contentType) {
      console.log(`继续统计浏览时长: ${contentType}, ID: ${contentId}`);
      return;
    }

    this.startTime = Date.now();
    this.contentType = contentType;
    this.contentId = contentId;
    console.log(`开始统计浏览时长: ${contentType}, ID: ${contentId}`);
  }

  /**
   * 停止统计并上报积分
   */
  stopTracking() {
    if (!this.startTime || !this.contentType) {
      console.log('未开始统计或参数不完整');
      return;
    }

    const endTime = Date.now();
    const exsitingTime = this.timeRecord[this.contentType] || 0;
    const durationSeconds = Math.floor((endTime - this.startTime) / 1000) + exsitingTime;
    const minRequired = this.minDuration[this.contentType] || 60;

    console.log(`浏览时长: ${durationSeconds}秒, 最小要求: ${minRequired}秒`);

    // 如果浏览时长达到要求，上报积分
    if (durationSeconds >= minRequired) {
      //this.reportBrowsePoints(durationSeconds);
      pointsTracker.recordEvent(this.eventType[this.contentType]);
      console.log('已上报浏览积分');
      // 重置状态
      this.reset();
    } else {
      //timeRecord
    }

    
  }

  /**
   * 上报浏览积分
   * @param {number} durationSeconds - 浏览时长（秒）
   */
  reportBrowsePoints(durationSeconds) {

  }

  /**
   * 重置统计状态
   */
  reset() {
    if(this.contentType) {
      this.timeRecord[this.contentType] = 0;
    }
    this.startTime = null;
    this.contentType = null;
    this.contentId = null;
  }

  /**
   * 页面隐藏时调用，自动停止统计
   */
  onPageHide() {
    this.stopTracking();
  }

  /**
   * 页面卸载时调用，自动停止统计
   */
  onPageUnload() {
    this.stopTracking();
  }
}

// 创建全局实例
const browseTracker = new BrowseTracker();

module.exports = browseTracker;