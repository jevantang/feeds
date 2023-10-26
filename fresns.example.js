/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
module.exports = {
  // 应用密钥创建位置: Fresns 后台 -> 应用中心 -> 应用密钥
  // 密钥平台选「WeChat MiniProgram」，类型选「主程 API」
  apiHost: '',
  appId: 'App ID',
  appSecret: 'App Secret',
  email: '', // 管理员邮箱，当程序遇到无法使用的时候，可供用户发送反馈邮件
  clientVersion: '1.0.0', // App 专用，小程序可以删除。你自己构建的版本号，对比后台的版本号，判断是否有新版，后台位置: Fresns 后台 -> 客户端 -> 客户端状态
  deactivateWeChatLogin: 0, // 是否停用微信登录功能，停用后只支持账号密码或验证码登录
  mpId: '', // 小程序原始 ID，编译为「多端应用」时使用，仅小程序无需配置
};
