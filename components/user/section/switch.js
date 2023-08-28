/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsConfig } from '../../../api/tool/function';

Component({
  /** 组件的属性列表 **/
  properties: {
    user: Object,
    defaultValue: String,
  },

  /** 组件的初始数据 **/
  data: {
    fsid: '',
    tabs: {},
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      const tabs = {
        post: await fresnsConfig('post_name'),
        comment: await fresnsConfig('comment_name'),
        likePosts: await fresnsConfig('menu_profile_like_posts'),
      };

      this.setData({
        tabs: tabs,
      });
    },
  },

  /** 组件功能 **/
  methods: {
    onTabsClick: function (e) {
      const user = this.data.user;
      const fsid = user.fsid;

      const value = e.detail.value;

      let pagePath = '';

      switch (value) {
        case 'posts':
          pagePath = '/pages/profile/posts?fsid=' + fsid;
          break;

        case 'comments':
          pagePath = '/pages/profile/comments?fsid=' + fsid;
          break;

        case 'likePosts':
          pagePath = '/pages/profile/likes/posts?fsid=' + fsid;
          break;
      }

      wx.redirectTo({
        url: pagePath,
      });
    },
  },
});
