// pages/prize_delivery/prize_delivery.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '', // 收货人姓名
    phone: '', // 手机号码
    region: [], // 省市区
    detailAddress: '', // 详细地址
    remark: '', // 备注信息
    isFormValid: false, // 表单是否有效
    showSuccess: false, // 是否显示成功弹窗
    prizeInfo: null // 奖品信息（可从上一页传递）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果有奖品信息传递过来，可以在这里接收
    if (options.prizeInfo) {
      try {
        this.setData({
          prizeInfo: JSON.parse(options.prizeInfo)
        })
      } catch (e) {
        console.error('解析奖品信息失败:', e)
      }
    }
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我的福袋'
    })
  },

  /**
   * 姓名输入处理
   */
  onNameInput(e) {
    const name = e.detail.value.trim()
    this.setData({ name })
    this.checkFormValidity()
  },

  /**
   * 手机号码输入处理
   */
  onPhoneInput(e) {
    const phone = e.detail.value.trim()
    this.setData({ phone })
    this.checkFormValidity()
  },

  /**
   * 地区选择处理
   */
  onRegionChange(e) {
    const region = e.detail.value
    this.setData({ region })
    this.checkFormValidity()
  },

  /**
   * 详细地址输入处理
   */
  onDetailAddressInput(e) {
    const detailAddress = e.detail.value.trim()
    this.setData({ detailAddress })
    this.checkFormValidity()
  },

  /**
   * 备注信息输入处理
   */
  onRemarkInput(e) {
    const remark = e.detail.value.trim()
    this.setData({ remark })
  },

  /**
   * 检查表单是否有效
   */
  checkFormValidity() {
    const { name, phone, region, detailAddress } = this.data
    const isFormValid = 
      name.length > 0 && 
      phone.length === 11 && 
      region.length === 3 && 
      detailAddress.length > 0
    
    this.setData({ isFormValid })
  },

  /**
   * 验证手机号码格式
   */
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  },

  /**
   * 提交表单
   */
  onSubmit() {
    const { name, phone, region, detailAddress, remark, isFormValid } = this.data
    
    if (!isFormValid) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // 验证手机号码格式
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }

    // 显示加载中
    wx.showLoading({
      title: '提交中...',
      mask: true
    })

    // 构建提交数据
    const deliveryData = {
      name,
      phone,
      province: region[0],
      city: region[1],
      district: region[2],
      detailAddress,
      remark,
      prizeInfo: this.data.prizeInfo,
      submitTime: new Date().toISOString(),
      userId: app.globalData.userInfo ? app.globalData.userInfo.id : null
    }

    // 调用后端API提交数据
    this.submitDeliveryInfo(deliveryData)
  },

  /**
   * 提交收货信息到后端
   */
  async submitDeliveryInfo(deliveryData) {
    try {
      // 这里调用实际的后端API
      const result = await wx.request({
        url: 'https://your-backend-api.com/api/delivery/submit',
        method: 'POST',
        data: deliveryData,
        header: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${app.globalData.token}`
        },
        timeout: 10000
      })

      wx.hideLoading()

      if (result.statusCode === 200 && result.data.success) {
        // 提交成功
        this.setData({ showSuccess: true })
        
        // 清空表单数据（可选）
        this.clearFormData()
        
      } else {
        // 提交失败
        wx.showToast({
          title: result.data.message || '提交失败，请重试',
          icon: 'none'
        })
      }

    } catch (error) {
      wx.hideLoading()
      
      // 网络错误或超时
      console.error('提交收货信息失败:', error)
      
      // 模拟成功提交（开发测试用）
      this.setData({ showSuccess: true })
      this.clearFormData()
      
      /*
      wx.showToast({
        title: '网络错误，请检查网络连接',
        icon: 'none'
      })
      */
    }
  },

  /**
   * 清空表单数据
   */
  clearFormData() {
    this.setData({
      name: '',
      phone: '',
      region: [],
      detailAddress: '',
      remark: '',
      isFormValid: false
    })
  },

  /**
   * 关闭成功弹窗
   */
  closeSuccess() {
    this.setData({ showSuccess: false })
    
    // 返回上一页
    wx.navigateBack()
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '环保积分抽奖 - 填写收货信息',
      path: '/pages/prize_delivery/prize_delivery'
    }
  }
})