const utils = require("../../utils/util");
const api = require("../../utils/request.js");
const app = getApp();
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    score: {
      type: Number,
      value: 0
    },
    time: {
      type: String,
      value: ''
    },
    id: {
      type: Number,
      value: 0
    },
    type: {
      type: Number,
      value: 0
    },
    link: {
      type: String,
      value: ''
    },
    history_id: {
      type: Number,
      value: 0
    }
  },
  data: {
    dateTime: '',
    shareText: '',
    qr: '',
    img: '',
    savedImgUrl: ''
  },
  methods: {
    sharepyq() {
      this.triggerEvent('openShare', )
    },
    jump() {
      if (this.properties.type === 1) {
        wx.navigateTo({
          url: `/pages/video_page/video_page?id=${this.properties.history_id}&type=0`,
        })
      } else if (this.properties.type === 2) {
        wx.navigateTo({
          url: `/pages/open_detail/open_detail?id=${this.properties.history_id}`,
        })
      } else {
        wx.navigateTo({
          url: `/pages/out/out?link=${this.properties.link}`,
        })
      }
    },
    shareTo() {
      this.getInfo()
    },
    close() {
      this.triggerEvent('up', {
        img: this.data.img,
        qr: this.data.qr,
        shareText: this.data.shareText,
        score: this.data.score,
        show: false
      })
    },
    getInfo() {
      if (this.properties.type === 1) {
        api.course(this.properties.history_id, app).then(res => {
          this.setData({
            img: res.s_image,
            qr: res.qr_code?'data:image/jpg;base64,' + res.qr_code:''
          })
          this.triggerEvent('up', {
            img: this.data.img,
            qr: this.data.qr,
            shareText: this.data.shareText,
            score: this.data.score,
            show: true,
            type: this.properties.type
          })
        })
      } else if (this.properties.type === 2) {
        api.reserve_detail(this.properties.history_id, app).then(res2 => {
          this.setData({
            img: res2.s_image,
          })
          this.setData({
            qr: res2.qr_code?'data:image/jpg;base64,' + res2.qr_code:''
          })
          this.triggerEvent('up', {
            img: this.data.img,
            qr: this.data.qr,
            shareText: this.data.shareText,
            score: this.data.score,
            show: true,
            type: this.properties.type
          })
        })
      } else {
        api.activity(this.properties.history_id, app).then(res => {
          // 
          this.setData({
            img: res.img,
            qr: res.qr_code?'data:image/jpg;base64,' + res.qr_code:''
          })
          this.triggerEvent('up', {
            img: this.data.img,
            qr: this.data.qr,
            shareText: this.data.shareText,
            score: this.data.score,
            show: true,
            type: this.properties.type
          })
        })
      }
    }
  },
  attached() {
    this.setData({
      dateTime: utils.timeParse2(this.properties.time)
    })
    if (this.properties.type === 1) {
      this.setData({
        shareText: '我学习了' + this.properties.title.slice(2, this.properties.title.length)
      })
    } else if (this.properties.type === 2) {
      this.setData({
        shareText: '我参观了' + this.properties.title.slice(2, this.properties.title.length)
      })
    } else {
      this.setData({
        shareText: '我参加了' + this.properties.title.slice(2, this.properties.title.length)
      })
    }
  }
});