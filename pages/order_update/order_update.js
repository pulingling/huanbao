const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
const phineReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
Page({
  data: {
    isAdd: false,
    isEdit: false,
    editIndex: 0,
    detail: {},
    tabShow: 1,
    showCalendar: false,
    chooseDate: '',
    visitRnage: '',
    joinner:[
      {
        name:'',
        age:'',
        mobile: ''
      }
    ],
    error: '',
    group:{
      name: '',
      group_name: '',
      count: '',
      office: '',
      mobile: '',
      id: ''
    },
    // 此处为日历自定义配置字段
    calendarConfig: {
      theme: 'elegant',
      defaultDay: '',
      disableMode: {  // 禁用某一天之前/之后的所有日期
        type: 'before',  // [‘before’, 'after']
      },
    }
  },
  id: null,
  kfd_id: null,
  personalLoading: false,
  groupLoading: false,
  onLoad(option) {
    this.id = option.id;
    this.kfd_id = option.kfd_id
    utils.loginCB(this.getData, app);
    this.getDetail()
  },
  toEdit(e) {
    this.setData({
      isAdd: true,
      isEdit: true,
      editIndex: e.target.dataset.index
    })
  },
  saveItem() {
    if (!this.data.joinner[this.data.editIndex].name) {
      this.setData({
        error: '请填写预约人姓名'
      })
      return
    }
    if (!this.data.joinner[this.data.editIndex].age) {
      this.setData({
        error: '请填写预约人年龄'
      })
      return
    }
    if (!this.data.joinner[this.data.editIndex].mobile) {
      this.setData({
        error: '请填写预约人电话'
      })
      return
    } else if (!phineReg.test(this.data.joinner[this.data.editIndex].mobile)) {
      this.setData({
        error: '手机号有误'
      })
      return
    }
    this.setData({
      isAdd: false,
      isEdit: false
    })
  },
  getData() {
    api.reserve_detail(this.kfd_id, app).then(res => {
      if (res) {
        this.setData({
          detail: res
        })
      }
    })
  },
  getDetail() {
    const data = {
      order_id: this.id
    }
    api.order_detail(data, app).then(res => {
      const tabShow = res.data[0].type
      const startTime = res.data[0].start_time * 1000
      const endTime = res.data[0].end_time * 1000
      const start = `${utils.fullTimeParse(startTime).hours}:${utils.fullTimeParse(startTime).minutes}`
      const end = `${utils.fullTimeParse(endTime).hours}:${utils.fullTimeParse(endTime).minutes}`
      const chooseDate = `${utils.fullTimeParse(endTime).year}-${utils.fullTimeParse(endTime).month}-${utils.fullTimeParse(endTime).day}`
      const visitRnage = `${start}~${end}`
      const calendarConfig = this.data.calendarConfig
      calendarConfig.defaultDay = chooseDate
      this.calendar.setCalendarConfig({
        defaultDay: this.data.chooseDate
      })
      if (tabShow === 1) {
        let joinner = []
        for (let i = 0; i<res.data.length;i++) {
          joinner.push({
            id: res.data[i].id,
            name: res.data[i].name,
            age: res.data[i].age,
            mobile: res.data[i].mobile
          })
        }
        this.setData({
          tabShow,
          chooseDate,
          visitRnage,
          joinner,
          calendarConfig
        })
      } else if (tabShow === 2) {
        const group = {
          id: res.data[0].id,
          name: res.data[0].name,
          group_name: res.data[0].group_name,
          count: res.data[0].count,
          office: res.data[0].office,
          mobile: res.data[0].mobile
        }
        this.setData({
          tabShow,
          chooseDate,
          visitRnage,
          group,
          calendarConfig
        })
      }
    })
  },
  closeJoiner(e) {
    let joinner = this.data.joinner
    joinner.splice(e.target.dataset.index,1)
    this.setData({
      joinner
    })
  },
  openCalender() {
    // 指定可选时间区域
    const startTime = utils.formatDate(this.data.detail.visit_start_time * 1000)
    const endTime = utils.formatDate(this.data.detail.visit_end_time * 1000)
    
    this.calendar.enableArea([startTime, endTime]);
    this.calendar.setCalendarConfig({
      defaultDay: this.data.chooseDate
    })
    this.setData({
      showCalendar:true
    })
  },
  toOrder() {
    if (!this.personalLoading) {
      for(let i = 0;i < this.data.joinner.length; i++) {
        if(!this.data.joinner[i].name || !this.data.joinner[i].age || !this.data.joinner[i].mobile){
          this.setData({
            error: '请完善表格'
          })
          return
        } else if(!phineReg.test(this.data.joinner[i].mobile)) {
          this.setData({
            error: `第${i+1}人手机号有误`
          })
          return
        }
      }
      if (!this.data.chooseDate) {
        this.setData({
          error: '请选择预约时间'
        })
        return
      }
      let time = this.data.visitRnage
      time = time.split('~')
      let startTime = this.data.chooseDate + ' ' + time[0]
      startTime = new Date(startTime.replace(/-/g,'/'))
      startTime = startTime.getTime()
      let endTime = this.data.chooseDate + ' ' + time[1]
      endTime = new Date(endTime.replace(/-/g,'/'))
      endTime = endTime.getTime()
      let data = {
        start_time: parseInt(startTime/1000),
        end_time: parseInt(endTime/1000)
      }
      let arr = []
      for (let i = 0;i<this.data.joinner.length;i++) {
        arr.push({
          id: this.data.joinner[i].id,
          name: this.data.joinner[i].name,
          age: this.data.joinner[i].age,
          mobile: this.data.joinner[i].mobile,
          start_time: data.start_time,
          end_time: data.end_time
        })
      }
      let params = {
        data: arr
      }
      this.personalLoading = true
      api.order_update(params,app).then(res => {
        wx.navigateTo({
          url: '/pages/order/order',
        })
        this.personalLoading = false
      })
    }
  },
  groupOrder() {
    if (!this.groupLoading) {
      let data = this.data.group
      if (!data.name || !data.group_name || !data.count || !data.office || !data.mobile || !this.data.chooseDate ) {
        this.setData({
          error: '请完善表格'
        })
        return
      }
      if (!phineReg.test(data.mobile)) {
        this.setData({
          error: '手机号填写有误'
        })
        return
      }
      let time = this.data.visitRnage
      time = time.split('~')
      let startTime = this.data.chooseDate + ' ' + time[0]
      startTime = new Date(startTime.replace(/-/g,'/'))
      startTime = startTime.getTime()
      let endTime = this.data.chooseDate + ' ' + time[1]
      endTime = new Date(endTime.replace(/-/g,'/'))
      endTime = endTime.getTime()
      data.start_time = parseInt(startTime/1000)
      data.end_time = parseInt(endTime/1000)
      const params = {
        data: [data]
      }
      this.groupLoading = true
      api.order_update(params,app).then(res => {
        wx.navigateTo({
          url: '/pages/order/order',
        })
        this.groupLoading = false
      })
    }
  },
  inputPhone(e) {
    let joinner = this.data.joinner
    let index = this.data.editIndex
    joinner[index].mobile = e.detail && e.detail.value
    this.setData({joinner})
  },
  inputName(e) {
    let joinner = this.data.joinner
    let index = this.data.editIndex
    joinner[index].name = e.detail && e.detail.value
    this.setData({joinner})
  },
  groupOfName(e) {
    let group = this.data.group
    group.group_name = e.detail && e.detail.value
    this.setData({group})
  },
  groupNum(e) {
    let group = this.data.group
    group.count = e.detail && e.detail.value
    this.setData({group})
  },
  groupName(e) {
    let group = this.data.group
    group.name = e.detail && e.detail.value
    this.setData({group})
  },
  groupOffice(e) {
    let group = this.data.group
    group.office = e.detail && e.detail.value
    this.setData({group})
  },
  groupPhone(e) {
    let group = this.data.group
    group.mobile = e.detail && e.detail.value
    this.setData({group})
  },
  bindPickerChange(e) {
    this.setData({
      visitRnage: this.data.detail.visit_zone[e.detail.value]
    })
  },
  inputAge(e) {
    let joinner = this.data.joinner
    let index = this.data.editIndex
    joinner[index].age = e.detail && e.detail.value
    this.setData({joinner})
  },
  tapDialogButton(e) {
    if (e.detail.index === 1) {
      if (this.calendar.getSelectedDay().length>0) {
        let chooseDate = this.calendar.getSelectedDay()
        chooseDate = chooseDate[0]
        chooseDate = `${chooseDate.year}-${chooseDate.month >= 10 ? chooseDate.month : '0'+chooseDate.month}-${chooseDate.date >= 10 ? chooseDate.date : '0'+chooseDate.date}`
        this.setData({
          chooseDate ,
          showCalendar: false
        })
      } else {
        this.setData({
          error: '请选择一个预约时间'
        })
      }
    } else {
      this.setData({
        showCalendar: false
      })
    }
  },
  addjoiner() {
    if (this.data.joinner.length < 3 ) {
      let joinner = this.data.joinner
      joinner.push({
        name: '',
        age: '',
        mobile: ''
      })
      this.setData({
        joinner
      })
    } else {
      this.setData({
        error: '个人预约人数不能超过3人'
      })
    }
  },
  delItem() {
    let joinner = this.data.joinner
    joinner.splice(this.data.editIndex,1)
    this.setData({
      joinner,
      isAdd: false,
      isEdit: false
    })
  }
})