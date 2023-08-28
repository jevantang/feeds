/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsConfig } from '../../../api/tool/function';

Component({
  /** 组件的属性列表 **/
  properties: {
    defaultValue: String,
  },

  /** 组件的初始数据 **/
  data: {
    tabs: {},
    value: 0,
  },

  /** 组件数据字段监听器 **/
  observers: {
    defaultValue: function (defaultValue) {
      let value = '';

      switch (defaultValue) {
        case 'follow':
          value = 1;
          break;

        case 'nearby':
          value = 2;
          break;

        default:
          value = 0;
      }

      this.setData({
        value: value,
      });
    },
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      const tabs = {
        index: await fresnsConfig('menu_post_name'),
        follow: await fresnsConfig('menu_follow_all_posts'),
        nearby: await fresnsConfig('menu_nearby_posts'),
      };

      this.setData({
        tabs: tabs,
      });
    },
  },

  /** 组件功能 **/
  methods: {
    onTabsClick: function (e) {
      const value = e.detail.value;

      let pagePath = '';

      switch (value) {
        case '1':
          pagePath = '/pages/follows/all-posts';
          break;

        case '2':
          pagePath = '/pages/posts/nearby';
          break;

        default:
          pagePath = '/pages/posts/index';
      }

      wx.redirectTo({
        url: pagePath,
      });
    },
  },
});
