const app = getApp();
const utils = require("../../utils/util");
const api = require('../../utils/request')
const pointsTracker = require("../../utils/points.js");

Page({
	data: {
		nowPage: "main",
    showPopup: false,
    popupTheme: '',
    dailyKnowledge: null,
		items: [{
				name: "推荐",
				jump: "main"
			},
			{
				name: "课件",
				jump: "ppts"
			},
			{
				name: "知识",
				jump: "knowledge"
			},
			{
				name: "基地",
				jump: "base"
			},
			{
				name: "学校",
				jump: "schools"
			}
		]
	},
	onLoad() {
    const themeIndex = new Date().getDate() % 3
    this.setData({
      popupTheme: 'bg' + themeIndex
    })
		utils.loginCB(() => {
			app.event.emit("getComponentData");
      if(!this.hasShowPopupToday()) {
        this.showPopupAuto()
      }
		}, app);
	},
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
		// 从其他页面跳转到指定模块
		if (app.globalData.indexJump) {
			this.handleJump(app.globalData.indexJump);
			app.globalData.indexJump = "";
		}
	},
	handleTopNavBar(e) {
		const jump = e.currentTarget.dataset.jump;
		
		this.handleJump(jump);
	},
	handleMoreBtn(e) {
    const jump = e.detail.jump;
    if (jump === 'learn'){
      wx.switchTab({
        url: '/pages/learn/learn',
      })
    }else{
      this.handleJump(jump);
    }
		
	},
	handleJump(jump) {
		if (jump && jump !== this.data.nowPage) {
			this.setData({
				nowPage: jump
			});
			app.event.emit("getComponentData");
		}
	},
	onReachBottom() {
		const {
			nowPage
		} = this.data;
		if (["knowledge", "ppts" ,"schools","base"].includes(nowPage)) {
			app.event.emit("getComponentData");
		}
	},
	onShareAppMessage: function () {
		pointsTracker.recordShare('index', '首页');
		return {
			title: "四川生态环境宣教中心",
			path: "pages/index/index"
		};
	},
  showPopup: function() {
    if(this.data.dailyKnowledge == null) {
      api.getDailyKnowledge().then(res => {
        res.body.knowledge.date = res.body.date
        this.setData({
          dailyKnowledge: res.body.knowledge,
          showPopup: true
        })
      })
    } else {
      this.setData({
        showPopup: true
      })
    }
  },
  closePopup: function() {
    this.setData({
      showPopup: false
    })
  },
  showPopupAuto: function() {
    this.showPopup()
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const today = d.getTime()
    wx.setStorageSync('lastShowPopupTimestamp', today)
  },
  jumpMoreKnowledge: function() {
    wx.setStorageSync('eduNowPage', 'knowledge')
    this.closePopup()
    wx.switchTab({
      url: '/pages/enviromentEdu/enviromentEdu',
    })
  },
  hasShowPopupToday: function() {
    const last = wx.getStorageSync("lastShowPopupTimestamp")
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const today = d.getTime()
    if(last == null || last == '' || last < today) {
      return false
    } else {
      return true
    }
	},
  // 某个页面的 JS 文件
handleNav() { // 跳转的外部链接
	wx.navigateTo({
	  url: `/pages/webview/webview`,
	});
  }
});