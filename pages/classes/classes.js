const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Page({
	data: {
		tags: [
			{ category: 0, name: "全部" },
			{ category: 6, name: "能源篇" },
			{ category: 9, name: "噪声篇" },
			{ category: 7, name: "水资源篇" },
			{ category: 12, name: "生态系统篇" },
			{ category: 3, name: "固废篇" },
			{ category: 1, name: "大气篇" },
			{ category: 11, name: "生物多样性篇" },
			{ category: 13, name: "辐射篇" },
			{ category: 15, name: "碳主题篇" },
			{ category: 16, name: "生态文明优质课"},
			{ category: 18, name: '2分钟小知识' }
		],
		list: [],
		actLevel: 1,
		actCate: 0,
		page: {
			now: 0,
			pageSize: 5,
			total: 0
		},
		enough: false,
		showError: false
	},
	onLoad() {
		utils.loginCB(this.getList, app);
	},
	getList() {
		if (this.data.enough) return;
		const data = {
			level: this.data.actLevel,
			category: this.data.actCate || "",
			page: this.data.page.now + 1
		};
		api.courses(data, app)
			.then(res => {
				// 
        // 格式化
        console.log(res)
        const newList = res.data;
        console.log(newList)
				newList.forEach(item => {
					// item.update_time = utils.timeParse(item.create_time * 1000);
					item.update_time = utils.timeParse2(item.update_time) 
          item.title = utils.fixStringEnter(item.title);
          if (item.introduction){
            item.introduction = item.introduction.replace(/\\n/g, "\n");
          }else{
            item.introduction = ''
          }
          item.s_image = item.s_image.replace("https://cdn.envedu.com.cn", "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com")
					
        });
        
				// 加入数组
        let curList = [...this.data.list, ...newList];
        console.log(curList)
				this.setData({
					list: curList,
					page: { now: data.page, total: curList.length }
				});
				// 加载完毕
				if (newList.length < this.data.page.pageSize || this.data.page.total === res.total) {
					this.setData({ enough: true });
				}
			})
			.catch(err => {
				this.setData({ showError: true });
			});
	},
	handleLevel(e) {
		if (e.target.dataset.level) {
			let actLevel = e.target.dataset.level - 0;
			this.setData({
				actLevel,
				page: {
					now: 0,
					total: 0
				},
				list: [],
				enough: false
			});
			this.getList();
		}
	},
	handleCate(e) {
    let actCate = e.target.dataset.category - 0;
    console.log(actCate)
		this.setData({
			actCate,
			actLevel: 1,
			page: {
				now: 0,
				total: 0
			},
			list: [],
			enough: false
		});
		this.getList();
	},
	// 触底加载
	onReachBottom() {
		this.getList();
	}
});
