const app = getApp();
const utils = require("../../utils/util");
const api = require("../../utils/request.js");
const util = require("../../utils/util");
Page({
  data: {
    showCancle: false,
    info: {},
    orderId: '',
    visitTime: '',
    joinner: [],
    showall:false
  },
  id: null,
  loading: false,
  onLoad(option) {
    this.id = option.id;
    this.setData({
      orderId: option.id
    })
    utils.loginCB(this.getData, app);
  },
  toshowall() {
    this.setData({
      showall: !this.data.showall
    })
  },
  getData() {
    const data = {
      order_id: this.id
    }
    api.order_detail(data, app).then(res => {
      if(!Array.isArray(res))
      res = [res]
      // const startTime = res[0].start_time * 1000
      // const endTime = res[0].end_time * 1000
      // const start = `${utils.fullTimeParse(startTime).hours}:${utils.fullTimeParse(startTime).minutes}`
      // const end = `${utils.fullTimeParse(endTime).hours}:${utils.fullTimeParse(endTime).minutes}`
      // const time = `${utils.fullTimeParse(endTime).year}-${utils.fullTimeParse(endTime).month}-${utils.fullTimeParse(endTime).day}`
      const start=utils.timeParse2(res[0].start_time) 
      const end=utils.timeParse2(res[0].end_time) 
      let joinner = []
      for(let i = 0;i<res.length;i++){
        joinner.push({
          name: res[i].name,
          age: res[i].age,
          mobile: res[i].mobile,
          count: res[i].count,
          id_card: res[i].id_card
        })
      }
      this.setData({
        visitTime: `${start}`,
        info: res[0],
        joinner
      })
    })
  },
  openCancel() {
    this.setData({
      showCancle:true
    })
  },
  openedit() {
    wx.redirectTo({
      url: `/pages/order_update/order_update?id=${this.id}&kfd_id=${this.data.info.kfd_reserve_id}`,
    })
  },
  tapDialogButton(e) {
    if (e.detail.index === 0) {
      if (!this.loading) {
        const data = {
          order_id: this.id
        }
        this.loading = true
        api.order_cancel(data, app).then(res => {
          this.setData({
            showCancle:false
          })
          this.loading = false
          wx.navigateBack({delta:1})
        })
      }
    } else {
      this.setData({
        showCancle:false
      })
    }
  }
})