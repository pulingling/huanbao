const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
const WxParse = require("../../wxParse/wxParse.js");

Page({
	data: {
		detail: null
	},
	id: null,
	onLoad(option) {
		this.id = option.id;
		this.type = option.type;
		utils.loginCB(this.getData, app);
	},
	getData() {
		api.knowledge(this.id, app).then(res => {
			this.setData({ detail: res });
			wx.setNavigationBarTitle({
				title: res.title || "环保知识"
			});
			res.content && WxParse.wxParse("content", "html", res.content, this, 5);
		});
	}
});
