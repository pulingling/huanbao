const app = getApp();
const utils = require("../../utils/util");
const api = require("../../utils/request.js");
Page({
  data: {
		list1: [],
		list2: [],
		list3: [],
		docs:'',
		tabShow: 0,
		showPosition: false,
		allCities: {
			0:'市州',
			10: '成都',
      11: '自贡',
      12: '泸州',
      13: '德阳',
      14: '绵阳',
      15: '广元',
      16: '内江',
      17: '乐山',
      18: '南充',
      19: '眉山',
      20: '宜宾',
      21: '广安',
      22: '达州',
      23: '雅安',
      24: '遂宁',
      25: '巴中',
      26: '资阳',
      27: '攀枝花',
      28: '阿坝州',
      29: '甘孜州',
      30: '凉山州'
    },
		cities:[
			{
				key: 0,
				value: '全部'
			},
			{
				key: 10,
				value: '成都'
			},
			{
				key: 11,
				value: '自贡'
			},
			{
				key: 27,
				value: '攀枝花'
			},
			{
				key: 12,
				value: '泸州'
			},
			{
				key: 15,
				value: '广元'
			},
			{
				key: 24,
				value: '遂宁'
			},
			{
				key: 13,
				value: '德阳'
			},
			{
				key: 14,
				value: '绵阳'
			},
			{
				key: 16,
				value: '内江'
			},
			{
				key: 17,
				value: '乐山'
			},
			{
				key: 18,
				value: '南充'
			},
			{
				key: 20,
				value: '宜宾'
			},
			{
				key: 21,
				value: '广安'
			},
			{
				key: 22,
				value: '达州'
			},
			{
				key: 25,
				value: '巴中'
			},
			{
				key: 23,
				value: '雅安'
			},
			{
				key: 19,
				value: '眉山'
			},
			{
				key: 26,
				value: '资阳'
			},
			{
				key: 28,
				value: '阿坝州'
			},
			{
				key: 29,
				value: '甘孜州'
			},
			{
				key: 30,
				value: '凉山州'
			},
		],
		actCity: 0,
		cityNow: '市州'
	},
	enough: false,
	page: 1,
  handleCity(e) {
		let actCity = e.target.dataset.city - 0;
		
		let cityNow = this.data.allCities[actCity]
		this.setData({ actCity, cityNow, list1: [], list2: [], tabShow:0});
		this.page = 1
		this.enough = false
		this.getData()
	},
  handleTab(e) {
		if (e.target.dataset.id) {
			const id = e.target.dataset.id - 0;
			if (id !== this.data.tabShow) {
				this.setData({ tabShow: id, list1:[], list2:[], cityNow: '市州', actCity: '' });
				this.page = 1
				this.enough = false
				this.getData()
			}
		}
	},
	changeshowPosition() {
		this.setData({
			showPosition: !this.data.showPosition
		})
	},
	closeshowPosition() {
		this.setData({
			showPosition: false
		})
	},
	tapbox() {},
	toOrder() {
		wx.redirectTo({
      url: `/pages/order/order`,
    })
	},
  toDetail(e) {
    wx.navigateTo({
      url: `/pages/open_detail/open_detail?id=${e.target.dataset.id}`,
    })
	},
	onLoad(option) {
		if (option.id) {
			this.setData({
				tabShow: Number(option.id)||0
			})
		}
		utils.loginCB(this.getData, app);
	},
	reloadData() {
		if (this.data.tabShow === 3) {
			this.getData()
		}
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

		if (this.enough) {
			return
		}
		if (this.data.tabShow === 1 ) {
			return
		}
		if (this.data.tabShow === 0 || this.data.tabShow === 2|| this.data.tabShow === 3) {
			this.page += 1
		}
		this.getData();
	},
	getData() {
		const tab = this.data.tabShow;
		
		if (tab === 0) {
			let data = {}
			if (this.data.actCity !== 0) {
				data = {
					location: this.data.actCity
				}
			}
			data.page = this.page
			data.pageSize = 10
			api.reserve_list(data, app).then(res => {
				const total = res.total
				if ((this.page) * 10 >= total) {
					this.enough = true
				} else {
					this.enough = false
				}
				let resData = res.data
				let reg = /\d+.jpg$/
				for (let i = 0;i<resData.length;i++) {
					resData[i].collect = true
					// if(resData[i].s_image)
					// resData[i].s_image="https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com/image/"+resData[i].s_image.slice(resData[i].s_image.search(reg),)
				}
				this.setData({
					list1: [...this.data.list1,...resData],
					showPosition: false
				}) 
			})
		} else if (tab === 2) {
			let data = {
				order: 'visit_start_time',
				page: this.page,
				pageSize:5
			}
			api.reserve_list(data, app).then(res => {
				const total = res.total
				if ((this.page) * 5 >= total) {
					this.enough = true
				} else {
					this.enough = false
				}
				let resData = res.data
				let reg = /\d+.jpg$/
				for (let i = 0;i<data.length;i++) {
					data[i].collect = true
					// if(data[i].s_image)
					// data[i].s_image="https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com/image/"+data[i].s_image.slice(data[i].s_image.search(reg),)
				}
				this.setData({
					list2: [...this.data.list2,...resData],
					showPosition: false
				}) 
			})
		} else if (tab === 3) {
			api.reserve_collect_list(app).then(res => {
				let data = res
				let reg = /\d+.jpg$/
				for (let i = 0;i<data.length;i++) {
					data[i].collect = true
					// if(data[i].s_image)
					// data[i].s_image="https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com/image/"+data[i].s_image.slice(data[i].s_image.search(reg),)
				}
				this.setData({
					list3: data,
					showPosition: false
				}) 
			})
		} else if (tab === 1) {
			api.facility_docs(app).then(res => {
				if (res) {
					this.setData({ docs: res.data });
				}
			});
		}else{
			
			let data = {}
			if (this.data.actCity !== 0) {
				data = {
					location: this.data.actCity
				}
			}
			data.page = this.page
			data.pageSize = 10
			api.reserve_list(data, app).then(res => {
				const total = res.total
				if ((this.page) * 10 >= total) {
					this.enough = true
				} else {
					this.enough = false
				}
				let resData = res.data
				let reg = /\d+.jpg$/
				for (let i = 0;i<resData.length;i++) {
					resData[i].collect = true
					// if(resData[i].s_image)
					// resData[i].s_image="https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com/image/"+resData[i].s_image.slice(resData[i].s_image.search(reg),)
				}
				this.setData({
					list1: [...this.data.list1,...resData],
					showPosition: false
				}) 
			})
		}
	}
})