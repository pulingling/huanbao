const app = getApp();
const utils = require("../../utils/util");
const api = require("../../utils/request.js");
// pages/webview/webview.js
Page({
  data: {
    url: '', // 页面中需要的数据
  },
  onLoad: function () {
    this.setData({
      url: 'https://screen.scgchc.com/scgc_activity/simple_exam/?index=052QDV8S90' // 从跳转页面中传过来的url在options中可以拿到
    });
  }
});