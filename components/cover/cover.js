Component({
  properties:{
    title:{
      type:String,
      value:''
    },
    score:{
      type:String,
      value:''
    }
  },
  methods:{
    close(e){
      this.triggerEvent('close',false)
    },
    toFootMark(e){
      wx.redirectTo({
        url: '/pages/footmark/footmark',
      })
    }
  }
  
});