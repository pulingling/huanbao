const util = require("../../utils/util");
const utils = require("../../utils/util");
Component({
	properties: {
		item: {
      type: Object
    }
  },
  data:{
    visitTime: ''
  },
  ready() {
    // const startTime = this.properties.item.start_time * 1000
    // const endTime = this.properties.item.end_time * 1000
    // const startTime = this.properties.item.start_time.split('T')[0]
    // const endTime = this.properties.item.end_time.split('T')[0]
    // const start = `${utils.fullTimeParse(startTime).hours}:${utils.fullTimeParse(startTime).minutes}`
    // const end = `${utils.fullTimeParse(endTime).hours}:${utils.fullTimeParse(endTime).minutes}`
    // const time = `${utils.fullTimeParse(endTime).year}-${utils.fullTimeParse(endTime).month}-${utils.fullTimeParse(endTime).day}`
    const start= util.timeParse2(this.properties.item.start_time)
    const end= util.timeParse2(this.properties.item.end_time)
    let chooseDate = this.properties.item.choose_date
    let chooseTime = this.properties.item.choose_time
    this.setData({
      visitTime: chooseDate.split('T')[0]+'  '+ (chooseTime||'')
    })
  },
  methods: {
    formatTime(time) {
      return time < 10 ? `0${time}` : time;
    },
    toDetail() {
      wx.navigateTo({
        url: `/pages/order_info/order_info?id=${this.properties.item.order_id}`,
      })
    }
  }
});