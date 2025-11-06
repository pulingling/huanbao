const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Component({
	data: {
		list: [],
		page: 0,
		enough: false,
		loading: false
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
			if (!this.data.enough) {
				this.setData({
					loading: true
				})
				api.bases({
					page: this.data.page++
				}, app).then(res => {
					const newList = res.data
					this.setData({
						list: this.data.list.concat(res.data),
						enough: newList.length >= res.total ? true : false,
						loading: false
					});
				});
			}
		},
		handleTap(e) {
			const id = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: `/pages/detail_long/detail_long?id=${id}&type=1`
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