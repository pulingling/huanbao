const app = getApp();
const api = require("../../utils/request.js");
const util = require("../../utils/util");
const utils = require("../../utils/util");
const WxParse = require("../../wxParse/wxParse.js");
Page({
  data: {
    detail:{
      lat: 30.572903,
      lon: 104.066277
    },
    isOpen: true,
    markers: [{
      id: 0,
      latitude: 30.572903,
      longitude: 104.066277,
      width: 50,
      height: 50
    }]
  },
  id: null,
  onLoad(option) {
    this.id = option.id;
    utils.loginCB(this.getData, app);
    const qrUrl = option.q ? decodeURIComponent(option.q) : ''; 
  },
  toOrder() {
    const that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting["scope.userInfo"])
          wx.redirectTo({
            url: `/pages/auth/auth_index?type=order&${that.id}`,
          })
        else {
          if (that.data.isOpen) {
            wx.navigateTo({
              url: `/pages/order_detail/order_detail?id=${that.id}`,
            })
          }
        }
      }
    })

  },
  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phone
    })
  },
  getData() {
    api.reserve_detail(this.id, app).then(res => {
			if (res) {
        const markers = [{
          id: 0,
          latitude: Number(res.lat),
          longitude: Number(res.lon),
          width: 50,
          height: 50
        }]
        let data = res
        let start = new Date(data.visit_start_time)
        let end = new Date(data.visit_end_time)
        if (start&&end&&end.getTime() > utils.getTime()){
          this.setData({
            isOpen: true
          })
        } else {
          this.setData({
            isOpen: false
          })
        }
        // if (data.s_image.indexOf('cdn.envedu.com.cn') === -1) {
        //   data.s_image = `http://47.113.99.76:200${data.s_image}`
        // }
				this.setData({ 
          detail: data,
          markers
        });
        
				wx.setNavigationBarTitle({
					title: res.title || "详情"
				});
				res.description && WxParse.wxParse("description", "html", res.description, this, 5);
				res.content && WxParse.wxParse("content", "html", res.content, this, 5);
			}
		});
  }
})