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
        if(res.s_image) {
          res.s_image = res.s_image.replaceAll("http://cdn.envedu.com.cn", "https://cdn.envedu.com.cn");
        }
				this.setData({ detail: res });
				wx.setNavigationBarTitle({
					title: res.title || "详情"
        });
        let content = res.description || '';
        content = content.replaceAll("http://103.203.219.137:200", "https://sthjxjzx-cjhb.oss-cn-chengdu.aliyuncs.com");
        content = content.replaceAll("http://cdn.envedu.com.cn", "https://cdn.envedu.com.cn");
        WxParse.wxParse("description", "html", content, this, 5);
        content = res.content || '';
        content = content.replaceAll("http://103.203.219.137:200", "https://sthjxjzx-cjhb.oss-cn-chengdu.aliyuncs.com");
        content = content.replaceAll("http://cdn.envedu.com.cn", "https://cdn.envedu.com.cn");
				WxParse.wxParse("content", "html", content, this, 5);
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
