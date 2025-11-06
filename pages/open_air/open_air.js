const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Page({
	data: {
		// 测试
		coverVisible: false,
		coverTitle: '',
		coverScore: 0,
		platform: '',
		list: [],
		medias: [],
		docs: [],
		actCity: 1,
		tabShow: 1,
		cities: {
			1: "成都",
			2: "自贡",
			3: "泸州",
			4: "德阳",
			5: "绵阳",
			6: "内江",
			7: "南充",
			8: "广安",
			9: "达州",
			10: "巴中",
			11: "雅安",
			12: "眉山",
			13: "资阳",
			14: "攀枝花"
		}
	},
	id: null,
	introPage: {
		now: 0,
		pageSize: 6,
		total: 0,

	},
	enough: false,
	onLoad(option) {
		//测试
		
		wx.getSystemInfo({
			success: (systemInfo) => {
				this.setData({
					platform: systemInfo.platform
				});
			}
		});
		// const scene = this.data.platform === 'ios' ? decodeURIComponent(option.scene) : option.scene
		const scene = decodeURIComponent(option.scene)
		
		this.id = option.id;
		utils.loginCB(this.getData, app);

		//测试
		if (scene) {
			this.setData({
				coverVisible: true
			})
			var params = scene.split(",")
			var param1 = params[0].split("_")
			var param2 = params[1].split("_")
			var id = param1[1]
			var type = param2[1]
			// 
			// 
			if (type === '2') {

				api.facility(id, app).then(res => {
					this.setData({
						coverTitle: '参观' + res.title,
						coverScore: '+200'
					})
					const data = {
						"title": '参观' + res.title,
						"score": 200,
						"link": "",
						"ftype_id": 2,
						// "history_id": id
					}
					api.footprint_add(data, app).then(res1 => {})
				})


			} else {

				api.activity(id).then(res => {
					
					this.setData({
						coverTitle: '参加' + res.title,
						coverScore: '+200'
					})
					const data = {
						"title": '参加' + res.title,
						"score": 200,
						"link": res.link,
						"ftype_id": 3,
						// "history_id": id
					}
					api.footprint_add(data, app).then(res2 => {})
				})
			}
		}

		utils.loginCB(this.getData, app);
	},
	close(e) {
		this.setData({
			coverVisible: false
		})
	},
	getData() {
		const tab = this.data.tabShow;
		if (tab === 1) {
			const data = {
				page: this.introPage.now + 1,
				loc: this.data.actCity
			};
			api.facilities(data, app).then(res => {
				const newList = res.data;
				// 加入数组
				let curList = [...this.data.list, ...newList];
				this.setData({
					list: curList
				});
				this.introPage = {
					now: data.page,
					total: curList.length
				};
				// 加载完毕
				if (newList.length < this.introPage.pageSize || this.introPage.total === res.total) {
					this.enough = true;
				}
			});
		}
		if (tab === 2) {
			api.facility_medias(app).then(res => {
				if (res) {
					res.data.forEach(item => {
						item.create_time = utils.timeParse(item.create_time * 1000);
					});
					this.setData({
						medias: res.data
					});
				}
			});
		}
		if (tab === 3) {
			api.facility_docs(app).then(res => {
				if (res) {
					this.setData({
						docs: res.data
					});
				}
			});
		}
	},
	handleTab(e) {
		if (e.target.dataset.id) {
			const id = e.target.dataset.id - 0;
			if (id !== this.data.tabShow) {
				this.setData({
					tabShow: id
				});
				this.getData();
			}
		}
	},
	handleCity(e) {
		let actCity = e.target.dataset.city - 0;
		this.setData({
			actCity,
			list: []
		});

		this.introPage = {
			now: 0,
			pageSize: 6,
			total: 0
		};
		this.enough = false;
		this.getData();
	},
	handleOpenDetail(e) {
		const id = e.currentTarget.dataset.id;
		const type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/detail_short/detail_short?id=${id}&type=${type}`
		});
	},
	// 触底加载
	onReachBottom() {
		if (this.data.tabShow !== 1 || this.enough) return;
		this.getData();
	}
});