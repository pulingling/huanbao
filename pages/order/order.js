const app = getApp();
const utils = require("../../utils/util");
const api = require("../../utils/request.js");
Page({
  data:{
    list: []
  },
  onShow() {
    utils.loginCB(this.getData, app);
  },
  getData() {
    api.order_list(app).then(res => {
      this.setData({
        list: res.data
      })
    })
  },
  handleTab(e) {
		if (e.target.dataset.id) {
			wx.redirectTo({
        url: `/pages/open_order/open_order?id=${e.target.dataset.id}`,
      })
		}
	},
})