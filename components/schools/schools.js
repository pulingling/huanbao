const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Component({
	data: {
		list: [],
		page: 1,
		enough: false,
		loading:true
	},
	attached() {
		app.event.on("getComponentData", this, () => {
			this.getData();
		});
	},
	detached() {
		app.event.off("getComponentData", this);
	},
	methods: {
		getData() {
			if(!this.data.enough){
				this.setData({loading:true})
				api.schools({
					page: this.data.page++
				}, app).then(res => {
					const newList = this.data.list.concat(res.data) 
					this.setData({
						list: newList,
						enough:newList.length>=res.total?true:false,
						loading:false
					});
				});
			}

		},
		handleTap(e) {
			const id = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: `/pages/detail_long/detail_long?id=${id}&type=2`
			});
		},
		useDefault(e) {
			let list = this.data.list.map(item => {
				if (item.id == e.target.dataset.id)
					item.s_image = "http://cdn.envedu.com.cn/image/1605608896666.png"
				return item
			})
			this.setData({
				list
			})
		}
	}
});