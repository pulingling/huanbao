const utils = require("../../utils/util");
Component({
  properties:{
    title:{
      type:String,
      value:''
    },
    img:{
      type:String,
      value:''
    },
    address:{
      type:String,
      value:''
    },
    time:{
      type:Number,
      value:0
    },
    item_id:{
      type:Number,
      value:0
    }
  }, 
  data:{
    datFormateTime:'',
    titleFormat:'',
    descFormat:''
  },
  methods:{
    navigateTo(){
      wx.navigateTo({
        url: `/pages/open_detail/open_detail?id=${this.properties.item_id}`,
      })
    }
   
  },
  attached(){
    this.setData({
      dateTime:utils.timeParse(this.properties.time*1000),
      titleFormat: this.properties.title.length>12 ? this.properties.title.slice(0,12)+'...' : this.properties.title,
      descFormat: this.properties.address.length>26 ? this.properties.address.slice(0,26)+'...' : this.properties.address,
      imgFormat: this.properties.img.startsWith('/U') || this.properties.img.startsWith('/P') ? 'http://47.113.99.76:200' + this.properties.img : this.properties.img
    })
  }
});