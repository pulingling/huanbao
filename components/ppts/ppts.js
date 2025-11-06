const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Component({
	data: {
		list: [],
		medias: [],
		docs: [],
		actCate: 0,
		tags: {
			0: "全部",
			31: "大气",
			32: "土壤",
			33: "水资源",
			34: "生态",
			35: "辐射",
			36: "能源",
			// 37: "环境教育",
			46: "固废",
			47: "噪音",
			48: "环保科普"
		},
		id: null,
		page: {
			now: 0,
			pageSize: 6,
			total: 0
		},
		enough: false
	},
	attached() {
		app.event.on("getComponentData", this, () => {
			if (this.data.enough) return;
			this.getData();
		});
	},
	detached() {
		app.event.off("getComponentData", this);
	},
	methods: {
		getData() {
			let data = {
				page: this.data.page.now + 1
			};
			this.data.actCate && Object.assign(data, { category: this.data.actCate });
			api.ppts(data, app).then(res => {
				const newList = res.data.map(item => {
					item.s_image = utils.imageUrl(item.s_image);
					return item;
				});
				// 加入数组
				let curList = [...this.data.list, ...newList];
				this.setData({ list: curList, page: { now: data.page, total: curList.length } });
				// 加载完毕
				if (newList.length < this.data.page.pageSize || this.data.page.total === res.total) {
					this.setData({ enough: true });
				}
			});
		},
		handleTag(e) {
			let actCate = e.target.dataset.cate - 0;
			this.setData({
				actCate,
				list: [],
				page: {
					now: 0,
					pageSize: 6,
					total: 0
				},
				enough: false
			});
			this.getData();
		},
		handleOpenDetail(e) {
			const id = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: `/pages/detail_short/detail_short?id=${id}&type=5`
			});
		},
		useDefault(e){
			let list = this.data.list.map(item=>{
				if(item.id == e.target.dataset.id)
				item.s_image = "http://cdn.envedu.com.cn/image/1605608896666.png"
				return item
			})
			this.setData({
			 list
			}) 
		}
	}
});
