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
      let content = res.content || ''
      content = content.replaceAll("http://103.203.219.137:200", "https://sthjxjzx-cjhb.oss-cn-chengdu.aliyuncs.com");
      content = content.replaceAll("http://cdn.envedu.com.cn", "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com");
			WxParse.wxParse("content", "html", content, this, 5);
		});
	}
});
