const api = require("./utils/request");
const {
	EventBus
} = require("./assets/event.js");
const utils = require("./utils/util.js");
const pointsTracker = require("./utils/points.js");

App({
	event: new EventBus(),
	timer: null,
	onShow(res) {
		wx.setStorageSync('shareTicket', res.shareTicket)
	},
	onLaunch: function (options) {
		// 兼容
		this.polyfill();
		this.globalData.scene = options.scene;
		this.options = options;
		
		// 获取系统信息
		wx.getSystemInfo({
			success: (systemInfo) => {
				this.globalData.systemInfo = systemInfo;
				this.globalData.isDev = systemInfo.platform === "devtools";
				this.globalData.StatusBar = systemInfo.statusBarHeight;
				this.globalData.CustomBar = systemInfo.platform == "android" ? systemInfo.statusBarHeight + 50 : systemInfo.statusBarHeight + 45;
			}
		});
		
		// 获取设备信息
		wx.getDeviceInfo({
			success: (deviceInfo) => {
				this.globalData.deviceInfo = deviceInfo;
			}
		});
		// 查询用户权限,有权限就直接登录,没有先进入权限界面
		const that = this
		that.login();
		this.event.on("getUserAndLogin", this, () => {
			// 用户授权后重新获取系统信息
			wx.getSystemInfo({
				success: (systemInfo) => {
					this.globalData.StatusBar = systemInfo.statusBarHeight;
					this.globalData.CustomBar = systemInfo.platform == "android" ? systemInfo.statusBarHeight + 50 : systemInfo.statusBarHeight + 45;
				}
			});
		})
		this.event.on("reLogin", this, () => {
			this.hasLogin = false;
			this.login(false);
			const duration = 3000;
			wx.showToast({
				title: "登陆已失效，正在重新登陆，请重新进入页面",
				icon: "none",
				duration
			});
			setTimeout(() => {
				wx.hideToast();
				wx.switchTab({
					url: "/pages/index/index"
				});
			}, duration);
		});
		this.event.on("reGetUser", this, () => {
			this.updateUser();
		});
	},
	onShow(){
		// 移除过时的用户信息授权检查
		// 现在使用新的用户信息获取方式，不需要强制跳转到授权页面
	}
	,
	polyfill() {
		if (!Array.prototype.includes) {
			Object.defineProperty(Array.prototype, "includes", {
				value: function (searchElement, fromIndex) {
					if (this == null) {
						throw new TypeError('"this" is null or not defined');
					}
					var o = Object(this);
					var len = o.length >>> 0;
					if (len === 0) {
						return false;
					}
					var n = fromIndex | 0;
					var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
					while (k < len) {
						if (o[k] === searchElement) {
							return true;
						}
						k++;
					}
					return false;
				}
			});
		}
		if (!String.prototype.includes) {
			Object.defineProperty(String.prototype, "includes", {
				value: function (search, start) {
					if (typeof start !== "number") {
						start = 0;
					}
					if (start + search.length > this.length) {
						return false;
					} else {
						return this.indexOf(search, start) !== -1;
					}
				}
			});
		}
	},
	// 在String和Array中添加includes方法
	_readyCallback: [],
	hasLogin: false,
	ready(cb) {
		if (Array.isArray(cb)) {
			this._readyCallback.concat(cb);
		} else this._readyCallback.push(cb);
	},
	login(loading = true) {
		utils.setStorage("token", "");
		wx.login({
			success: codeInfo => {
				if (codeInfo.code) {
					const params = {
						code: codeInfo.code,
						// scene:this.options.scene,
						// fakeId:"test1589787838300",
						// errMsg:"login:ok"
					}
					// if (this.options.query) {
					// 	params.query = this.options.query;
					// }
					api.login(params, this, loading)
						.then(resp => {
							console.log(resp)
							wx.setStorageSync('session_key', resp.session_key)
							// 使用新的用户信息获取方式
							wx.getUserProfile({
								desc: '用于完善用户资料',
								success: (res2) => {
									wx.setStorageSync('avatarUrl', res2.userInfo.avatarUrl)
									wx.setStorageSync('nickName', res2.userInfo.nickName)
								},
								fail: () => {
									// 如果获取用户信息失败，使用默认值
									wx.setStorageSync('avatarUrl', '')
									wx.setStorageSync('nickName', '用户')
								}
							})
							if (!resp) return;
							this.readycb();
							this.handleLogin(resp);
							/*防止onLoad执行在onLaunch之前*/
							if (this.sessionCallback) {
								const token = utils.getStorage("token");
								this.sessionCallback(token);
							}
							/* end */
						})
						.catch(resp => console.error(resp));
				} else {
					wx.showToast({
						title: "登录失败",
						image: "/images/raccoon.png"
					});
				}

			},
			fail: (err) => {
				 console.log(err)
				wx.showToast({
					title: "登录失败",
					image: "/images/raccoon.png"
				});
			}
		});

		wx.login({
			success: codeInfo => {
				if (codeInfo.code) {
					const params = {
						code: codeInfo.code,
					}
					api.pointsLogin(params, this)
				}
			},
			fail: (err) => {
				 console.log(err)
				wx.showToast({
					title: "登录失败",
					image: "/images/raccoon.png"
				});
			}
		});
	},
	
	readycb() {
		if (!this._readyCallback.length) return;
		const cb = this._readyCallback.pop();
		cb();
		this.readycb();
	},
	handleLogin(res) {
		this.globalData.usr = Object.assign({}, this.globalData.usr, res);
		this.hasLogin = true;
		console.log(res)
		api.update_user({
			nickName: wx.getStorageSync('nickName'),
			avatarUrl: wx.getStorageSync('avatarUrl')
		}, this).then(res => {
		})
		// 每次登录后调用api获取用户名密码发给后台
		
		// 初始化积分追踪系统
		pointsTracker.init();
		// 记录每日首次登录积分
		pointsTracker.recordDailyLogin();
	},
	updateUser() {
		const that = this;
		if (this.hasLogin) {
			api.getUser(this).then(res => {
				if (res) {
					Object.assign(that.globalData.usr.user, res);
				}
			});
		}
	},
	globalData: {
		scene: 1001,
		usr: {
			wxData: {
				avatarUrl: "",
				nickName: ""
			}
		},
		isDev: false, // 客户端平台
		StatusBar: 0,
		CustomBar: 0,
		indexJump: "",
		userInfo: null,
		iv: '',
		encryptedData: '',
		session_key: ''
	}
});