/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { globalInfo } from '../../../utils/fresnsGlobalInfo';
import { fresnsConfig, fresnsUserPanel } from '../../../api/tool/function';

Component({
  /** 组件的属性列表 **/
  properties: {
    activeLabel: String,
  },

  /** 组件的初始数据 **/
  data: {
    value: 'posts',
    list: [
      {
        value: 'posts',
        icon: 'home',
        ariaLabel: '首页',
        pagePath: '/pages/posts/index',
      },
      {
        value: 'groups',
        icon: 'chart-ring-1',
        ariaLabel: '社群',
        pagePath: '/pages/groups/index',
      },
      {
        value: 'editor',
        icon: 'add-rectangle',
        ariaLabel: '发表',
        pagePath: '/pages/editor/index?type=post',
      },
      {
        value: 'channels',
        icon: 'compass',
        ariaLabel: '发现',
        pagePath: '/pages/portal/channels',
      },
      {
        value: 'account',
        icon: 'user',
        ariaLabel: '我的',
        count: 0,
        pagePath: '/pages/account/index',
      },
    ],
    publishPostName: '发表',
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      this.setData({
        value: this.data.activeLabel,
        publishPostName: await fresnsConfig('publish_post_name'),
      });

      if (globalInfo.userLogin) {
        const unreadNotifications = await fresnsUserPanel('unreadNotifications.all');
        const unreadMessages = await fresnsUserPanel('conversations.unreadMessages');

        const count = unreadNotifications + unreadMessages;

        const list = this.data.list;
        const idx = list.findIndex((value) => value.value == 'account');

        list[idx].count = count;

        this.setData({
          list: list,
        });
      }
    },
  },

  /** 组件功能 **/
  methods: {
    onChange(e) {
      const value = e.detail.value;
      const item = this.data.list.find((item) => item.value === value);

      this.setData({
        value: value,
      });

      wx.reLaunch({
        url: item.pagePath,
      });
    },

    // 修改通知消息数
    onChangeUnreadNotifications: function () {
      console.log('onChangeUnreadNotifications tabbar');

      const list = this.data.list;
      const newCount = list[4].count - 1;

      list[4].count = newCount;

      this.setData({
        list: list,
      });
    },

    // 修改私信消息数
    onChangeUnreadMessages: function (count = 1) {
      console.log('onChangeUnreadMessages tabbar', count);

      const list = this.data.list;
      const newCount = list[4].count - count;

      list[4].count = newCount;

      this.setData({
        list: list,
      });
    },
  },
});
