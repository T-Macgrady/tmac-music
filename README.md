# 基于Vue全家桶打造一个媲美原生体验的移动端Web App

## 项目说明：

- 项目来源于imooc，本着加深对Vue理解的目的，基于Vue全家桶从脚手架搭建到项目部署上线，打造一个媲美原生体验的完整的移动端音乐Web App项目！

<a id="demo"></a> 
### 项目预览:

- [上线demo >>](http://47.106.183.192:8888/#/singer)
- 扫码体验：（若微信扫描请点下方访问原网页）

![TmacMusic](https://raw.githubusercontent.com/T-Macgrady/imgs/master/others/TmacMusic.png)

- 图片演示：

![singer](https://raw.githubusercontent.com/T-Macgrady/imgs/master/tmacmusic/singer.jpg)![player](https://raw.githubusercontent.com/T-Macgrady/imgs/master/tmacmusic/player.jpg)

## 更新记录

- 使用viewport单位方案实现移动端适配
- 利用postcss工具，处理浏览器兼容以及1px边框等常见移动端问题，可专注于业务逻辑开发，加快开发速度
- Vuex + Stylus + localstorage实现颜色及图片背景换肤功能
- bug fixed : 部分不支持auto play、播放源受限、快速切歌歌词异常、词曲不同步等

### 技术

|  item   |   MVVM框架 | 状态管理  | 前端路由  | js新标准|   css 预编译 |版本管理 |构建工具 | 包管理|脚手架|
| :---: | :---------:| :------: |:------: |:------: |:------: |:------: |:------: |:------: |:------: |
|  技术   |    Vue.js（2.x） |Vuex |Vue Router | ES6|  stylus |git |webpack 2.0 | yarn|vue-cli|

### 其他技术&工具

* Jsonp
	*  跨域来请求数据
* vue-axios
	*  数据请求 通讯
* Node.js
	*  利用Express搭建代理服务器，转发本地请求返回数据实现跨域
 	*  项目编译打包后搭建本地测试服务器，回归测试
* vue-router
	*  结合 Vue 的异步组件和 Webpack 的代码分割功能，实现路由组件的懒加载以优化性能，加快首屏加载
* [vue-lazyload](https://github.com/T-Macgrady/vue-lazyload)
	*  实现图片懒加载，节省用户流量，优化页面加载速度
* [`better-scroll`](https://github.com/T-Macgrady/better-scroll)
	*  移动端滚动插件，使移动端滑动体验更加流畅
* shell
	*  编写自动化发布脚本
* nginx
	*  项目部署上线反向代理
* fastclick
	*   解决移动端300ms延迟
* charles
	*  移动端抓包，查看数据收发
	*  代理转发，部署上线前使用map local代理本地文件 map remote代理接口进行回归测试，防止代码压缩后网页显示效果不一致
* [`lyric-parser`](https://github.com/ustbhuangyi/lyric-parser)
	*  歌词解析
* [`Js-Base64`](https://github.com/T-Macgrady/js-base64)
 - Base64编码与解码
* [`iconfont`](http://www.iconfont.cn/) 
	*   图标库
* [`good-storage`](https://github.com/T-Macgrady/storage) 
	*  直接从storage存取数据，无需转换
## 项目运行

### Clone项目

``git@github.com:T-Macgrady/tmac-music.git``

### 运行

-  [安装nodejs环境,使用v6.12.3](https://nodejs.org/download/release/v6.12.3/)
-  [安装包管理工具yarn@1.6.0](https://yarn.bootcss.com/docs/install.html)
-  在项目根目录执行yarn初始化``yarn / yarn install``
-  启动项目
 - 开发模式 :
     ``yarn run dev``
    生产模式 :
     ``yarn run dist``
-  [开发模式下预览项目](http://localhost:8080/)

## 说明

- 如果对您有帮助，您可以点 "Star" 支持一下 十分感谢!

## 相关链接

[本人博客 ](#) 


