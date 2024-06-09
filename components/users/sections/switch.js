/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsConfig, fresnsLang } from '../../../sdk/helpers/configs';
import { fresnsAuth } from '../../../sdk/helpers/profiles';

Component({
  /** 组件的属性列表 **/
  properties: {
    user: {
      type: Object,
      value: null,
    },
    activeLabel: {
      type: String,
      value: null,
    },
  },

  /** 组件的初始数据 **/
  data: {
    tabs: [],
    isMe: true,
  },

  /** 组件数据字段监听器 **/
  observers: {
    user: async function (user) {
      if (!user) {
        return;
      }

      const tabs = {
        followersYouFollow: await fresnsConfig('profile_followers_you_follow_name'),
        following: await fresnsLang('userFollowing'),
        followers: user.interaction.followUserTitle,
      };

      this.setData({
        tabs: tabs,
        isMe: fresnsAuth.uid == user.uid,
      });
    },
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
    },
  },

  /** 组件功能 **/
  methods: {
    onTabsClick: function (e) {
      const user = this.data.user;
      const fsid = user.fsid;
      const type = e.currentTarget.dataset.type;

      let pagePath = '';

      switch (type) {
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
