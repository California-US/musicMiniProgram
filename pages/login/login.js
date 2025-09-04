import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: '', // 手机号
    captcha: '', // 验证码
    countdown: 0, // 倒计时秒数
    isCounting: false, // 是否在倒计时中
    showQR: false, // 控制二维码登录界面显示
    qrCodeImg: '', // 二维码图片
    qrKey: '', // 二维码key
    timer: null // 轮询定时器
  },

  //点击注册事件
  register(event) {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  // 表单项内容发生改变的回调
  handleInput(event) {
    let type = event.currentTarget.dataset.type;
    this.setData({
      [type]: event.detail.value
    });
  },

  // 验证码登录逻辑
  // 发送验证码
  async sendCaptcha() {
    const { phone, isCounting } = this.data;
    if (isCounting) return;

    // 验证手机号
    if (!phone.trim()) {
      wx.showToast({ title: '手机号不能为空!', icon: 'error' });
      return;
    }
    let phoneReg = /0?(13|14|15|18)[0-9]{9}/;
    if (!phoneReg.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'error' });
      return;
    }

    try {
      // 发送验证码
      const result = await request('/captcha/sent', {
        phone
      });
      if (result.code === 200) {
        wx.showToast({ title: '验证码已发送', icon: 'none' });
        // 开始倒计时
        this.startCountdown();
      } else {
        throw new Error('验证码发送失败');
      }
    } catch (err) {
      wx.showToast({
        title: err.message || '验证码发送失败',
        icon: 'none'
      });
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({ isCounting: true, countdown: 60 });
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer);
        this.setData({ isCounting: false, countdown: 0 });
        return;
      }
      this.setData({ countdown: this.data.countdown - 1 });
    }, 1000);
  },

  // 验证码登录
  async login() {
    // 收集表单项数据
    let { phone, captcha } = this.data;
    // 前端验证
    if (!phone.trim()) {
      wx.showToast({ title: '手机号不能为空!', icon: 'error' });
      return;
    }
    let phoneReg = /0?(13|14|15|18)[0-9]{9}/;
    if (!phoneReg.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'error' });
      return;
    }
    if (!captcha) {
      wx.showToast({ title: '验证码不能为空', icon: 'error' });
      return;
    }

    // 后端验证
    try {
      let result = await request('/login/cellphone', {
        phone,
        captcha,
        isLogin: true
      });
      if (result.code === 200) {
        wx.showToast({ title: '登录成功', icon: 'success' });
        // 存储用户信息
        wx.setStorageSync('userInfo', JSON.stringify(result.profile));
        // 跳回个人中心页
        wx.reLaunch({ url: '/pages/personal/personal' });
      } else if (result.code === 400) {
        wx.showToast({ title: '手机号错误', icon: 'error' });
      } else if (result.code === 502) {
        wx.showToast({ title: '验证码错误', icon: 'error' });
      } else {
        wx.showToast({ title: '登录失败', icon: 'error' });
      }
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'error' });
    }
  },
  // 二维码登录逻辑
  toggleQRLogin() {
    if (!this.data.showQR) {
      this.getQRCode();
    } else {
      clearInterval(this.data.timer); 
      this.setData({ qrStatus: '' });
    }
    
    this.setData({
      showQR: !this.data.showQR
    });
  },

  async getQRCode() {
    this.setData({ qrStatus: '正在获取二维码...' });
    
    try {
      // 获取二维码key
      const keyRes = await request('/login/qr/key', { timestamp: Date.now() });
      if (keyRes.code !== 200 || !keyRes.data.unikey) {
        throw new Error('获取二维码失败');
      }
      
      const key = keyRes.data.unikey;
      this.setData({ qrKey: key, qrStatus: '获取二维码成功' });
      
      // 获取二维码图片
      const qrRes = await request(`/login/qr/create?key=${key}&qrimg=true`, { 
        timestamp: Date.now() 
      });
      
      if (qrRes.code === 200) {
        this.setData({ 
          qrCodeImg: qrRes.data.qrimg,
          qrStatus: '等待扫码...'
        });
        this.checkQRStatus(); 
      } else {
        throw new Error('生成二维码失败');
      }
    } catch (err) {
      this.setData({ qrStatus: '二维码获取失败' });
      wx.showToast({
        title: err.message || '二维码获取失败',
        icon: 'none'
      });
    }
  },

  checkQRStatus() {
    clearInterval(this.data.timer); 
    
    const timer = setInterval(async () => {
      const { qrKey } = this.data;
      if (!qrKey) return;
      
      try {
        const statusRes = await request(`/login/qr/check?key=${qrKey}`, {
          timestamp: Date.now()
        });
        
        switch (statusRes.code) {
          case 800: // 二维码过期
            this.setData({ qrStatus: '二维码已过期' });
            wx.showToast({ title: '二维码已过期', icon: 'none' });
            this.getQRCode();
            break;
          case 801: // 等待扫码
            this.setData({ qrStatus: '等待扫码...' });
            break;
          case 802: // 已扫码待确认
            this.setData({ qrStatus: '已扫码，请在手机上确认' });
            wx.showToast({ title: '请确认登录', icon: 'none' });
            break;
          case 803: // 登录成功
            clearInterval(timer);
            this.setData({ timer: null, qrStatus: '登录成功' });
            this.handleLoginSuccess(statusRes.cookie);
            break;
          default:
            if (statusRes.code === 502) {
              // 处理502错误
              await request(`/login/qr/check?key=${qrKey}&noCookie=true`, {
                timestamp: Date.now()
              });
            } else {
              this.setData({ qrStatus: `错误:${statusRes.code}` });
              throw new Error(`状态错误: ${statusRes.code}`);
            }
        }
      } catch (err) {
        console.error('二维码状态检查失败:', err);
        this.setData({ qrStatus: '状态检查失败' });
      }
    }, 30000);
    
    this.setData({ timer });
  },

  // 修复用户信息获取问题
  async handleLoginSuccess(cookie) {
    // ✅ 关键修改：提取并存储精简的MUSIC_U
    const musicU = cookie.match(/MUSIC_U=([^;]+)/)?.[1];
    if (!musicU) {
      wx.showToast({ title: '登录凭证获取失败', icon: 'none' });
      return;
    }
    
    // ✅ 仅存储MUSIC_U部分
    wx.setStorageSync('cookie', `MUSIC_U=${musicU}`);
    
    try {
      // 获取用户账号信息
      const accountRes = await request('/user/account', {
        cookie,
        timestamp: Date.now()
      });
      
      if (accountRes.code === 200 && accountRes.account) {
        const profile = accountRes.profile || {
          nickname: accountRes.account.userName || '网易云用户',
          userId: accountRes.account.id,
          avatarUrl: '/static/images/default-avatar.png'
        };
        
        // 存储用户信息 - 与手机登录一致
        wx.setStorageSync('userInfo', JSON.stringify(profile));
        
        wx.showToast({ title: '登录成功', icon: 'success' });
        wx.reLaunch({ url: '/pages/personal/personal' });
      } else {
        throw new Error('获取用户信息失败');
      }
    } catch (err) {
      wx.showToast({
        title: err.message || '用户信息获取失败',
        icon: 'none'
      });
    }
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
   * 生命周期函数--页面卸载时清除定时器
   */
  onUnload() {
    clearInterval(this.data.timer);
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
