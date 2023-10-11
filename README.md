<p align="center"><a href="https://fresns.cn" target="_blank"><img src="https://cdn.fresns.cn/images/logo.png" width="300"></a></p>

<p align="center">
<img src="https://img.shields.io/badge/WeChat-Mini%20Program-blueviolet" alt="WeChat">
<img src="https://img.shields.io/badge/Fresns%20API-2.x-orange" alt="Fresns API">
<img src="https://img.shields.io/badge/License-Apache--2.0-green" alt="License">
</p>

## 介绍

知结是一个互联网从业者的资讯社区，由开源程序 [Fresns](https://fresns.cn) 驱动，有网站、微信小程序、iOS App 和 Android App 全端产品。

知结社区聚合了职业、产品、行业、公司和人物等互联网领域的各类资讯，通过圈子和话题将信息分门别类，用户可以关注用户、加入圈子、订阅话题等三种方式，将自己感兴趣的领域信息聚合到自己的时间线列表精选阅读（只有精选内容才会进入关注的信息流）。

知结的目标是信息降噪、高效阅读、主动式筛选，让我们每天刷几分钟就能知道科技圈的大小事。

## 技术方案

### 服务端

- 知结服务端由 [Fresns](https://fresns.cn) 驱动。
- Fresns 官网 [https://fresns.cn](https://fresns.cn)

### Web 客户端
- 源码: [https://marketplace.fresns.cn/open-source/detail/ZhijieWeb](https://marketplace.fresns.cn/open-source/detail/ZhijieWeb)
- Web 是以 [Fresns 插件机制](https://docs.fresns.cn/extensions/plugin/)开发的一个客户端插件，安装在 Fresns 主程序中运行。
- 体验: 直接打开官网链接 [https://zhijieshequ.com](https://zhijieshequ.com)

### App 客户端

- 源码: [https://marketplace.fresns.cn/open-source/detail/ZhijieApp](https://marketplace.fresns.cn/open-source/detail/ZhijieApp)
- App 是基于 [Fresns App for WeChat Mini Program](https://github.com/fresns/wechat) 框架版微信小程序二次定制开发，使用微信原生语言，采用 Donut 跨端方案编译为 iOS 和 Android 应用。
- 体验: 扫描下方二维码即可下载
    - iOS App: [https://apps.apple.com/cn/app/知结/id6462404756](https://apps.apple.com/cn/app/%E7%9F%A5%E7%BB%93/id6462404756)
    - Android App: [https://zhijieshequ.com/app/latest.apk](https://zhijieshequ.com/app/latest.apk)

![知结社区 App](https://cdn.fresns.cn/zhijie/app-qrcode.png)

### 微信小程序

- 源码: [https://marketplace.fresns.cn/open-source/detail/ZhijieApp](https://marketplace.fresns.cn/open-source/detail/ZhijieApp)
- 体验: 使用微信扫描下方小程序码

![知结社区小程序](https://cdn.fresns.cn/zhijie/miniprogram.png)

## 使用说明

- 1、下载[代码包](https://github.com/fresns/wechat-moments/releases)；
- 2、解压后使用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)导入项目，项目名称和 AppID 填写你的小程序信息；
- 3、将根目录的 `fresns.example.js` 文件名修改为 `fresns.js`，然后根据里面的描述填写你的配置信息（[Fresns 官方社区 API 密钥，对外公开，所有人可以直接使用](https://discuss.fresns.cn/post/RJ35gFtb)）；
- 4、将你的 `apiHost` 录入到微信配置：公众平台->开发->开发管理->开发设置
    - 服务器域名 `request合法域名`, `uploadFile合法域名`, `downloadFile合法域名`
    - 业务域名
- 5、申请位置信息接口
    - 如果你不需要该功能，忽略下方开通描述，并删除 `app.json` 配置文件中 `"requiredPrivateInfos": ["chooseLocation"]`
    - 公众平台->开发->开发管理->接口设置
    - 申请开通 `wx.chooseLocation` 打开地图选择位置
    - 申请时，可使用编辑器页面截图作为使用场景
- 6、安装配套插件
    - [微信登录](https://marketplace.fresns.cn/open-source/detail/WeChatLogin) 插件，配置小程序密钥信息；
    - [生成分享海报](https://marketplace.fresns.cn/open-source/detail/SharePoster) 插件，配置分享图生成功能；
- 7、使用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)上传代码，提交到微信公众平台。

> 编译为 App 则阅读微信 [Donut](https://dev.weixin.qq.com/docs/) 技术方案的文档。

### 小程序隐私保护指引

- 选中的照片或视频信息：用于`发表附带图片或视频的内容`
- 选中的文件：用于`发表附带文件的内容`
- 选择的位置信息：用于`发表附带位置信息的内容` （未启用 chooseLocation 功能则无需选择该隐私功能）
- 发布内容：用于`发表帖子和评论`
- 剪切板：用于`复制分享链接和帖子内容中的超链接`
- 设备信息：用于`记录互动和错误问题的日志`

## 功能配置

所有频道栏目的命名是读取后台配置，请自行在 Fresns 后台配置，代码中没有写死的名称。

### 命名配置

- `小组自定义名称` 圈子
- `关注用户行为` 关注
- `关注小组行为` 加入
- `关注话题行为` 订阅
- `关注帖子行为` 收藏
- `关注评论行为` 收藏

### 栏目配置

- `关注的小组` 我的圈子
- `关注的话题` 订阅的话题
- `关注的帖子` 收藏夹
- `关注的评论` 收藏夹
- `全部关注的帖子` 关注

### 语言包配置

- 修改
    - `openApp` 在 App 中打开
    - `search` 找人
    - `quote` 转发动态
    - `editorNoGroup` 不发到任何圈子
    - `contentNewList` 动态
    - `contentDigest` 精选
- 新增
    - `hashtagType2` 公司
    - `hashtagType3` 人物
    - `postDetailTitle` 知结动态
    - `commentDetailTitle` 知结评论
    - `tipConnectWeChatMiniProgram` 请在微信小程序里或网站上操作绑定
    - `tipConnectWeChatMiniApp` 请在「知结」App 里操作关联绑定

## 许可协议

Fresns 是根据 [Apache-2.0](https://opensource.org/license/apache-2-0/) 授权的开源软件。
