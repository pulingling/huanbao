// pages/lottery/lottery.js
const app = getApp()
const pointsTracker = require("../../utils/points.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userPoints: 0, // 用户当前积分
    todayLotteryCount: 0, // 今日抽奖次数
    maxLotteryCount: 1, // 每日最大抽奖次数（根据新规则改为1次）
    lotteryPointsCost: 500, // 每次抽奖消耗积分（根据新规则设为500积分）
    isSpinning: false, // 是否正在抽奖
    wheelRotation: 0, // 转盘旋转角度
    prizes: [], // 奖品数据（将在onLoad中初始化）
    currentPrize: null, // 当前中奖结果
    showResult: false, // 是否显示中奖结果
    loading: false,
    lotteryImg: '',
  },

  /**
   * 生成Canvas转盘数据并绘制转盘
   */
  generateCanvasWheelData() {
    const prizes = [
      { id: 1, name: '京东专享图书品类卡50面值电子卡', image: '/assets/imgs/JD_Book.png', probability: 0.01, points: 0, color: '#ffffff' },
      { id: 5, name: '50积分', image: '/assets/imgs/Points.png', probability: 0.18, points: 0, color: '#8BC34A' },
      { id: 2, name: '桌面绿植', image: '/assets/imgs/Green_plant.png', probability: 0.02, points: 0, color: '#ffffff' },
      { id: -1, name: '谢谢参与', image: '/assets/imgs/Thanks.png', probability: 0.27, points: 0, color: '#8BC34A' },
      { id: 4, name: '软木麦秸中性笔2支装', image: '/assets/imgs/Pen.png', probability: 0.02, points: 0, color: '#ffffff' },
      { id: 5, name: '50积分', image: '/assets/imgs/Points.png', probability: 0.19, points: 50, color: '#8BC34A' },
      { id: 3, name: '青桔单车月卡', image: '/assets/imgs/Bike.png', probability: 0.03, points: 0, color: '#ffffff' },
      { id: -1, name: '谢谢参与', image: '/assets/imgs/Thanks.png', probability: 0.28, points: 0, color: '#8BC34A' }
    ];

    const anglePerSector = 360 / prizes.length; // 45度

    return prizes.map((prize, index) => {
      const startAngle = index * anglePerSector;
      const endAngle = (index + 1) * anglePerSector;
      
      return {
        ...prize,
        startAngle,
        endAngle
      };
    });
  },

  /**
   * 绘制Canvas转盘
   */
  drawCanvasWheel() {
    const ctx = wx.createCanvasContext('lotteryWheel', this);
    
    // 获取系统信息，计算实际Canvas尺寸
    const systemInfo = wx.getSystemInfoSync();
    const pixelRatio = systemInfo.pixelRatio || 2;
    const canvasSize = 600 / 750 * systemInfo.windowWidth; // 将rpx转换为px
    
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = canvasSize * 0.45; // 转盘半径为Canvas尺寸的45%
    
    // 清空画布
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 绘制转盘背景
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = Math.max(1, radius * 0.007); // 背景边框线宽相对于半径
    ctx.stroke();
    
    // 使用图片绘制转盘
    this.drawWheelWithImages(ctx, centerX, centerY, radius);
  },

  /**
   * 为单个奖品绘制文字（备选方案）
   */
  drawTextForPrize(ctx, prize, centerX, centerY, radius, index) {
    const textAngle = (prize.startAngle + prize.endAngle) / 2;
    const textRad = (textAngle - 90) * Math.PI / 180;
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(textRad);
    const textY = centerY + textRadius * Math.sin(textRad);
    
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(textRad);
    ctx.fillStyle = '#333';
    ctx.font = `${Math.max(12, radius * 0.08)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prize.name, 0, 0);
    ctx.restore();
  },

  /**
   * 使用图片绘制转盘
   */
  drawWheelWithImages(ctx, centerX, centerY, radius) {
    console.log('开始绘制图片转盘');
    
    // 绘制每个扇形
    this.data.prizes.forEach((prize, index) => {
      const startAngle = (prize.startAngle - 90) * Math.PI / 180; // -90度使第一个扇形从顶部开始
      const endAngle = (prize.endAngle - 90) * Math.PI / 180;
      
      console.log(`绘制扇形 ${index}:`, prize.name, '角度:', prize.startAngle, '-', prize.endAngle);
      
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, radius * 0.01); // 扇形边框线宽相对于半径
      ctx.stroke();
      
      // 尝试绘制图片
      try {
        const imageAngle = (prize.startAngle + prize.endAngle) / 2;
        const imageRad = (imageAngle - 90) * Math.PI / 180;
        const imageRadius = radius * 0.75; // 将图片向边缘移动，从0.65增加到0.75
        const imageX = centerX + imageRadius * Math.cos(imageRad);
        const imageY = centerY + imageRadius * Math.sin(imageRad);
        
        const imageSize = radius * 0.375; // 图片大小增加50%：原来0.25 * 1.5 = 0.375
        
        console.log(`尝试绘制图片 ${index}:`, {
          imagePath: prize.image,
          imageX, imageY, imageSize, imageAngle, imageRad
        });
        
        ctx.save();
        ctx.translate(imageX, imageY);
        ctx.rotate(imageRad + Math.PI / 2); // 图片跟随扇形角度旋转 + 右旋转90度
        
        // 直接使用图片路径绘制，保持原始高宽比
        // 对于不同的图片，使用不同的尺寸以保持原始高宽比
        let imageWidth = imageSize;
        let imageHeight = imageSize;
        
        // 根据图片名称调整高宽比
        if (prize.image.includes('JD_Book.png')) {
          // 京东图书卡 - 假设是横向矩形
          imageWidth = imageSize * 1.2;
          imageHeight = imageSize * 0.8;
        } else if (prize.image.includes('Green_plant.png')) {
          // 桌面绿植 - 假设是纵向矩形
          imageWidth = imageSize * 0.8;
          imageHeight = imageSize * 1.2;
        } else if (prize.image.includes('Pen.png')) {
          // 中性笔 - 假设是横向矩形，增加高度
          imageWidth = imageSize * 1;
          imageHeight = imageSize * 1;
        } else if (prize.image.includes('Bike.png')) {
          // 青桔单车 - 假设是横向矩形
          imageWidth = imageSize * 1.2;
          imageHeight = imageSize * 0.9;
        } else if (prize.image.includes('Thanks.png')) {
          // 谢谢参与 - 假设是正方形或略微横向
          imageWidth = imageSize * 1.1;
          imageHeight = imageSize * 1.0;
        } else if (prize.image.includes('Points.png')) {
          // 积分图标 - 假设是正方形
          imageWidth = imageSize;
          imageHeight = imageSize;
        }
        
        ctx.drawImage(prize.image, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
        
        ctx.restore();
      } catch (error) {
        console.error(`绘制图片 ${index} 失败:`, error);
        // 如果图片绘制失败，绘制文字作为备选
        this.drawTextForPrize(ctx, prize, centerX, centerY, radius, index);
      }
    });
    
    this.drawWheelDecorations(ctx, centerX, centerY, radius);
  },

  /**
   * 使用文字绘制转盘（备选方案）
   */
  drawWheelWithText(ctx, centerX, centerY, radius) {
    // 绘制每个扇形
    this.data.prizes.forEach((prize, index) => {
      const startAngle = (prize.startAngle - 90) * Math.PI / 180; // -90度使第一个扇形从顶部开始
      const endAngle = (prize.endAngle - 90) * Math.PI / 180;
      
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, radius * 0.01); // 扇形边框线宽相对于半径
      ctx.stroke();
      
      // 绘制文字
      const textAngle = (prize.startAngle + prize.endAngle) / 2;
      const textRad = (textAngle - 90) * Math.PI / 180;
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.cos(textRad);
      const textY = centerY + textRadius * Math.sin(textRad);
      
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textRad + Math.PI / 2); // 文字垂直于半径
      ctx.fillStyle = prize.color === '#ffffff' ? '#333333' : '#ffffff';
      ctx.font = `bold ${radius * 0.08}px Arial`; // 文字大小相对于半径
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(prize.name, 0, 0);
      ctx.restore();
    });
    
    this.drawWheelDecorations(ctx, centerX, centerY, radius);
  },

  /**
   * 绘制转盘装饰
   */
  drawWheelDecorations(ctx, centerX, centerY, radius) {
    // 绘制外圈装饰
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = Math.max(2, radius * 0.02); // 线宽相对于半径
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - radius * 0.03, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, radius * 0.01); // 线宽相对于半径
    ctx.stroke();
    
    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, radius * 0.01); // 中心圆边框线宽相对于半径
    ctx.stroke();
    
    // 绘制中心文字 "GO"
    ctx.fillStyle = '#333333';
    ctx.font = `bold ${radius * 0.12}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO', centerX, centerY);

    const that = this;
    
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'lotteryWheel',
        success(res) {
          console.log(res.tempFilePath);
          that.setData({lotteryImg: res.tempFilePath})
        }
      })
    });

    
    //console.log(this.createSelectorQuery().select('#lotteryWheel'));
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('=== 转盘页面加载 ===')
    console.log('页面参数:', options)
    
    // 初始化Canvas转盘数据
    const canvasPrizes = this.generateCanvasWheelData();
    this.setData({
      prizes: canvasPrizes
    }, () => {
      // 数据设置完成后绘制转盘
      this.drawCanvasWheel();
    });
    
    this.loadUserData()
    this.loadLotteryData()
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserData()
    this.loadLotteryData()
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    // const userInfo = app.globalData.userInfo
    // if (userInfo) {
    //   this.setData({
    //     userPoints: userInfo.points || 0
    //   })
    // }
  },

  /**
   * 加载抽奖数据
   */
  loadLotteryData() {
    this.setData({ loading: true })
    const access_token = wx.getStorageSync('pointsToken')
    // 获取今日抽奖次数
    wx.request({
      url: `${pointsTracker.pointsApiBase}/prize?access_token=${access_token}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.error_code === 0) {
          this.setData({
            todayLotteryCount: res.data.data.left_count || 0,
            userPoints: res.data.data.credit || 0,
          })
        }
      },
      fail: (err) => {
        console.error('获取抽奖次数失败:', err)
      },
      complete: () => {
        this.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },

  /**
   * 开始抽奖
   */
  startLottery() {
    console.log('=== 开始抽奖函数被调用 ===')
    console.log('当前状态:', {
      isSpinning: this.data.isSpinning,
      todayLotteryCount: this.data.todayLotteryCount,
      maxLotteryCount: this.data.maxLotteryCount,
      wheelRotation: this.data.wheelRotation
    })
    
    // 检查是否正在抽奖
    if (this.data.isSpinning) {
      console.log('正在抽奖中，请稍候')
      return
    }

    // 检查剩余次数
    if (this.data.todayLotteryCount <= 0) {
      wx.showToast({
        title: '今日抽奖次数已用完',
        icon: 'none'
      })
      return
    }

    // 检查积分是否足够
    // if (this.data.userPoints < this.data.lotteryPointsCost) {
    //   wx.showToast({
    //     title: `积分不足，需要${this.data.lotteryPointsCost}积分`,
    //     icon: 'none'
    //   })
    //   return
    // }

    console.log('开始抽奖，设置转动状态')
    this.setData({ 
      isSpinning: true 
    }, () => {
      console.log('isSpinning状态已更新为:', this.data.isSpinning)
    })

    // 发送抽奖请求
    console.log('准备发送抽奖请求到API')
    console.log('请求URL:', 'http://115.190.2.150:8080/api/lottery/draw')
    console.log('请求头:', {
      'Authorization': `Bearer ${app.globalData.token || ''}`,
      'Content-Type': 'application/json'
    })
    
    // 添加网络连接测试
    // wx.request({
    //   url: 'http://115.190.2.150:8080/api/test',
    //   method: 'GET',
    //   success: (testRes) => {
    //     console.log('=== 网络连接测试成功 ===', testRes)
    //   },
    //   fail: (testErr) => {
    //     console.log('=== 网络连接测试失败 ===', testErr)
    //   }
    // })
    
    wx.request({
      url: `${pointsTracker.pointsApiBase}/prize/draw`,
      method: 'POST',
      data: {access_token: wx.getStorageSync('pointsToken')},
      header: {
        // 'Authorization': `Bearer ${app.globalData.token || ''}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000, // 设置10秒超时
      success: (res) => {
        console.log('=== 抽奖API请求成功 ===')
        console.log('响应状态码:', res.statusCode)
        console.log('响应数据:', res.data)

        if (res.statusCode === 200 && res.data && res.data.error_code === 0) {
          const prizeData = res.data.data.prize
          const prize = this.data.prizes.find(p => p.id === prizeData.id) || this.data.prizes[1]
          
          console.log('中奖数据:', prizeData)
          console.log('匹配的奖品:', prize)
          
          // 计算目标角度（根据奖品位置）
          const prizeIndex = this.data.prizes.findIndex(p => p.id === prize.id)
          
          // 使用Canvas转盘的角度计算方式
          const prizeAngle = this.data.prizes[prizeIndex].startAngle + 22.5; // 扇形中心角度
          const randomOffset = Math.random() * 20 - 10 // 随机偏移 -10 到 10 度
          const targetAngle = 360 - prizeAngle + randomOffset
          
          // 计算基于当前角度的增量转动，确保每次都转足够的圈数
          const currentRotation = this.data.wheelRotation % 360; // 获取当前角度的余数
          const rotationIncrement = 1800 + targetAngle - currentRotation; // 转5圈后到达目标位置
          const finalAngle = this.data.wheelRotation + rotationIncrement;
          
          console.log('=== Canvas转盘角度计算 ===')
          console.log('奖品索引:', prizeIndex)
          console.log('奖品起始角度:', this.data.prizes[prizeIndex].startAngle)
          console.log('奖品中心角度:', prizeAngle)
          console.log('随机偏移:', randomOffset)
          console.log('目标角度:', targetAngle)
          console.log('当前转盘角度:', this.data.wheelRotation)
          console.log('当前角度余数:', currentRotation)
          console.log('转动增量:', rotationIncrement)
          console.log('最终角度:', finalAngle)
          
          // 设置转盘最终角度，添加过渡动画
          this.setData({
            wheelRotation: finalAngle
          }, () => {
            console.log('转盘角度已更新为:', this.data.wheelRotation)
          })
          
          // 3秒后显示结果
          setTimeout(() => {
            console.log('=== 显示抽奖结果 ===')
            this.setData({
              currentPrize: {
                ...prize,
                actualPoints: prizeData.points || prize.points
              },
              showResult: true,
              isSpinning: false,
              todayLotteryCount: res.data.data.left_count,
              userPoints: res.data.data.credit
            })

            // 显示中奖结果
            this.showPrizeResult(prize)
          }, 3000) // 3秒转盘动画
        } else {
          console.log('=== 抽奖失败 ===')
          console.log('失败原因:', res.data ? res.data.message : '响应数据为空')
          console.log('完整响应:', res)
          
          wx.showToast({
            title: res.data ? res.data.tip : '抽奖失败，请稍后重试',
            icon: 'none'
          })
         this.setData({
              isSpinning: false
        })
          
          // setTimeout(() => {
          //   this.setData({
          //     currentPrize: mockPrize,
          //     showResult: true,
          //     isSpinning: false
          //   })
          //   this.showPrizeResult(mockPrize)
          // }, 3000)
        }
      },
      fail: (err) => {
        console.error('=== 抽奖请求失败 ===')
        console.error('错误详情:', err)
        console.error('错误类型:', typeof err)
        console.error('错误代码:', err.errMsg)
        
        // 网络失败时也使用模拟数据进行测试
        console.log('=== 网络失败，使用模拟数据测试转盘 ===')
        const mockPrize = this.data.prizes[2] // 使用第三个奖品作为测试
        const prizeIndex = 2
        
        // 使用Canvas转盘的角度计算方式
        const prizeAngle = this.data.prizes[prizeIndex].startAngle + 22.5;
        const randomOffset = Math.random() * 20 - 10
        const targetAngle = 360 - prizeAngle + randomOffset
        
        // 计算基于当前角度的增量转动，确保每次都转足够的圈数
        const currentRotation = this.data.wheelRotation % 360;
        const rotationIncrement = 1800 + targetAngle - currentRotation;
        const finalAngle = this.data.wheelRotation + rotationIncrement;
        
        this.setData({
          wheelRotation: finalAngle
        }, () => {
          console.log('网络失败模拟转盘角度已更新为:', this.data.wheelRotation)
        })
        
        setTimeout(() => {
          this.setData({
            currentPrize: mockPrize,
            showResult: true,
            isSpinning: false
          })
          wx.showToast({
            title: '网络测试模式',
            icon: 'none'
          })
        }, 3000)
      }
    })
  },

  /**
   * 显示中奖结果
   */
  showPrizeResult(prize) {
    // const prize = this.data.currentPrize
    if (prize.id > 0 && (prize.points > 0 || prize.actualPoints > 0)) {
      wx.showModal({
        title: '恭喜中奖！',
        content: `获得：${prize.name}${prize.actualPoints ? ` (+${prize.actualPoints}积分)` : ''}`,
        showCancel: false,
        confirmText: '太棒了'
      })
    } else {
      // wx.showToast({
      //   title: prize.name,
      //   icon: 'none'
      // })
    }
  },

  /**
   * 关闭结果弹窗
   */
  closeResult() {
    this.setData({
      showResult: false,
      currentPrize: null
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadUserData()
    this.loadLotteryData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '环保积分抽奖，快来试试手气！',
      path: '/pages/lottery/lottery'
    }
  },

  /**
   * 打开积分抽奖规则页面
   */
  openRulesPage() {
    wx.navigateTo({
      url: '/pages/lottery_rules/lottery_rules'
    });
  },

  /**
   * 打开我的奖品页面
   */
  openMyPrizes() {
    // 跳转到收货信息填写页面
    wx.navigateTo({
      url: '/pages/prize_delivery/prize_delivery'
    });
  }
})

