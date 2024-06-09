/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../sdk/services/api';
import { fresnsConfig, fresnsLang } from '../../sdk/helpers/configs';
import { fresnsViewProfilePath } from '../../sdk/helpers/profiles';

Page({
  /** 外部 mixin 引入 **/
  mixins: [require('../../mixins/common')],

  /** 页面的初始数据 **/
  data: {
    title: null,
    fresnsConfig: null,
    fresnsLang: null,
    userProfilePath: null,

    // 搜索
    users: [],

    inputShowed: false,
    inputVal: '',
    isFocus: false,
  },

  /** 监听页面加载 **/
  onLoad: async function () {
    this.setData({
      title: await fresnsLang('discover', '发现'),
      fresnsConfig: await fresnsConfig(),
      fresnsLang: {
        search: await fresnsLang('search'),
        cancel: await fresnsLang('cancel'),
      },
      userProfilePath: await fresnsViewProfilePath(),
    });
  },

  showInput() {
    this.setData({
      inputShowed: true,
    });
  },
  blurInput() {
    this.setData({
      isFocus: false,
    });
  },
  hideInput() {
    this.setData({
      inputVal: '',
      inputShowed: false,

      users: [],
    });
  },
  clearInput() {
    this.setData({
      inputVal: '',

      users: [],
    });
  },
  inputTyping(e) {
    this.setData({
      inputVal: e.detail.value,
      isFocus: true,
    });
  },

  confirmSearch: async function () {
    const searchKey = this.data.inputVal;

    const resultRes = await fresnsApi.common.inputTips({
      type: 'user',
      key: searchKey,
    });

    if (resultRes.code != 0) {
      return;
    }

    this.setData({
      users: resultRes.data,
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
