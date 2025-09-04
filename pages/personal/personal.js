import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, //用户信息
    recentPlayList: [], //用户播放记录
    myFavoriteList: [], // '我喜欢的音乐'歌单
    createdList: [], //创建的歌单
    collectedList: [], //收藏的歌单
    userDetail: [], //用户等级和累计听歌数
    playingMusicList: [], // 当前播放的歌曲的歌单,用于给songDetail读取
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    /* 更新userInfo的状态 */
    if (userInfo) {
      try {
        this.setData({
          userInfo: JSON.parse(userInfo)
        })
      } catch (error) {
        console.error("解析用户信息失败：", error);
      }
    }
    if (wx.getStorageSync('lastUserId') == wx.getStorageSync('userId') && wx.getStorageSync('userId') != '') {
      let recentPlayList = wx.getStorageSync('recentPlayList');
      let myFavoriteList = wx.getStorageSync('myFavoriteList');
      let createdList = wx.getStorageSync('createdList');
      let collectedList = wx.getStorageSync('collectedList');
      let userDetail = wx.getStorageSync('userDetail');
      this.setData({
        recentPlayList,
        myFavoriteList,
        createdList,
        collectedList,
        userDetail
      })
    }
  },


  /* 获取用户等级和累计听歌数的功能函数 */
  async getUserDetail(userId) {
    let result = await request('/user/detail', {
      uid: userId,
    })
    let userDetail = []
    userDetail[0] = result.level
    userDetail[1] = result.listenSongs
    userDetail[2] = result.profile.follows
    userDetail[3] = result.profile.followeds
    this.setData({
      userDetail
    })
    wx.setStorageSync('userDetail', userDetail)
  },

  /* 获取用户播放记录的功能函数 */
  async getUserRecentPlayList(userId) {
    let result = await request('/user/record', {
      uid: userId,
      type: 1
    })
    let recentPlayList = [];
    if (result.weekData.length > 10) {
      let index = 0;
      recentPlayList = result.weekData.splice(0, 20).map(item => {
        item.id = index++;
        return item;
      })
    } else {
      let index = 0
      recentPlayList = result.weekData.map(item => {
        item.id = index++;
        return item;
      })
    }
    this.setData({
      recentPlayList
    })
    wx.setStorageSync('recentPlayList', recentPlayList)
  },

  /* 跳转至歌曲播放 */
  async toSongDetail(e) {
    let playingMusicList = []
    let index = 0;
    while (index < this.data.recentPlayList.length) {
      playingMusicList.push(this.data.recentPlayList[index].song)
      index++;
    }
    wx.setStorageSync('playingMusicList', playingMusicList)
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + e.currentTarget.dataset.musicid
    })
  },

  /* 获取并处理用户歌单 */
  async getUserPlayList() {
    try {
      const userId = this.data.userInfo.userId;
      if (!userId) return;
      
      const userPlayListRes = await request('/user/playlist', {
        uid: userId
      });
      
      if (!userPlayListRes.playlist || !Array.isArray(userPlayListRes.playlist)) {
        console.error('获取歌单数据格式错误');
        return;
      }
      
      const playlists = userPlayListRes.playlist;
      
      // 1. 提取"我喜欢的音乐"（只有一个）
      const myFavoriteList = playlists.filter(item => item.specialType === 5);
      
      // 2. 提取所有自己创建的歌单（排除"我喜欢的音乐"）
      const createdList = playlists.filter(item => 
        item.userId === userId && item.specialType !== 5
      );
      
      // 3. 剩余的都是收藏的歌单
      // 使用数组过滤：既不是"我喜欢的音乐"也不是自己创建的歌单
      const collectedList = playlists.filter(item => 
        item.specialType !== 5 && item.userId !== userId
      );
      
      // 更新数据
      this.setData({
        myFavoriteList,
        createdList,
        collectedList
      });
      
      // 存储到本地缓存
      wx.setStorageSync('myFavoriteList', myFavoriteList);
      wx.setStorageSync('createdList', createdList);
      wx.setStorageSync('collectedList', collectedList);
      wx.setStorageSync('lastUserId', userId);
      
    } catch (error) {
      console.error('获取歌单失败:', error);
      wx.showToast({
        title: '获取歌单失败',
        icon: 'none'
      });
    }
  },


  /* 跳转登录Login页面 */
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  /* 跳转至音乐列表页面 */
  toMusicList(e) {
    wx.navigateTo({
      url: '/pages/musicList/musicList?musiclistid=' + e.currentTarget.dataset.musiclistid
    })
  },

  /* 退出登录 */
  logOut(event) {
    wx.clearStorage({
      success: () => {
        wx.reLaunch({
          url: '/pages/personal/personal',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    if (this.data.userInfo.userId) {
      //获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
      this.getUserDetail(this.data.userInfo.userId)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (this.data.userInfo.userId) {
      this.getUserPlayList()
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})