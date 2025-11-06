const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
var title = ''
Page({
	data: {
		detail: true, // 控制tab
		showWarning: false,
		isMulti: false,
		introduction: "",
		title: "",
		outline: "",
		video: null,
		showBind: false,
		isWrong: false,
    coverVisible: false,
    id:'',
    hasTest:true
	},
	id: null,
	hasAsked: false,
	onLoad(option) {
    const that = this
    if (option.source){
      wx.getSystemInfo({
        success: (systemInfo) => {
          if (systemInfo.model.match('iPhone')){
            console.log('aaa')
            wx.navigateTo({
              url: '/pages/return_page/return_page',
            })
            return
          }
        }
      });
    }
    this.id = option.id;
    this.setData({
      id:option.id
    })
		utils.loginCB(this.getData, app);
		wx.getNetworkType({
			success(res) {
				const networkType = res.networkType;
				if (networkType !== "wifi") {
					that.setData({
						showWarning: true
					});
				}
			}
		});
	},
	onReady() {
    this.videoContext = wx.createVideoContext("video");
	},
	getData() {
		api.course(this.id, app).then(res => {
      // 
			title = res.title
			wx.setNavigationBarTitle({
				title: res.title || "在线学习"
      });
			this.setData({
				introduction: utils.fixStringEnter(res.introduction).replace(/(1\..*?)(2\..*?)(3\..*)/, '$1\n$2\n$3').trim(),
				title: res.title,
				outline: utils.fixStringEnter(res.outline),
				video: res.video
			});
			console.log(utils.fixStringEnter(res.introduction))
    });
    api.courseTest(this.id, app).then(res=>{
      console.log(res)
      let hasTest = true
      if (!res.data.length){
        hasTest = false
      }
      this.setData({
        hasTest
      })
	  console.log("hasTest",hasTest)
    })
	},
	handleTab(e) {
		if (e.target.dataset.detail) {
			this.setData({
				detail: true
			});
		} else {
			this.setData({
				detail: false
			});
		}
		if (!this.hasAsked && app.globalData.usr.user.memberId) {
			this.setData({
				showBind: true
			});
		}
	},
	toExam() {
		wx.navigateTo({
			url: `/pages/exam/exam?id=${this.id}`
		});
	},
	videoPlay() {
		this.setData({
			showWarning: false
		});
	},
	close(e) {
		this.setData({
			coverVisible: false
		})
	},
	getProgress(e) {
		if (this.data.isMulti == true) {
			return true
    }
		if (parseInt(e.detail.currentTime) === parseInt(e.detail.duration)) {

			this.setData({
				isMulti: true
			})
      var history_list = []
			api.footprint_history({
				no_page: 1
			}, app).then(res => {
        console.log(res)
				history_list = res.data
				var isWatched = false
				for (var i = 0; i < history_list.length; i++) {
					if (history_list[i].history_id == Number(this.id)) {
						isWatched = true
					}
				}
				if (isWatched === false) {
					this.setData({
						coverVisible: true
					})
					const data = {
						"title": "学习" + title,
						"score": 10,
						"link": "",
						"ftype_id": 1,
						"history_id": this.id,
						"is_pickable": 1
					}

					const scores = app.globalData.usr.scores
					score = scores[scores.findIndex(item => item.id == 1)].score
					data.score = score
					// app.event.emit("reGetUser");
					api.footprint_add(data, app).then(res1 => {})

				}

			})

		}
	},
	warning() {
		this.videoContext.play();
		this.setData({
			showWarning: false
		});
	},
	formSubmit(e) {
		const params = e.detail.value;
		api.bind_pc(params, app).then(res => {
			if (res && res.OK) {
				wx.showToast({
					title: "绑定成功",
					image: "/images/raccoon.png",
					during: 500
				});
				this.setData({
					isWrong: false,
					showBind: false
				});
				app.event.emit("reGetUser");
			} else {
				this.setData({
					isWrong: true
				});
			}
		});
	},
	jumpBind() {
		const params = {};
		api.bind_pc(params, app).then(res => {
			if (res && res.OK) {
				this.setData({
					showBind: false
				});
				this.hasAsked = true;
				app.event.emit("reGetUser");
			}
		});
	},
	videoError(e) {
		wx.showModal({
      showCancel:false,
      title:'IOS错误',
      content:e.detail
    })
	},
  doNothing() {},
  onPullDownRefresh(){
    this.onLoad(this.data.id)
  },
  confirmBits(){
    wx.showModal({
      cancelColor: 'cancelColor',
      title:'温馨提示',
      content:'您正在使用非wifi网络，可能会使用您较多流量，是否确认播放',
      success(e){
        console.log(e)
      }
    })
  }
});