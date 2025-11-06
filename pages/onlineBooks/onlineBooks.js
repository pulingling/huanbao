// pages/onlineBooks/onlineBooks.js
const app = getApp()
const api = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    books:[],
    curPage:1,
    pageSize:100,
    endBook:false
  },

  jump(e){
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url:`./book?id=${id}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    api.getBooksList({page:this.data.curPage,pageSize:this.data.pageSize},app).then(res=>{

      if (res.body.data.length < 9){
        this.setData({
          endBook:true,
          books:res.body.data
        })
      }else{
        this.setData({
          books:res.body.data
        })
      }
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
  onShow() {

  },

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
    if (this.data.endBook){
      return false
    }
    const curPage = this.data.curPage + 1
    api.getBooksList({page:curPage,pageSize:this.data.pageSize}).then(res=>{
      let books = this.data.books
      books.concat(res.body.data)
      if (res.body.data.length < 9){
        this.setData({
          endBook:true,
          books
        })
      }else{
        this.setData({
          books
        })
      }
    })
  },

})