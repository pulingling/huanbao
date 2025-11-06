const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Page({
	data: {
		list: []
	},
	id: null,
	onLoad(option) {
		utils.loginCB(this.getData, app);
	},
	getData() {
		api.experts(app).then(res => {
			this.setData({
				list: res.body
			});
		});
	},
	handleTap(e) {
		const id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: `/pages/detail_short/detail_short?id=${id}&type=4`
		});
	}
});