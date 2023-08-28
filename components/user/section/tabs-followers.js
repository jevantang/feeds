/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsConfig, fresnsLang, fresnsUser } from '../../../api/tool/function';

Component({
  /** 组件的属性列表 **/
  properties: {
    user: Object,
    defaultValue: String,
  },

  /** 组件的初始数据 **/
  data: {
    fresnsUser: null,
    tabs: {},
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      const tabs = {
        followersYouFollow: await fresnsConfig('menu_profile_followers_you_follow'),
        followers: await fresnsConfig('user_follower_name'),
        following: await fresnsLang('userFollowing'),
      };

      this.setData({
        tabs: tabs,
        fresnsUser: await fresnsUser('detail'),
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
        case 'followersYouFollow':
          pagePath = '/pages/profile/interactions/followers-you-follow?fsid=' + fsid;
          break;

        case 'followers':
          pagePath = '/pages/profile/interactions/followers?fsid=' + fsid;
          break;

        case 'following':
          pagePath = '/pages/profile/following/users?fsid=' + fsid;
          break;
      }

      wx.redirectTo({
        url: pagePath,
      });
    },
  },
});
