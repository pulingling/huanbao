// pages/prize_delivery/prize_delivery.js
const app = getApp()
const pointsTracker = require("../../utils/points.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '', // 收货人姓名
    phone: '', // 手机号码
    email: '', // 手机号码
    region: [], // 省市区
    detailAddress: '', // 详细地址
    remark: '', // 备注信息
    from: '',
    today: '',
    isFormValid: false, // 表单是否有效
    showSuccess: false, // 是否显示成功弹窗
    prizeInfo: null, // 奖品信息（可从上一页传递）
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    const now = new Date();
    const month = now.getMonth() + 1; // 月份需要加1
    const day = now.getDate();
    this.setData({
      from: options.from ? options.from : '',
      today: `${month}${day}`,
    })
    // 如果有奖品信息传递过来，可以在这里接收
    this.loadPrize()
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我的福袋'
    })
  },

  async loadPrize() {
    wx.request({
        url: `${pointsTracker.pointsApiBase}/prize/mine`,
        method: 'GET',
        data: { access_token: wx.getStorageSync('pointsToken') },
        timeout: 10000,
        success: (response) => {
          if(response.statusCode !== 200 || !response.data) {
            wx.showToast({
              title: '获取中奖信息失败',
              icon: 'none'
            });
            return;
          }
          console.log(response.data.data[0]);
          this.setData({ 
            loading: false,
            prizeInfo: response.data.data.length > 0 ? response.data.data[0] : null,
          });
          
        },
        fail: (error) => {
          console.error('获取中奖信息失败:', error);
          wx.showToast({
            title: '获取中奖信息失败',
            icon: 'none'
          });
        }
    });
  },

  /**
   * 姓名输入处理
   */
  onNameInput(e) {
    const name = e.detail.value.trim()
    this.setData({ name })
    this.checkFormValidity()
  },

  onEmailInput(e) {
    const email = e.detail.value.trim()
    this.setData({ email })
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
    const { name, phone, region, detailAddress, email, prizeInfo } = this.data
    if(prizeInfo.prize_type == 2) {

      const isFormValid = 
        name.length > 0 && 
        phone.length === 11 && 
        email.length > 0
      
      this.setData({ isFormValid })
    } else {
      const isFormValid = 
        name.length > 0 && 
        phone.length === 11 && 
        region.length === 3 && 
        detailAddress.length > 0
      
      this.setData({ isFormValid })
    }
    
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
    this.checkFormValidity();
    const { name, phone, region, detailAddress, remark, isFormValid, email, prizeInfo } = this.data
    
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

    // const deliveryData = {
    //   name,
    //   phone,
    // }
    let address = "";
    if(prizeInfo.prize_type == 2) {
      address = `${name} ${phone} ${email}`
    } else {
      address = `${name} ${phone} ${region[0]}${region[1]}${region[2]}${detailAddress}`
    }


    // 调用后端API提交数据
    this.submitDeliveryInfo(address, prizeInfo.id)
  },

  /**
   * 提交收货信息到后端
   */
  async submitDeliveryInfo(address, prizeId) {

    wx.request({
      url: `${pointsTracker.pointsApiBase}/prize/address`,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: { id: prizeId, address, access_token: wx.getStorageSync('pointsToken') },
      timeout: 10000,
      success: (response) => {
        wx.hideLoading()
        if(response.statusCode !== 200 || !response.data || response.data.error_code != 0) {
          wx.showToast({
            title: '提交信息失败',
            icon: 'none'
          });
          return;
        }
        
        // 提交成功
        this.setData({ showSuccess: true })
        
        // 清空表单数据（可选）
        this.clearFormData()
      },
      fail: (error) => {
        wx.hideLoading()
        console.error('提交信息失败:', error);
        wx.showToast({
          title: '提交信息失败',
          icon: 'none'
        });
      }
  });
  },

  /**
   * 清空表单数据
   */
  clearFormData() {
    this.setData({
      name: '',
      phone: '',
      email: '',
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