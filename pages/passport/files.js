// pages/passport/files.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        word_link: '',
        word_name: '',
        preview: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.name) {
            this.setData({
                name: decodeURIComponent(options.name)
            })
        }
        if (options.word_link) {
            this.setData({
                word_link: options.word_link
            })
        }
        if (options.word_name) {
            this.setData({
                word_name: options.word_name
            })
        }
        if (options.preview) {
            this.setData({
                preview: decodeURIComponent(options.preview)
            })
        }
        if (options.attachmentList) {
            this.setData({
                attachmentList: JSON.parse(decodeURIComponent(options.attachmentList).replaceAll("'", "\""))
            })
        }


    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    down(event) {
        wx.downloadFile({
            url: event.currentTarget.dataset.url,
            success(res) {
                if (res.statusCode == 200) {
                    wx.openDocument({
                        filePath: res.tempFilePath,
                        fileType: res.tempFilePath.split('.').pop(),
                        showMenu: true,
                        success: function (rem) {
                        }
                    })
                }
            }
        })
    },

    // 预览
    preview(event) {
        const src = event.currentTarget.dataset.preview
        wx.navigateTo({
            url: `./pdfPreview?src=${src}`
        });
    }
})