const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Component({
    data: {
        list: [],
        tags: [
            { title: "全部", id: 0 },
            { title: "大气污染", id: 1 },
            { title: "动植物", id: 2 },
            { title: "固废", id: 3 },
            { title: "光污染", id: 4 },
            { title: "环保发明", id: 5 },
            { title: "环保能源", id: 6 },
            { title: "水资源", id: 7 },
            { title: "土壤", id: 8 },
            { title: "噪声", id: 9 },
            { title: "生态保护", id: 45 },
            { title: "2020年防疫专题", id: 50 },
            { title: "辐射", id: 49 },
            { title: "习近平生态文明思想", id: 51 },
            { title: "碳主题", id: 52 }
        ],
        page: {
            now: 0,
            pageSize: 5,
            total: 0
        },
        actCate: 0,
        enough: false
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
            if (this.data.enough) return;
            const data = {
                category: this.data.actCate || "",
                page: this.data.page.now + 1
            };

            api.knowledges(data, app).then(res => {
                const newList = res.data;
                // 加入数组
                let curList = [...this.data.list, ...newList];
                this.setData({
                    list: curList,
                    page: { now: data.page, total: curList.length }
                });
                // 加载完毕
                if (newList.length < this.data.page.pageSize || this.data.page.total === res.total) {
                    this.setData({ enough: true });
                }
            });
        },
        handleCate(e) {
            let actCate = e.target.dataset.category - 0;
            this.setData({
                actCate,
                page: {
                    now: 0,
                    total: 0
                },
                list: [],
                enough: false
            });
            this.getData();
        },
        handleTap(e) {
            const id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: `/pages/knowledge_detail/knowledge_detail?id=${id}&type=1`
            });
        }
    }
});
