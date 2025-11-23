const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
const pointsTracker = require("../../utils/points.js");
const shareTracker = require("../../utils/shareTracker.js");

Page({
	data: {
		showTab: 1,
		list: [],
		lastScore: "-",
		learnedCount: "-",
		totalCount: "-"
	},
	onLoad() {
		utils.loginCB(() => {
			this.getData();
		}, app);
	},
	onShow() {
		// 开始页面浏览追踪
		pointsTracker.startPageTracking('learn');
		
		if (app.hasLogin) this.getData();
	},
	onShareAppMessage: function() {
		// 记录分享积分
		pointsTracker.recordShare('learn', '学习中心分享');
		
		return shareTracker.getShareConfig(
			"四川生态环境宣教中心 - 学习中心",
			"pages/learn/learn"
		);
	},
	getData() {
		const { lastScore, learnedCount, totalCount } = app.globalData.usr.user;
		this.setData({ lastScore, learnedCount, totalCount });
		const tolearn =
		app.globalData.usr.user.tolearn?JSON.parse(app.globalData.usr.user.tolearn.split("'").join('"').replace('None', '""')):""
    console.log(app.globalData.usr.user.learned.split("'").join('"').replace('None', '""'))
		const learned = app.globalData.usr.user.learned ?
		JSON.parse( app.globalData.usr.user.learned.split("'").join('"').replace('None', '""')):""
		console.log(tolearn)
		if (this.data.showTab === 1) {
			this.setData({ list: tolearn.map(item => {
        return {...item, s_image: item.s_image.replace("https://cdn.envedu.com.cn", "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com")}
      })});
		} else {
			this.setData({  list: learned.map(item => {
        return {...item, s_image: item.s_image.replace("https://cdn.envedu.com.cn", "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com")}
      })  || [] });
		}
	},
	handleTab(e) {
		if (e.target.dataset.tab) {
			let tab = e.target.dataset.tab - 0;
			this.setData({ showTab: tab });
			this.getData();
		}
	},
	toMore() {
		wx.navigateTo({
			url: `/pages/classes/classes`
		});
	}
});