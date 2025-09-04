# 🎵 网愈云Music - 微信小程序

> 一个基于网易云音乐API开发的微信小程序音乐播放器

[![GitHub license](https://img.shields.io/github/license/California-US/musicMiniProgram)](https://github.com/California-US/musicMiniProgram)
[![GitHub stars](https://img.shields.io/github/stars/California-US/MusicApi)](https://github.com/California-US/musicMiniProgram/stargazers)

## ✨ 特性

- 🎶 **完整音乐体验**: 歌曲播放、歌词同步、每日推荐、热门歌单、音乐排行榜
- 📱 **原生小程序开发**: 流畅的性能与原生体验
- 🔐 **双模式登录**: 支持手机验证码与二维码扫码登录
- 🎨 **精美UI设计**: 基于WeUI定制化音乐播放界面
- 💽 **多端同步**: 收藏列表、播放记录与网易云同步

## 🚀 快速开始

### 前置条件

- Node.js (版本 14 或更高)
- 微信开发者工具
- 网易云音乐账号

### 安装与运行

1. **启动后端API服务** 

   **方式一: 本地安装(二选一)**

```bash
克隆后端API项目
git clone https://github.com/California-US/MusicApi.git
        
cd MusicApi
node app.js
```

​	**方式二: 全局安装**

```bash
npx NeteaseCloudMusicApi@latest
```

启动成功后，你将看到类似下面的界面：

![serverRunning](https://github.com/California-US/musicMiniProgram/raw/main/docs/serverRunning.png)

2. **配置小程序**

- 打开微信开发者工具
- 导入本项目目录
- 在 `app.js` 中配置API地址(默认: `http://localhost:3000`)
- 点击编译运行

## 📸 项目截图

| 功能         |                             截图                             |
| :----------- | :----------------------------------------------------------: |
| **登录界面** | ![手机号登录](https://github.com/California-US/musicMiniProgram/raw/main/docs/phone_login.png)![二维码登录](https://github.com/California-US/musicMiniProgram/raw/main/docs/qr_code_login.png) |
| **首页**     | ![首页](https://github.com/California-US/musicMiniProgram/raw/main/docs/index.png) |
| **歌单广场** | ![歌单广场](https://github.com/California-US/musicMiniProgram/raw/main/docs/musicListSquare.png) |
| **播放页面** | ![播放页封面](https://github.com/California-US/musicMiniProgram/raw/main/docs/songDetail_01.png)![播放页歌词](https://github.com/California-US/musicMiniProgram/raw/main/docs/songDetail_02.png) |
| **个人中心** | ![个人中心_01](https://github.com/California-US/musicMiniProgram/raw/main/docs/personal_01.png)![个人中心_02](https://github.com/California-US/musicMiniProgram/raw/main/docs/personal_02.png) |
| **排行榜**   | ![排行榜](https://github.com/California-US/musicMiniProgram/raw/main/docs/ranking.png) |
| **每日推荐** | ![每日推荐](https://github.com/California-US/musicMiniProgram/raw/main/docs/recommendSong.png) |
| **视频播放** | ![视频播放](https://github.com/California-US/musicMiniProgram/raw/main/docs/videoPlayer.png) |
| **评论区**   | ![评论区](https://github.com/California-US/musicMiniProgram/raw/main/docs/comment.png) |
| **搜索页**   | ![搜索页](https://github.com/California-US/musicMiniProgram/raw/main/docs/search.png) |
| **视频页**   | ![视频页](https://github.com/California-US/musicMiniProgram/raw/main/docs/video.png) |

## 😄 注意事项

- 验证码登录接口有风控，使用二维码登录
- 视频页接口已更新，视频页暂不能用，搜索视频能播放
- 个人背景图获取的是老背景，未解决

## ⚠️ 免责声明

-   本项目仅用于**学习交流**和**个人练习**，不得用于任何**商业用途**。
-   项目中涉及的任何第三方API、数据、品牌名称、图标和logo，其版权均归原作者或所有者所有。
-   严禁任何人将本项目用于商业运营、非法活动或任何侵犯他人合法权益的行为。
-   使用者在使用本项目的过程中所发生的任何违法行为或纠纷，均与本项目作者无关，作者不承担任何法律责任。

> 注意: 本项目使用的网易云音乐API来自 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)，版权归原作者所有。

---

⭐ 如果这个项目对您有帮助，请给它一个 Star！您的支持是我持续更新的动力。

