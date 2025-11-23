Component({
	properties: {
		option: {
			type: Array,
			value: []
		},
		showTime: {
			type: Boolean,
			value: false
		},
		jump: {
			type: String,
			value: "video_page"
		},
		type: {
			type: String,
			value: "0"
		}
	},
	methods: {
		toDetail(e) {
			const id = e.currentTarget.dataset.cardId;
      const { jump, type } = this.properties;
      console.log(jump,id,type)
			wx.navigateTo({
				url: `/pages/${jump}/${jump}?id=${id}&type=${type}`
			});
		},
		useDefault(e){
			let option = this.data.option.map(item=>{
				if(item.id == e.target.dataset.id)
				item.s_image = "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com/image/1605608896666.png"
				return item
			})
			
			this.setData({
				option
			}) 
		}
	}
});
