const api = require("../../utils/request.js");
const util = require("../../utils/util.js");
const app = getApp();
const utils = require('../../utils/util.js')
Component({
  properties: {
    item: {
      type: Object
    },
    iscollect: {
      type: Boolean,
      default: false
    }
  },
  data: {
    isOpen: false,
    visitTime: '',
    collect: false
  },
  myVideoContext: null,
  loading: false,
  ready() {
    let visitTime = ''
    let startTime = new Date(this.properties.item.visit_start_time)
    let endTime = new Date(this.properties.item.visit_end_time)

    if (startTime && endTime && util.getTime() <= endTime.getTime()) {
      // let startTime = this.properties.item.visit_start_time * 1000
      // let endTime = this.properties.item.visit_end_time * 1000
      // startTime = new Date(startTime)
      // endTime = new Date(endTime)

      if (utils.getObjDay().year == endTime.getFullYear() && utils.getObjDay().month == endTime.getMonth() + 1) {
        visitTime = `参观时间 ${utils.getObjDay().year}年${utils.getObjDay().month}月`
      } else {
        visitTime = `参观时间 ${utils.getObjDay().year}年${utils.getObjDay().month}月~${endTime.getFullYear()}年${endTime.getMonth() + 1}月`
      }
      // 如果结束时间是今年今月就只显示一个
      this.setData({
        isOpen: true
      })
    } else {
      this.setData({
        isOpen: false
      })
      visitTime = '暂未开放'
    }
    this.setData({
      visitTime,
      collect: this.properties.item.is_collect
    })
  },
  methods: {
    watchVideo(e) {
      let video = e.currentTarget.dataset.video
      wx.navigateTo({
        url: `/pages/open_video/open_video?src=${video}`,
      })
    },
    formatTime(time) {
      return time < 10 ? `0${time}` : time;
    },
    toDetail(target) {
      const that = this
      wx.getSetting({
        success(res) {
          if (!res.authSetting["scope.userInfo"])
            wx.redirectTo({
              url: `/pages/auth/auth_index?type=order&${that.properties.item.id}`,
            })
          else {
            if (that.data.isOpen) {
              wx.navigateTo({
                url: `/pages/order_detail/order_detail?id=${that.properties.item.id}`,
              })
            }
          }
        }
      })

    },
    toFacilities() {
        const that = this
        wx.navigateTo({
            url: `/pages/facility/facility_list?id=${that.properties.item.id}&title=${that.properties.item.title}`
        })
    },
    follow() {
      if (!this.loading) {
        if (!this.data.collect) {
          let data = {
            id: this.properties.item.id
          }
          this.loading = true
          api.reserve_collect(data, app).then(res => {
            if (this.properties.iscollect) {
              this.triggerEvent('reloadData')
            } else {
              this.setData({
                collect: true
              })
            }
            this.loading = false
          })
        } else {
          let data = {
            id: this.properties.item.id
          }
          this.loading = true
          api.reserve_collect_cancel(data, app).then(res => {
            if (this.properties.iscollect) {
              this.triggerEvent('reloadData')
            } else {
              this.setData({
                collect: false
              })
            }
            this.loading = false
          })
        }
      }
    }
  }
});