const utils = require("../../utils/util");
Component({
  properties:{
    item:{
      type: Object,
      value: {}
    },
    title:{
      type: String,
      value: ""
    }
  }, 
  data:{
    
  },
  methods:{
    toDetail(e){
      wx.navigateTo({
        url: `/pages/activity_detail/activity_detail?id=`+e.currentTarget.dataset.id+'&title='+e.currentTarget.dataset.title
      })
    }
  }
});