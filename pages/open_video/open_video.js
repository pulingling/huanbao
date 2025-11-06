const app = getApp();
const utils = require("../../utils/util");
Page({
  data: {
    video: '',
    showWarning: false
  },
  onLoad(option) {
    if (option.src.indexOf('cdn.envedu.com.cn') === -1) {
      option.src = `http://cdn.envedu.com.cn/${option.src}`
    }
    this.setData({
      video: option.src
    })
    utils.loginCB(this.init, app);
  },
  videoPlay() {
		this.setData({ showWarning: false });
	},
  init() {
    const that = this;
		wx.getNetworkType({
			success(res) {
				const networkType = res.networkType;
				if (networkType !== "wifi") {
					that.setData({ showWarning: true });
				}
			}
		});
  }
})