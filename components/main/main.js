const app = getApp();
const utils = require("../../utils/util");
const api = require('../../utils/request')

Component({
  data: {
    courseList: [],
    knowledgeList: [],
    banner: [],
    currentSwiper: 0,
    bannerPlay: false,
    showImg: true,
    showWarning: false,
    coverImgShow: true,
    suggestCourses:[],
    booksList:[]
  },

  attached() {
    app.event.on("getComponentData", this, () => {
      this.getData();
      this.setData({
        bannerPlay: true
      });
    });

  },
  detached() {
    app.event.off("getComponentData", this);
    this.setData({
      bannerPlay: false
    });
  },
  ready() {
    const that = this;
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType;
        if (networkType !== "wifi") {
          that.setData({
            showWarning: true
          });
        }
      }
    });
  },
  methods: {
    scanQR() {
      wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          ;;
          let path = res.path
          path = decodeURIComponent(path)
          path = path.split('scene=')
          let arr = path[1].split(',')
          path[1] = arr.join('&')
          wx.navigateTo({
            url: '/' + path[0] + path[1],
          })
        },
        fail: (res) => {
          ;
        }
      })
    },
    videoPlay() {
      this.setData({
        showWarning: false,
        coverImgShow: false
      });
    },
    showVideo() {
      let videoContext = wx.createVideoContext('indexVideo', this)
      videoContext.play()
    },
    toLearnCourse(e){
      const id = e.currentTarget.dataset.id
      const { jump, type } = this.properties;
      console.log(jump,id,type)
			wx.navigateTo({
				url: `/pages/video_page/video_page?id=${id}&type=0`
			});
    },
    getData() {
      api.getBooksList({page:1,pageSize:3},app).then(res=>{
        console.log(res)
          this.setData({
            booksList:res.body.data.map(item => {
              return {...item, cover_url: item.cover_url.replace("https://cdn.envedu.com.cn", "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com")}
            })
          })
      })
      const tolearn =
        app.globalData.usr.user.tolearn ? JSON.parse(app.globalData.usr.user.tolearn.split("'").join('"')) : ""
      app.globalData.usr.ppts = app.globalData.usr.ppts.map(item => {
        item.type = item.title.split('】')[0].split('【')[1]
        item.short_title = item.title.split('】')[1]
        if (item.description.length > 11) {
          item.des1 = item.description.slice(0, 12)
          item.des2 = item.description.slice(12)
        } else {
          item.des1 = item.description
          item.des2 = ''
        }
        return item
      })

      const courseList = app.globalData.usr.ppts.slice(0, 2).map(item => {
        item.s_image = utils.imageUrl(item.s_image);
        return item;
      });

      this.setData({
        suggestCourses:tolearn.splice(0,2).map(item => {
          item.s_image = item.s_image.replace("https://cdn.envedu.com.cn", "https://sthjxjzx-cjhb.oss-accelerate.aliyuncs.com");
          console.log(item);
          return item;
        }),
        courseList: courseList,
        knowledgeList: app.globalData.usr.knowledges.data.slice(0, 2)
      });
    },
    handleBtn(e) {
      const jump = e.currentTarget.dataset.jump;
      wx.navigateTo({
        url: `/pages/${jump}/${jump}`
      });
    },
    jumpToBookDetail(e){
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/onlineBooks/book?id=${id}`,
      })
    },
    jumpToKnowledgeDetail(e){
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url:`/pages/knowledge_detail/knowledge_detail?id=${id}&type=1`
      })
    },
    jumpToEducation(e){
      const jump = e.currentTarget.dataset.jump;
      app.globalData.indexJump = jump
      wx.switchTab({
        url:`/pages/enviromentEdu/enviromentEdu`
      })
    },
    handleOpenDetail(e) {
			const id = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: `/pages/detail_short/detail_short?id=${id}&type=5`
			});
		},
    handleMoreBtn(e) {
      const jump = e.currentTarget.dataset.jump;
        this.triggerEvent("handleMoreBtn", {
          jump
        });
      
    },
    handleKnowledgeDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/knowledge_detail/knowledge_detail?id=${id}&type=1`
      });
    },
    navToLottery() {
      wx.navigateTo({
        url: '/pages/lottery/lottery'
      });
    },
    navToPoints() {
      wx.navigateTo({
        url: '/pages/points/points'
      });
    },
    swiperChange(e) {
      this.setData({
        currentSwiper: e.detail.current
      });
    }
  }
});