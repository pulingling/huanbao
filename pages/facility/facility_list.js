const app = getApp();
const utils = require("../../utils/util");
const api = require("../../utils/request.js");
Page({
    data: {
        list: [],
        title: ''
    },
    page: 1,
    enough: false,
    onLoad: function (option) {
        console.log(option.id)
        console.log(option.title)
        wx.setNavigationBarTitle({title: option.title})
        this.setData({
            title:option.title
        })
        this.getData(option.id)
    },
    // 触底加载
    onReachBottom() {
        if (this.enough) {
            return
        }
        this.page += 1
        this.getData();
    },
    getData(id) {
        let data = {}
        data.page = this.page
        data.pageSize = 10
        data.fid=id
        api.activities_list(data, app).then(
           res => {
            const total = res.body.total
            if ((this.page) * 10 >= total) {
                this.enough = true
            } else {
                this.enough = false
            }
         //   this.setData({
         //       list: [{id: 1, title: 'abc', s_image: 'http://cdn.envedu.com.cn/image/1612340550222.png', description: 'efg'}]
         //   })
            this.setData({
               list: [...this.data.list,...res.body.activities]
            })
           })

        
    }
})