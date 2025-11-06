const app = getApp()
const api = require('../../utils/request')
// components/books/books.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type:Array,
      required:true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    actCate:0,
    tags:['全部','生态文明系列连环画','其他', '生态环境教育读物'],
    showList:[]
  },
  /**
   * 组件的方法列表
   */
  lifetimes:{
    ready(e){
      
      this.setData({
        showList:this.data.list
      })
    }
  },
  methods: {
    handleTag(e){
      console.log(this.data.list)
      const cate = e.currentTarget.dataset.cate
      if (cate != this.data.actCate){
        const a = this.data.list.filter(item=>{
          console.log(item.title.match('生态文明系列连环画'))
          return item.title.match('生态文明系列连环画')
        })
        console.log(a)
        let showList = []
        switch(cate){
          case 1:
            showList = this.data.list.filter(item=>{
              return item.title.match('生态文明系列连环画')
            })
            break;
          case 2:
            showList = this.data.list.filter(item=>{
              return !item.title.match('生态文明系列连环画') && !item.title.match('生态环境教育读物')
            })
            break;
          case 3:
            showList = this.data.list.filter(item=>{
              return item.title.match('生态环境教育读物')
            })
            break;
        }
        console.log(cate, showList)
        this.setData({
          actCate:cate,
          showList
        })
      }
    },
    toBookDetail(e){
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/onlineBooks/book?id=${id}`,
      })
    }
  }
})
