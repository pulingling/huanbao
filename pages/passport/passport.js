const app = getApp();
const api = require("../../utils/request.js");
const browseTracker = require("../../utils/browseTracker.js");
Page({
  data: {
    // banner 轮播图 
    banner_list: [{
      title: 'test',
      video: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
      pic: ""
    }],
    indicatorDots: true,
    autoplay: true, // 自动播放
    interval: 5000, //轮播时间
    duration: 300, // 滑动速度越大越慢
    circular: true, //是否循环
    beforeColor: "lightgray", //指示点颜色
    afterColor: "red", //当前选中的指示点颜色
    // 轮播数据 + 效果 E
    controls: false,
    selected: 0,
    list: ['获奖作品', '活动集锦', '证书下载', '文件'],
    page: 1,
    page_size: 10,
    total: 0,
    pageList: [],
    certificateList:[],
    certificateMaxPage:1,
    currentVideo: "",
    currentCertPage: 1,
    currentYear: 0,
    yearChoices: ['2025年', '2024年', '2023年', '2022年', '2021年', '2020年'],
    certTypes1: ['优秀辅导教师奖', '优秀实施方案奖', '优秀组织奖', '优秀学校奖'],
    certTypes2: ['优秀辅导教师奖', '优秀实施方案奖', '优秀组织奖', '优秀学校奖'],
    currentCertType: 0,
    certLevels: ['一等奖', '二等奖', '三等奖', '优秀奖'],
    currentCertLevel: 0,
    showLoading:false,
    progress: 0,
    sign_on_off: 'off'
  },
  onLoad: function (options) {
    this.init()
    api.sign_status(app).then(res => {
      // 
      console.log('res-status---', res)
      this.setData({
        sign_on_off: res.body.status
      });
    });
  },
  onShow() {
    browseTracker.startTracking('action');
  },
  onHide() {
    // 页面隐藏时停止统计
    console.log('onHide');
    browseTracker.onPageHide();
  },
  
  onUnload() {
    // 页面卸载时停止统计
    console.log('onUnload');
    browseTracker.onPageUnload();
  },
  init() {
    this.getMeijingBanners()
    this.getMeijingPlanes()
    this.getMJCertificateList({
      page: 1
    })
  },
  //打开文件
  openFile(e){
    const url = e.currentTarget.dataset.url
    const name = e.currentTarget.dataset.name
    const that = this
    this.setData({
      showLoading:true
    })
    console.log('ccc')
    const downloadTask = wx.downloadFile({
      url,
      filePath:`${wx.env.USER_DATA_PATH}/${name}.pdf`,
      success(res){
        wx.openDocument({
          filePath:res.filePath?res.filePath:res.tempFilePath,
          showMenu:true,
          fileType:that.data.docType,
          success(resp){
          },
          fail(err){
            wx.showModal({
              title: '',
              content: err,
              complete: (res) => {
                if (res.cancel) {
                  
                }
            
                if (res.confirm) {
                  
                }
              }
            })
          }
        })
      },
      fail(err){
        wx.showModal({
          cancelColor: '#333',
          cancelText: err,
          confirmColor: 'confirmColor',
          confirmText: 'confirmText',
          content: 'content',
          editable: true,
          placeholderText: 'placeholderText',
          showCancel: true,
          title: 'title',
          success: (result) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
      }
    })
    downloadTask.onProgressUpdate((res)=>{
      if (res.progress === 100){
        this.setData({
          progress:res.progress,
          showLoading:false
        })
      }else{
        this.setData({
          progress:res.progress
        })
      }
    })
  },
  //获取美境行动证书下载列表
  getMJCertificateList(data) {
    console.log(data)
    api.getMJCertificateList(data).then(res => {
      console.log(res)
      res.body.items.map(item=>{
        const tempArray = item.name.split(/\s+/)
        item.school_name = tempArray[0]
        item.individual_name = tempArray[1]
        return item
      })
      if (data.page !== 1){
        res.body.items = this.data.certificateList.concat(res.body.items)
      }
      this.setData({
        certificateList:res.body.items,
        certificateMaxPage:res.body.num_pages,
        currentCertPage:Number(res.body.page)+1
      })
    })
  },
  //更改年份
  yearChange(e) {
    if (e.detail.value == this.data.currentYear) return
    console.log(e.detail.value,this.data.currentCertType)
    if (e.detail.value == 0 && this.data.currentCertType == 3){
      this.setData({
        currentYear: Number(e.detail.value),
        currentCertType:0
      })
    }else{
      this.setData({
        currentYear: Number(e.detail.value)
      })
    }
    if (this.data.currentCertType == 1) {
      this.getMJCertificateList({
        page: 1,
        season: this.data.yearChoices[e.detail.value],
        type: e.detail.value ? this.data.certTypes2[this.data.currentCertType] : this.data.certTypes1[this.data.currentCertType],
        level: this.data.certLevels[this.data.currentCertLevel]
      })
    } else {
      this.getMJCertificateList({
        page: 1,
        season: this.data.yearChoices[e.detail.value],
        type: e.detail.value ? this.data.certTypes2[this.data.currentCertType] : this.data.certTypes1[this.data.currentCertType]
      })
    }
  },
  //更改奖类
  typeChange(e) {
    if (e.detail.value == this.data.currentCertType) return
    console.log(e.detail.value)
    this.setData({
      currentCertType: e.detail.value
    })
    if (e.detail.value == 1) {
      this.getMJCertificateList({
        page: 1,
        season: this.data.yearChoices[this.data.currentYear],
        type: this.data.currentYear ? this.data.certTypes2[e.detail.value] : this.data.certTypes1[e.detail.value],
        level: this.data.certLevels[this.data.currentCertLevel]
      })
    } else {
      this.getMJCertificateList({
        page: 1,
        season: this.data.yearChoices[this.data.currentYear],
        type: this.data.currentYear ? this.data.certTypes2[e.detail.value] : this.data.certTypes1[e.detail.value]
      })
    }
  },
  //更改等级
  levelChange(e) {
    if (e.detail.value == this.data.currentCertLevel) return
    console.log(e.detail)
    this.setData({
      currentCertLevel: e.detail.value
    })
    this.getMJCertificateList({
      page: 1,
      season: this.data.yearChoices[this.data.currentYear],
      type: this.data.currentYear ? this.data.certTypes2[this.data.currentCertType] : this.data.certTypes1[this.data.currentCertType],
      level: this.data.certLevels[e.detail.value]
    })
  },
  // 获取banner图
  getMeijingBanners() {
    api.meijing_banners({}).then(res => {
      if (res && res.code == 200) {
        res.body.forEach((value, index) => {
          value.isShow = true;
        })
        this.setData({
          banner_list: res.body.map(item => {
            return {
              ...item,
              pic: item.pic.replace('https://cdn.envedu.com.cn', 'https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com'),
              video: item.video.replace('https://cdn.envedu.com.cn', 'https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com')
            }
          }),
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 美境行动方案列表
  getMeijingPlanes() {
    api.meijing_planes({
      page: this.data.page,
      page_size: this.data.page_size
    }).then(res => {
      if (res && res.code == 200) {
        this.setData({
          pageList: this.data.pageList.concat(res.body.items.map(item => {
            return {...item, pic: item.pic.replace('https://cdn.envedu.com.cn', 'https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com')}
          })),
          page: res.body.page,
          page_size: res.body.limit,
          total: res.body.total
        })
        console.log(this.data.pageList)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 美境行动活动列表
  getMeijingActivities() {
    api.meijing_activities({
      page: this.data.page,
      page_size: this.data.page_size
    }).then(res => {
      console.log('111', res)
      if (res && res.code == 200) {
        this.setData({
          pageList: this.data.pageList.concat(res.body.items.map(item => {
            return {...item, pic: item.pic.replace('https://cdn.envedu.com.cn', 'https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com')}
          })),
          page: res.body.page,
          page_size: res.body.limit,
          total: res.body.total
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 美境行动文件列表
  getMeijingFiles() {
    api.meijing_files({
      page: this.data.page,
      page_size: this.data.page_size
    }).then(res => {
      if (res && res.code == 200) {
        this.setData({
          pageList: this.data.pageList.concat(res.body.items),
          page: res.body.page,
          page_size: res.body.limit,
          total: res.body.total
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  //预览图片
  previewImage: function (e) {
    console.log(e.target.dataset.src)
    var current = e.target.dataset.src;

    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.banner_list
      // urls: this.data.imgUrls // 需要预览的图片http链接列表  
    })
  },
  fullScreen: function (e) {
    // console.log("currentnow:"+e.currentTarget.dataset)    
    if (!e.detail.fullScreen) {
      this.data.currentVideo.pause()
      this.data.banner_list[e.currentTarget.dataset.id].isShow = true;
      this.setData({
        banner_list: this.data.banner_list,
      })
    } else {
      this.data.currentVideo.play()
      this.data.banner_list[e.currentTarget.dataset.id].isShow = false;
      this.setData({
        banner_list: this.data.banner_list,
      })
    }
  },
  // 播放
  videoPlay: function (e) {
    this.data.banner_list[e.currentTarget.dataset.id].isShow = false;
    this.setData({
      banner_list: this.data.banner_list,
    })
    console.log("开始播放")
    let videoplay = wx.createVideoContext("video" + e.currentTarget.dataset.id);
    videoplay.play()
    this.setData({
      controls: true,
      currentVideo: videoplay
    })
    this.videoContext = wx.createVideoContext('video' + e.currentTarget.dataset.id, this);
    this.videoContext.requestFullScreen({
      direction: 90
    });
  },
  //tab框
  selected: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index
    if (index == 0) {
      that.setData({
        selected: 0,
        pageList: [],
        page: 1,
        total: 0
      })
      this.getMeijingPlanes()
    } else if (index == 1) {
      that.setData({
        selected: 1,
        pageList: [],
        page: 1,
        total: 0
      })
      this.getMeijingActivities()
    } else if (index == 2) {
      that.setData({
        selected: 2,
        pageList: [],
        page: 1,
        total: 0
      })
      this.getMeijingFiles()
    } else {
      that.setData({
        selected: 3,
        pageList: [],
        page: 1,
        total: 0
      })
      this.getMeijingFiles()
    }
  },

  // 跳转到文件详情
  toFilesDetails(event) {
    const name = encodeURIComponent(event.currentTarget.dataset.name)
    const word_link = event.currentTarget.dataset.wordlink
    const word_name = event.currentTarget.dataset.wordname
    const preview = encodeURIComponent(event.currentTarget.dataset.preview)
    if (event.currentTarget.dataset.attachmentlist) {
      const attachmentList = encodeURIComponent(event.currentTarget.dataset.attachmentlist)
      wx.navigateTo({
        url: `./files?name=${name}&word_link=${word_link}&word_name=${word_name}&preview=${preview}&attachmentList=${attachmentList}`
      });
    } else {
      wx.navigateTo({
        url: `./files?name=${name}&word_link=${word_link}&word_name=${word_name}&preview=${preview}`
      });
    }
  },

  // 跳转到获奖详情
  details(event) {
    const detail = event.currentTarget.dataset.detail
    wx.navigateTo({
      url: `./details?detail=${detail}`
    });
  },

  // 跳转到webview
  toWebview(event) {
    const src = event.currentTarget.dataset.src
    wx.navigateTo({
      url: `./webview?src=${src}`
    });
  },

  // 触底加载
  onReachBottom() {
    console.log('触底加载', this.data.selected)
    const that = this
    if (this.data.page * this.data.page_size < this.data.total) {
      if (this.data.selected == 0) {
        that.setData({
          page: Number(this.data.page) + 1
        })
        this.getMeijingPlanes()
      } else if (this.data.selected == 1) {
        that.setData({
          page: Number(this.data.page) + 1
        })
        this.getMeijingActivities()
      } else if (this.data.selected == 2) {
        that.setData({
          page: Number(this.data.page) + 1
        })
        this.getMeijingFiles()
      }
    }
    console.log(this.data.currentCertPage, this.data.certificateMaxPage)
    if (this.data.currentCertPage > this.data.certificateMaxPage){
      return
    }else{
      console.log(this.data.currentCertType)
      if (this.data.currentCertType == 1) {
        this.getMJCertificateList({
          page: this.data.currentCertPage,
          season: this.data.yearChoices[this.data.currentYear],
          type: this.data.currentYear ? this.data.certTypes2[this.data.currentCertType] : this.data.certTypes1[this.data.currentCertType],
          level: this.data.certLevels[this.data.currentCertLevel]
        })
      } else {
        this.getMJCertificateList({
          page: this.data.currentCertPage,
          season: this.data.yearChoices[this.data.currentYear],
          type: this.data.currentYear ? this.data.certTypes2[this.data.currentCertType] : this.data.certTypes1[this.data.currentCertType]
        })
      }
    }
  },
  showPreview(e){
    const url = e.currentTarget.dataset.url.replace('https://cdn.envedu.com.cn', 'https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com')
    wx.previewImage({
      current:url,
      urls: [url]
    })
  },
  
  jumpToSignUp(){
    wx.navigateTo({
      url: `/pages/sign_up/sign_up`,
      success: function(res) {
        console.log("跳转成功");
      },
      fail: function(err) {
        console.log("跳转失败", err);
      }
    })
  },
  jumpToSignList(){
    wx.navigateTo({
      url: `/pages/sign_list/sign_list`,
      success: function(res) {
        console.log("跳转成功");
      },
      fail: function(err) {
        console.log("跳转失败", err);
      }
    })
  },
})