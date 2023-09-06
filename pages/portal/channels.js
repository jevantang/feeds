/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig, fresnsLang } from '../../api/tool/function';

Page({
  /** 外部 mixin 引入 **/
  mixins: [
    require('../../mixins/globalConfig'),
    require('../../mixins/checkSiteMode'),
    require('../../mixins/fresnsExtensions'),
  ],

  /** 页面的初始数据 **/
  data: {
    title: null,
    logo: null,
    fresnsConfig: null,

    // 置顶帖子
    stickyPosts: [],

    // 扩展频道
    channels: [],

    // fresns 赞助商配置
    sponsorAsset: 'https://cdn.fresns.cn/sponsor/images/',
    sponsorData: [],
  },

  /** 监听页面加载 **/
  onLoad: async function () {
    wx.setNavigationBarTitle({
      title: await fresnsLang('discover'),
    });

    // 置顶帖子
    const resultRes = await fresnsApi.post.postList({
      stickyState: 3,
      whitelistKeys: 'pid,title,content',
    });

    let stickyPosts = [];
    if (resultRes.code === 0) {
      resultRes.data.list.forEach((post) => {
        post.shortContent = post.content.substring(0, 20);
        stickyPosts.push(post);
      });
    }

    // 频道扩展
    const resultChannels = await fresnsApi.global.globalChannels();

    let channels = [];
    if (resultChannels.code === 0) {
      channels = resultChannels.data;
    }

    if (this.data.sponsor) {
      wx.request({
        url: 'https://cdn.fresns.cn/sponsor/sponsors.json',
        success: (res) => {
          if (res.statusCode !== 200) {
            return;
          }

          this.setData({
            sponsorData: res.data,
          });
        },
      });
    }

    this.setData({
      title: await fresnsLang('discover'),
      logo: await fresnsConfig('site_logo'),
      fresnsConfig: await fresnsConfig(),
      stickyPosts: stickyPosts,
      channels: channels,
    });
  },

  /** 右上角菜单-分享给好友 **/
  onShareAppMessage: function () {
    return {
      title: this.data.title,
    };
  },

  /** 右上角菜单-分享到朋友圈 **/
  onShareTimeline: function () {
    return {
      title: this.data.title,
    };
  },

  /** 右上角菜单-收藏 **/
  onAddToFavorites: function () {
    return {
      title: this.data.title,
    };
  },
});
