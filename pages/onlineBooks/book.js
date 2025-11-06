// pages/onlineBooks/book.js
const app = getApp()
const api = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemInfo: {},
    book: [],
    stopChange: false,
    current: 0,
    changeProgress: 100,
    anchorDirection: 'right',
    change: false,
    bookContainerSize:'height:100%;width:100%;',
    touchInfo: {
      screenHeight: 540,
      screenWidth: 960,
      startX: null,
      startY: null,
      screenRatio: 2,
    },
    next: 1,
    cornerInfo: {
      hp: 0,
      width: 618,
      height: 750,
      scale: 0
    },
    clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)',
    invalidTouches:[]
  },


  changeStart(e) {
    const touch = e.touches
    if (touch.length > 1) {
      
      const invalidTouches = e.touches.map(item=>{
        return item.identifier
      })
      this.setData({
        invalidTouches
      })
      return false
    }
    const touchInfo = this.data.touchInfo
    touchInfo.startX = touch[0].clientX
    touchInfo.startY = touch[0].clientY
    this.setData({
      touchInfo,
      invalidTouches:[]
    })
  },

  changeMove(e) {
    if (this.data.stopChange) {
      return false
    }
    if (this.data.invalidTouches.some(item=>{
      return item = e.changedTouches[0].identifier
    })){
      return false
    }
    const touchInfo = this.data.touchInfo
    const dif = touchInfo.startX - e.touches[0].clientX
    const anchorDirection = dif < 0 ? 'right' : 'left'
    let next = this.data.next
    if (anchorDirection == 'left') {
      next = this.data.current + 1
    } else {
      next = this.data.current - 1
    }
    if (next < 0) {
      return false
    }

    let cornerInfo = {}
    let clipPath = ''
    let out = {cornerInfo:{},clipPath:''}
    if (anchorDirection == 'left') {
      out = this.turnLeft(dif)
    }else{
      out = this.turnRight(dif)
    }
    cornerInfo = out.cornerInfo
    clipPath = out.clipPath
    this.setData({
      anchorDirection,
      next,
      cornerInfo,
      clipPath
    })
  },

  turnLeft(dif) {
    const cornerInfo = this.data.cornerInfo
    let clipPath = this.data.clipPath
    const touchInfo = this.data.touchInfo
    const cornerThreshold = 530 / 750 * touchInfo.screenHeight

    if (Math.abs(dif) < cornerThreshold) {
      cornerInfo.scale = Math.abs(dif) / cornerThreshold
      cornerInfo.hp = -cornerInfo.scale * 2.5
      clipPath = `polygon(0 0,100% 0,100% ${(1-cornerInfo.scale)*100}%,${(touchInfo.screenHeight*1920/1080-225/750*touchInfo.screenHeight*cornerInfo.scale)/touchInfo.screenHeight/1920*1080*100}% 100%,0 100%)`
    } else {
      cornerInfo.scale = 1
      cornerInfo.hp = (-2.5 + Math.abs((dif - cornerThreshold) / touchInfo.screenHeight/1920*1080) * 100)
      clipPath = `polygon(0 0,${100 - Math.abs((dif - cornerThreshold) / touchInfo.screenHeight/1920*1080) * 100}% 0,${100 - Math.abs((dif - cornerThreshold) / touchInfo.screenHeight/1920*1080) * 100 - 225/750*touchInfo.screenHeight/touchInfo.screenHeight/1920*1080*100}% 100%,0 100%)`
    }

    return {
      cornerInfo,
      clipPath
    }
  },

  turnRight(dif) {
    const cornerInfo = this.data.cornerInfo
    let clipPath = this.data.clipPath
    const touchInfo = this.data.touchInfo
    const cornerThreshold = 530 / 750 * touchInfo.screenHeight
    if (Math.abs(dif) < cornerThreshold) {
      cornerInfo.scale = Math.abs(dif) / cornerThreshold
      cornerInfo.hp = -cornerInfo.scale * 2.5
      clipPath = `polygon(0 0,100% 0,100% 100%,${(225/750*touchInfo.screenHeight*cornerInfo.scale)/touchInfo.screenHeight/1920*1080*100}% 100%,0 ${(1-cornerInfo.scale)*100}%)`
    } else {
      cornerInfo.scale = 1
      cornerInfo.hp = (-2.5 + Math.abs((Math.abs(dif) - cornerThreshold) / touchInfo.screenHeight/1920*1080) * 100)
      clipPath = `polygon(${Math.abs((Math.abs(dif) - cornerThreshold) / touchInfo.screenHeight/1920*1080) * 100}% 0,100% 0, 100% 100%, ${Math.abs((Math.abs(dif) - cornerThreshold) / touchInfo.screenHeight/1920*1080) * 100 + 225/750*touchInfo.screenHeight/touchInfo.screenHeight/1920*1080*100}% 100%)`
    }

    return {
      cornerInfo,
      clipPath
    }
  },

  changeEnd(e) {
    if (this.data.invalidTouches.some(item=>{
      return item = e.changedTouches[0].identifier
    })){
      return false
    }

    let current = this.data.current
    if (this.data.anchorDirection === 'left') {
      current += 1
    }
    if (this.data.anchorDirection === 'right') {
      current -= 1
    }
    const cornerInfo = this.data.cornerInfo
    cornerInfo.scale = 0
    cornerInfo.hp = 0
    const clipPath = 'polygon(0 0,100% 0,100% 100%,0 100%)'
    if (current >= 0 && current < this.data.book.length && Math.abs(e.changedTouches[0].clientX - this.data.touchInfo.startX) > 150) {
      this.audio.stop()
      this.audio.play()
      this.setData({
        current,
        cornerInfo,
        clipPath
      })
    } else {
      this.setData({
        cornerInfo,
        clipPath
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id
    this.init(id)
  },
  init(id) {
    //1. 请求图书
    api.getBookDetail({id},app).then(res=>{
      this.setData({
        book:res.body.content_pics
      })
    })
    //2. 查找是否该图书有本地读书记录
    const bookRecord = wx.getStorageSync('bookRecord')
    if (bookRecord && bookRecord[id]) {
      this.setData({
        current: bookRecord[id]
      })
    } else {
      wx.setStorageSync('bookRecord', {
        id: 0
      })
    }

    //3. 获取屏幕尺寸大小
    wx.getSystemInfo({
      success: (systemInfo) => {
        console.log(systemInfo)
        const touchInfo = this.data.touchInfo
        //将screenWidth转换为750rpx,然后计算screenHeight
        touchInfo.screenHeight = systemInfo.screenHeight / systemInfo.screenWidth * 750
        touchInfo.screenWidth = 750
        touchInfo.screenRatio = systemInfo.pixelRatio
        //4. 设置cornerInfo
        const cornerInfo = this.data.cornerInfo
        cornerInfo.height = touchInfo.screenHeight
        cornerInfo.width = touchInfo.screenHeight * 618 / 750 
        //4. 设置BookContainer的高宽
        const bookContainerSize = `height:${touchInfo.screenHeight}rpx;width:${touchInfo.screenHeight*1920/1080}rpx`
        console.log(bookContainerSize)
        this.setData({
          systemInfo,
          touchInfo,
          cornerInfo,
          bookContainerSize
        })
      }
    })
    //5. 加载audio组件
    this.audio = wx.createInnerAudioContext({useWebAudioImplement:true})
    this.audio.src='https://sthjxjzx.oss-cn-chengdu.aliyuncs.com/images/book/turnPage2.mp3'
    console.log(this.audio)
  },

  back() {
    const pages = getCurrentPages()
    if (pages && pages.length < 2) {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
    wx.navigateBack({
      delta: -2,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onScale(e) {
    const scale = e.detail.scale
    if (scale > 1) {
      this.setData({
        stopChange: true
      })
    } else {
      this.setData({
        stopChange: false
      })
    }
  },
  stopChange(e) {
    if (this.data.stopChange) {
      return false
    } else {
      return true
    }
  },
})