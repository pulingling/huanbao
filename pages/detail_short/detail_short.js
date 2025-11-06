const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
const WxParse = require("../../wxParse/wxParse.js");

Page({
	data: {
		detail: null,
		type: null //1:开放点,2:专家,3:开放点活动剪影,5:环保课程
	},
	id: null,
	onLoad: function(options) {
		this.id = options.id;
		this.setData({ type: options.type });
		utils.loginCB(this.getData, app);
	},
	getData() {
		let type = this.data.type - 0;
		let field;
		switch (type) {
			case 1:
				field = "facility";
				break;
			case 2:
				field = "facility_media";
				break;
			case 3:
				field = "facility_doc";
				break;
			case 4:
				field = "expert";
				break;
			case 5:
				field = "ppt";
				break;
			default:
				break;
		}
		api[field](this.id, app).then(res => {
			
			if (res) {
				this.setData({ detail: res });
				wx.setNavigationBarTitle({
					title: res.title || "详情"
				});
				res.description && WxParse.wxParse("description", "html", res.description, this, 5);
				res.content && WxParse.wxParse("content", "html", res.content, this, 5);
			}
		});
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
