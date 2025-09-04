import request from '../../utils/request'

// 当前页面的offset值
let offset = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 导航标签数据
    videoGroupList: [],
    // 所有视频列表数据
    allVideoList: [],
    // 当前所在分类的索引
    pageNum: 0,
    // 标识下拉刷新是否被触发
    isTriggered: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon:'loading',
          success: () => {
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }
        })
      return;
    }
    // 获取导航标签数据
    await this.getVideoGroupListData();
    await this.getOnePageVideoList(this.data.pageNum)
  },

  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupList = await request('/video/category/list');
    let allVideoList = [];
    videoGroupList = videoGroupList.data
    videoGroupList.forEach(item => {
      let arr = [];
      allVideoList.push(arr);
    })
    this.setData({
      videoGroupList,
      allVideoList
    })
  },

  /* 点击切换导航的回调 */
  changeNav(event) {
    this.setData({
      pageNum: event.currentTarget.dataset.page,
    })
  },

  /*  获取单页视频的数据列表 */
  async getOnePageVideoList(pageNum) {
    let result = await this.requestPageList(pageNum)
    let allVideoList = this.data.allVideoList;
    allVideoList[pageNum].push(...result)
    this.setData({
      allVideoList
    })
  },

  /* 封装单页视频列表数据的请求 */
  async requestPageList(pageNum) {
    console.log('id'+this.data.videoGroupList[pageNum].id);
    let result = await request('/video/group', {
      id: this.data.videoGroupList[pageNum].id,
      offset: offset * 8
    }) 
    offset++;
    result = result.datas
    return result;
  },

  // 分类滑动切换事件
  pageChange(event) {
    // console.log(event);
    let page = event.detail.current;
    // 每次翻页请求前都清空数据
    this.cleanAllVideoList()
    this.getOnePageVideoList(page)
    this.setData({
      pageNum: page
    })

  },


  // 每次查询都调用此函数清空所有数据
  cleanAllVideoList() {
    let allVideoList = this.data.allVideoList;
    let index = 0
    allVideoList.forEach(item => {
      // console.log(item);
      allVideoList[index++] = [];
    })
    this.setData({
      allVideoList
    })
    offset = 0;
  },

  // 点击视频事件
  playVideo(event) {
    // console.log(event);
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.pause();
    const app = getApp();
    app.globalData.isPlay = false;
    let url = event.currentTarget.dataset.videovid
    let type = event.currentTarget.dataset.videotype
    wx.navigateTo({
      url: '/pages/videoPlayer/videoPlayer?videovid=' + url + '&videotype=' + type
    })
  },

  // 自定义下拉刷新的回调
  async handleRefresher() {
    // console.log('scroll-view下拉刷新');
    // 获取当前分类列表的id
    // this.getOnePageVideoList(this.data.pageNum)

    let result = await this.requestPageList(this.data.pageNum);
    let allVideoList = this.data.allVideoList;
    allVideoList.splice(this.data.pageNum, 1, result)

    // console.log('下拉刷新完成');
    // 关闭下拉提示框
    this.setData({
      isTriggered: false,
      allVideoList
    })
  },

  // 自定义上拉触底加载的回调
  async handleToLower() {
    // 下面是将刷新获取的数据直接追加到当前视频列表
    // 获取当前分类列表的id
    this.getOnePageVideoList(this.data.pageNum)
  },

  // 跳转至搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

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

  }
})