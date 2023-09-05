/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { globalInfo } from '../utils/fresnsGlobalInfo';

module.exports = {
  /** 页面的初始数据 **/
  data: {
    theme: '',
  },

  /** 监听页面加载 **/
  onLoad() {
    const app = getApp();
    // this.themeChanged(globalInfo.theme);
    this.themeChanged('light'); // 该小程序使用的 TDesign 组件库不支持暗黑模式
    app.watchThemeChange(this.themeChanged);
  },

  /** 监听页面退出 **/
  onUnload() {
    getApp().unWatchThemeChange(this.themeChanged);
  },

  /** 主题变更 **/
  themeChanged(theme) {
    this.setData({
      theme,
    });
  },

  /** 后退页面 **/
  navigateBack(delta = 1) {
    wx.navigateBack({
      delta: delta,
      fail() {
        wx.reLaunch({
          url: '/pages/posts/index',
        });
      },
    });
  },
};
