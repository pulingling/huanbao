const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");
const phineReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
Page({
  data: {
    ordersuccess: false,
    isAdd: false,
    isEdit: false,
    editIndex: 0,
    Personloading: false,
    groupLoading: false,
    detail: {},
    tabShow: 1,
    showCalendar: false,
    chooseDate: '',
    visitRnage: '',
    groupStartTime: '',
    groupEndTime: '',
    joinner: [],
    joinPerson: {
      name: '',
      id_card: ''
    },
    person: {
      name: '',
      mobile: '',
      count: 1,
      id_card: ''
    },
    // 可预约人数
    personArray: ['一', '二', '三', '四', '五'],
    error: '',
    group: {
      name: '',
      group_name: '',
      count: '',
      // office: '',
      mobile: '',
      id_card: ''
    },
    // 此处为日历自定义配置字段
    calendarConfig: {
      theme: 'elegant',
      onlyShowCurrentMonth: true,
      disableMode: { // 禁用某一天之前/之后的所有日期
        // type: 'before', // [‘before’, 'after']
      },
    }
  },
  id: null,
  onLoad(option) {
    this.id = option.id;
    this.showCalendar = false
    utils.loginCB(this.getData, app);
  },
  countChange(e) {
    let person = this.data.person
    person.count = e.detail && e.detail.value
    this.setData({
      person
    })
  },
  startTimeChange(e) {
    this.setData({
      groupStartTime: e.detail.value
    })
  },
  endTimeChange(e) {
    this.setData({
      groupEndTime: e.detail.value
    })
  },
  getData() {
    api.reserve_detail(this.id, app).then(res => {
      if (res) {
        res.visit_zone = res.visit_zone.map(item => item.zone)
        this.setData({
          detail: res,
          visitRnage: res.visit_zone[0]
        })
      }
    })
  },
  openCalender() {
    // 指定可选时间区域
    this.setData({
      showCalendar: true
    })
    if (this.data.tabShow === 1) {
      
    }
  },
  afterCalendarRender(e) {
    // const startTime = utils.timeParse2(this.data.detail.visit_start_time)
    // const endTime = utils.timeParse2(this.data.detail.visit_end_time)
    // this.calendar.enableArea([startTime, endTime]);
    const enableDates = []
    const toSet = []
    // 可选日期数组,在今天之后的才能选
    this.data.detail['visit_date'].forEach(
      item => {
        if (item+60*60*24*1000 >= utils.getTime())
          enableDates.push(utils.timeParse4(item))
        toSet.push(utils.getObjDay(item))
      })
    
    
    const date = new Date(enableDates[0])
    this.calendar.setDateStyle(toSet); // 改变可选日期样式
    this.calendar.jump(date.getFullYear(), date.getMonth() + 1); // 跳转第一个开放日期在的月份
    
    this.calendar.enableDays(enableDates)
  },
  toOrder() {
    if (!this.data.Personloading) {
      for (let i = 0; i < this.data.joinner.length; i++) {
        if (!this.data.joinner[i].name || !this.data.joinner[i].age || !this.data.joinner[i].mobile) {
          this.setData({
            error: '请完善表格'
          })
          return
        } else if (!phineReg.test(this.data.joinner[i].mobile)) {
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
      let time = this.data.visitRnage[0]?this.data.visitRnage[0]:this.data.visitRnage
      time = time.split('~')
      let startTime = this.data.chooseDate + ' ' + time[0]
      
      startTime = new Date(startTime.replace(/-/g, '/'))
      startTime = startTime.getTime()
      let endTime = this.data.chooseDate + ' ' + time[1]
      endTime = new Date(endTime.replace(/-/g, '/'))
      endTime = endTime.getTime()
      let data = {
        kfd_reserve_id: Number(this.id),
        type: 1,
        start_time: parseInt(startTime / 1000),
        end_time: parseInt(endTime / 1000),
        person: this.data.joinner,
        choose_date: this.data.chooseDate,
        choose_time: this.data.visitRnage
      }
      this.setData({
        Personloading: true
      })
      api.reserve_add(data, app).then(res => {
        if (res.code && res.code === 106) {
          this.setData({
            Personloading: false,
            ordersuccess: 'black'
          })
        } else {
          this.setData({
            Personloading: false,
            ordersuccess: true
          })
        }
      }).catch(() => {})
    }
  },
  toPersonOrder() {
    if (!this.data.Personloading) {
      const data = this.data.person
      data.mobile = Number(data.mobile)
      if (!data.name || !data.mobile || !data.id_card) {
        this.setData({
          error: '请完善预约信息'
        })
        return
      }
      if (!this.data.chooseDate) {
        this.setData({
          error: '请选择预约时间'
        })
        return
      }
      if (!idCardReg.test(data.id_card)) {
        this.setData({
          error: '身份证号填写有误'
        })
        return
      }
      if (!phineReg.test(data.mobile)) {
        this.setData({
          error: '手机号填写有误'
        })
        return
      }
      if (this.data.joinner.length > 0) {
        // data.person_list = []
        // for (let i = 0; i < this.data.joinner.length; i++) {
        //   data.count += 1
        //   data.person_list.push(this.data.joinner[i])
        // }
        data.count = data.count + this.data.joinner.length 
      }
      let time = this.data.visitRnage[0]?this.data.visitRnage[0]:this.data.visitRnage
      time = time.split('~')
      let startTime = this.data.chooseDate + ' ' + time[0]
      startTime = new Date(startTime.replace(/-/g, '/'))
      startTime = startTime.getTime()
      let endTime = this.data.chooseDate + ' ' + time[1]
      endTime = new Date(endTime.replace(/-/g, '/'))
      endTime = endTime.getTime()
      data.start_time = parseInt(startTime / 1000)
      data.end_time = parseInt(endTime / 1000)
      data.kfd_reserve_id = Number(this.id)
      data.type = 1
      data.title = this.data.detail.title
      data['choose_date'] = this.data.chooseDate
      data['choose_time'] = this.data.visitRnage
      this.setData({
        Personloading: true
      })
      api.reserve_add(data, app).then(res => {
        if (res.code && res.code === 106) {
          this.setData({
            Personloading: false,
            ordersuccess: 'black'
          })
        } else {
          this.setData({
            Personloading: false,
            ordersuccess: true
          })
        }
      }).catch(() => {})
    }
  },
  groupOrder() {
    if (!this.data.groupLoading) {
      const data = this.data.group
      data.mobile = Number(data.mobile)
      if (!data.name || !data.group_name || !data.count || !data.mobile || !data.id_card) {
        this.setData({
          error: '请完善预约信息'
        })
        return
      }
      if (!this.data.chooseDate) {
        this.setData({
          error: '请选择预约时间'
        })
        return
      }
      if (!idCardReg.test(data.id_card)) {
        this.setData({
          error: '身份证号填写有误'
        })
        return
      }
      if (!phineReg.test(data.mobile)) {
        this.setData({
          error: '手机号填写有误'
        })
        return
      }
      data.kfd_reserve_id = Number(this.id)
      data.type = 2
      this.data.visitRnage = this.data.groupStartTime + '~' + this.data.groupEndTime
      
      // let startTime = this.data.chooseDate + ' ' + this.data.groupStartTime
      // startTime = new Date(startTime.replace(/-/g, '/'))
      // startTime = startTime.getTime()
      // let endTime = this.data.chooseDate + ' ' + this.data.groupEndTime
      // endTime = new Date(endTime.replace(/-/g, '/'))
      // endTime = endTime.getTime()
      // data.start_time = parseInt(startTime / 1000)
      // data.end_time = parseInt(endTime / 1000)
      data.title = this.data.detail.title
      data['choose_date'] = this.data.chooseDate
      data['choose_time'] = this.data.visitRnage
      this.setData({
        groupLoading: true
      })
      
      api.reserve_add(data, app).then(res => {
        if (res.code && res.code === 106) {
          this.setData({
            Personloading: false,
            ordersuccess: 'black'
          })
        } else {
          this.setData({
            Personloading: false,
            ordersuccess: true
          })
        }
      }).catch(() => {})
    }
  },
  bindUserInput(e) {
    let person = this.data.person
    let key = e.currentTarget.dataset.key
    person[key] = e.detail && e.detail.value
    this.setData({
      person
    })
  },
  inputPhone(e) {
    let joinPerson = this.data.joinPerson
    joinPerson.id_card = e.detail && e.detail.value
    this.setData({
      joinPerson
    })
  },
  inputName(e) {
    let joinPerson = this.data.joinPerson
    joinPerson.name = e.detail && e.detail.value
    this.setData({
      joinPerson
    })
  },
  groupOfName(e) {
    let group = this.data.group
    group.group_name = e.detail && e.detail.value
    this.setData({
      group
    })
  },
  groupNum(e) {
    let group = this.data.group
    group.count = e.detail && e.detail.value
    this.setData({
      group
    })
  },
  groupName(e) {
    let group = this.data.group
    group.name = e.detail && e.detail.value
    this.setData({
      group
    })
  },
  groupOffice(e) {
    let group = this.data.group
    group.office = e.detail && e.detail.value
    this.setData({
      group
    })
  },
  groupidCard(e) {
    let group = this.data.group
    group.id_card = e.detail && e.detail.value
    this.setData({
      group
    })
  },
  groupPhone(e) {
    let group = this.data.group
    group.mobile = e.detail && e.detail.value
    group.mobile = Number(group.mobile)
    this.setData({
      group
    })
  },
  bindPickerChange(e) {
    this.setData({
      visitRnage: this.data.detail.visit_zone[e.detail.value]
    })
  },
  inputAge(e) {
    let joinPerson = this.data.joinPerson
    joinPerson.age = e.detail && e.detail.value
    this.setData({
      joinPerson
    })
  },
  ordertapDialogButton(e) {
    if (e.detail.index === 0) {
      wx.redirectTo({
        url: '/pages/order/order',
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },
  closeCalendar() {
    
    this.setData({
      showCalendar: false
    })
  },
  confirmCalendar() {
    if (this.data.tabShow === 2) {
      if (!this.data.groupEndTime || !this.data.groupStartTime) {
        this.setData({
          error: '请选择开始结束时间'
        })
        return
      }
      if (this.data.groupEndTime <= this.data.groupStartTime) {
        this.setData({
          error: '结束时间必须大于开始时间'
        })
        return
      }
    }
    if (this.calendar.getSelectedDay().length > 0) {
      let chooseDate = this.calendar.getSelectedDay()
      chooseDate = chooseDate[0]
      chooseDate = `${chooseDate.year}-${chooseDate.month >= 10 ? chooseDate.month : '0'+chooseDate.month}-${chooseDate.date >= 10 ? chooseDate.date : '0'+chooseDate.date}`
      this.setData({
        chooseDate,
        showCalendar: false
      })
    } else {
      this.setData({
        error: '请选择一个预约时间'
      })
    }
  },
  delItem() {
    let joinner = this.data.joinner
    joinner.splice(this.data.editIndex, 1)
    this.setData({
      joinner,
      isAdd: false,
      isEdit: false
    })
  },
  close() {
    this.setData({
      isAdd: false,
      isEdit: false
    })
  },
  toEdit(e) {
    const joinner = this.data.joinner[e.target.dataset.index]
    const joinPerson = {
      name: joinner.name,
      id_card: joinner.id_card
    }
    this.setData({
      isAdd: true,
      isEdit: true,
      editIndex: e.target.dataset.index,
      joinPerson
    })
  },
  saveItem() {
    if (!this.data.joinPerson.name) {
      this.setData({
        error: '请填写预约人姓名'
      })
      return
    }
    if (!this.data.joinPerson.id_card) {
      this.setData({
        error: '请填写预约人身份证号'
      })
      return
    } else {
      if (!idCardReg.test(this.data.joinPerson.id_card)) {
        this.setData({
          error: '身份证号填写有误'
        })
        return
      }
    }
    if (this.data.isEdit) {
      let joinner = this.data.joinner
      joinner[this.data.editIndex].name = this.data.joinPerson.name
      joinner[this.data.editIndex].id_card = this.data.joinPerson.id_card
      this.setData({
        joinner
      })
    } else {
      let joinner = this.data.joinner
      joinner.push(this.data.joinPerson)
      this.setData({
        joinner
      })
    }
    this.setData({
      isAdd: false,
      isEdit: false
    })
  },
  addjoiner() {
    if (this.data.joinner.length < 5) {
      const joinPerson = {
        name: '',
        id_card: ''
      }
      let length = this.data.joinner.length
      this.setData({
        joinPerson
      })
      this.setData({
        isAdd: true,
        isEdit: false,
        editIndex: length
      })
    } else {
      this.setData({
        error: '个人预约人数不能超过5人'
      })
    }
  },
  handleTab(e) {
    if (e.target.dataset.id) {
      const id = e.target.dataset.id - 0;
      if (id !== this.data.tabShow) {
        this.setData({
          tabShow: id
        });
      }
    }
  },
  chooseTime(e) {
    if (e.target.dataset.time) {
      const time = e.target.dataset.time;
      if (time !== this.data.visitRnage) {
        this.setData({
          visitRnage: time
        });
      }
    }
  },
  closeJoiner(e) {
    let joinner = this.data.joinner
    joinner.splice(e.target.dataset.index, 1)
    this.setData({
      joinner
    })
  }
})