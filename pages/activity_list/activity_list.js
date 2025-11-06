// pages/activity_list/activity_list.js
const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
Page({

  /**
   * Page initial data
   */
  data: {
    activities:[],
    facilities:[]
  },
  getList(){
    api.activity_list(app).then(res =>{
      // 
      this.setData({
        activities: res.data.acts,
        facilities: res.data.facts
      })
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    utils.loginCB(this.getList,app)
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