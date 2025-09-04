import config from './config'

export default (url, data = {}, method = 'GET') => {
  return new Promise((resolve, reject) => {
    // new Promise初始化promise实例状态为pending 
    wx.request({
      // 拼接完整的请求地址
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        if (data.isLogin) {
          // 将用户的cookie存至本地
          wx.setStorage({
            key: 'cookies',
            data: res.cookies,
          });
        }
        // console.log('请求成功:', res);
        resolve(res.data) // resolve修改promise的状态为成功状态resolved
      },
      fail: (err) => {
        console.log('请求失败:', err);
        reject(err)
      }
    })
  })
}    