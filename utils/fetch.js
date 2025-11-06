const utils = require("./util.js");
const urlBase = "https://c.envedu.com.cn:202/api"
let requestNum = 0;
let loadingController = false;
let isloading = false
// 请求
function fetch({
	httpType = "GET",
	url,
	data = {},
	loading = true,
	delay = 400
}) {
	httpType = httpType.toLocaleUpperCase();

	// timer 控制与 loading 的隐藏
	function TimerContro(timer) {
		timer && clearTimeout(timer);
		if (loading && !--requestNum && isloading) {
			wx.hideLoading();
			isloading = false
			// wx.hideNavigationBarLoading();
		}
	}
	return new Promise((resolve, reject) => {
		let timer = null;
		// 控制请求数与 loading 的显示
		if (loading) {
			requestNum++;
			if (requestNum === 1) {
				loadingController = true;
			}
			if (!timer) {
				timer = setTimeout(function () {
					if (loadingController) {
						loadingController = false;
						// wx.showNavigationBarLoading();
						wx.showLoading({
							title: "数据请求中",
							mask: true
						});
						isloading = true
					}
				}, delay);
			}
		}
		// 请求
		wx.request({
			url: urlBase + url,
			data,
			method: httpType,
			success: resp => {
				loading && TimerContro(timer);
				if (resp.statusCode !== 200) {
					reject(resp);
				} else {
					if (resp.header.token) utils.setStorage("token", resp.header.token);
					resolve(resp.data);
				}
			},
			fail: err => {
				utils.setStorage("token");
				loading && TimerContro(timer);
				reject(err);
			},
			header: {
				token: utils.getStorage("token"),
			}
		});
	});
}

module.exports = {
	fetch,
	urlBase
};