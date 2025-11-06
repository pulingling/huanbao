const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
const WxParse = require("../../wxParse/wxParse.js");

Page({
	data: {
		spreadMain: true,
		spreadAct: true,
		detail: null
	},
	id: null,
	type: null, //1:基地,2:学校
	onLoad: function(options) {
		this.id = options.id;
		this.type = options.type;
		utils.loginCB(this.getData, app);
	},
	getData() {
		if (this.type === "1") {
			api.base(this.id, app).then(res => {
				if (res) {
					this.setData({ detail: res });
					wx.setNavigationBarTitle({
						title: res.title || "详情"
					});
					WxParse.wxParse("desc", "html", res.desc, this, 5);
					if (res.activity && res.activity.length) {
						res.activity.forEach((item, index) => {
							WxParse.wxParse(`school_info${index}`, "html", res.activity[index].desc, this, 5);
						});
					}
				}
			});
		}
		// TODO 这里只能用最笨的办法,目前没想好怎么解决
		if (this.type === "2") {
			api.school(this.id, app).then(res => {
				this.setData({ detail: res });
				wx.setNavigationBarTitle({
					title: res.title || "详情"
				});
				WxParse.wxParse("desc", "html", res.desc, this, 5);
				// WxParse.wxParse("school_info", "html", res.activity[0].desc, this, 5);
				if (res.activity && res.activity.length) {
					res.activity.forEach((item, index) => {
						WxParse.wxParse(`school_info${index}`, "html", res.activity[index].desc, this, 5);
					});
				}
			});
		}
	},
	toggleMainSpread() {
		const spreadMain = !this.data.spreadMain;
		this.setData({ spreadMain });
	},
	toggleActSpread() {
		const spreadAct = !this.data.spreadAct;
		this.setData({ spreadAct });
	}
});
