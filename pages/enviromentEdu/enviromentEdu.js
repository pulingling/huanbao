const app = getApp();
const utils = require("../../utils/util");
const api = require("../../utils/request")
const browseTracker = require("../../utils/browseTracker.js");
const shareTracker = require("../../utils/shareTracker.js");

Page({
  data: {
    nowPage: "ppts",
    items: [{
        name: "环保课件",
        jump: "ppts"
      },
      {
        name: "环保读物",
        jump: "books"
      },
      {
        name: "环保知识",
        jump: "knowledge"
      }
    ],
    bookList: []
  },
  toBookDetail(e){
    const id = e.currentTarget.dataset.id
    
  },
  onLoad() {},
  onShow() {
    // 版本检测
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {

      });
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: "更新提示",
          content: "新版本已经准备好，是否重启应用？",
          success: res => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
    }
    
    if(wx.getStorageSync('eduNowPage') != null && wx.getStorageSync('eduNowPage') != '') {
      this.setData({
        nowPage: wx.getStorageSync('eduNowPage')
      })
      wx.removeStorageSync('eduNowPage')
    }
    
    // 确保登录后再执行数据获取
    utils.loginCB(() => {
      app.event.emit("getComponentData");
    }, app);
    
    // 从其他页面跳转到指定模块
    if (app.globalData.indexJump) {
      this.handleJump(app.globalData.indexJump);
      app.globalData.indexJump = "";
    }
    this.getMoreBook()
    
    // 开始统计当前页面的浏览时长
    let contentType = '';
    switch(this.data.nowPage) {
      case 'knowledge':
        contentType = 'knowledge'; // 环保知识
        break;
      case 'books':
        contentType = 'reading'; // 环保读物
        break;
      case 'ppts':
        contentType = 'courseware'; // 环保课件
        break;
    }
    
    if (contentType) {
      browseTracker.startTracking(contentType);
    }
  },
  
  onHide() {
    // 页面隐藏时停止统计
    console.log('onHide');
    browseTracker.onPageHide();
  },
  
  onUnload() {
    // 页面卸载时停止统计
    console.log('onUnload');
    browseTracker.onPageUnload();
  },
  getMoreBook(e) {
    api.getBooksList({
      page: 1,
      pageSize: 100
    }, app).then(res => {

      this.setData({
        bookList: res.body.data
      })

    })
  },
  handleTopNavBar(e) {
    const jump = e.currentTarget.dataset.jump;

    this.handleJump(jump);
  },
  handleMoreBtn(e) {
    const jump = e.detail.jump;
    this.handleJump(jump);
  },
  handleJump(jump) {
    console.log(jump, this.data.nowPage)
    
    // 停止之前页面的浏览统计
    browseTracker.stopTracking();
    
    if (jump && jump !== this.data.nowPage) {
      this.setData({
        nowPage: jump
      });
      app.event.emit("getComponentData");
      
      // 开始新页面的浏览统计
      let contentType = '';
      switch(jump) {
        case 'knowledge':
          contentType = 'knowledge'; // 环保知识
          break;
        case 'books':
          contentType = 'reading'; // 环保读物
          break;
        case 'ppts':
          contentType = 'courseware'; // 环保课件
          break;
      }
      
      if (contentType) {
        browseTracker.startTracking(contentType);
      }
    }
  },
  onReachBottom() {
    const {
      nowPage
    } = this.data;
    if (["knowledge", "ppts", "schools", "base"].includes(nowPage)) {
      app.event.emit("getComponentData");
    }
  },
  onShareAppMessage: function () {
    return shareTracker.getShareConfig(
      "四川生态环境宣教中心",
      "pages/index/index"
    );
  }
});