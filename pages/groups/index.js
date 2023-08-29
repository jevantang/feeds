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
    require('../../mixins/fresnsInteraction'),
    require('../../mixins/fresnsExtensions'),
  ],

  /** 页面的初始数据 **/
  data: {
    title: null,
    logo: null,
    // 当前页面数据
    sideBarIndex: 0,
    categories: [],
    groups: [],
    // 下次请求时候的页码，初始值为 1
    page: 1,
    // 加载状态
    loadingStatus: false,
    loadingTipType: 'none',
    isReachBottom: false,
  },

  /** 监听页面加载 **/
  onLoad: async function () {
    const resultRes = await fresnsApi.group.groupCategories();

    let categories = [];
    let initialGid = '';
    if (resultRes.code === 0) {
      const list = resultRes.data.list;
      categories = list;
      initialGid = list && list.length ? list[0].gid : '';
    }

    this.setData({
      title: await fresnsConfig('menu_group_title'),
      logo: await fresnsConfig('site_logo'),
      categories: categories,
    });

    wx.setNavigationBarTitle({
      title: await fresnsConfig('menu_group_title'),
    });

    await this.loadFresnsPageData(initialGid);
  },

  /** 加载列表数据 **/
  loadFresnsPageData: async function (gid = '') {
    if (!gid) {
      return;
    }

    wx.showNavigationBarLoading();

    this.setData({
      loadingStatus: true,
    });

    if (this.data.isReachBottom) {
      this.setData({
        loadingStatus: false,
      });

      return;
    }

    const resultRes = await fresnsApi.group.groupList({
      gid: gid,
      whitelistKeys: 'gid,url,type,gname,description,cover,postCount,postDigestCount,followCount,interaction',
      page: this.data.page,
    });

    if (resultRes.code === 0) {
      const { paginate, list } = resultRes.data;
      const isReachBottom = paginate.currentPage === paginate.lastPage;

      this.setData({
        groups: this.data.groups.concat(list),
        page: this.data.page + 1,
        isReachBottom: isReachBottom,
      });
    }

    this.setData({
      loadingStatus: false,
    });

    wx.hideNavigationBarLoading();
  },

  /** 监听用户上拉触底 **/
  onReachBottom: async function () {
    const categories = this.data.categories;
    const value = this.data.sideBarIndex;
    const gid = categories && categories.length ? categories[value].gid : '';

    await this.loadFresnsPageData(gid);
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

  // onSideBarChange
  onSideBarChange: async function (e) {
    const value = e.detail.value;
    const categories = this.data.categories;
    const gid = categories && categories.length ? categories[value].gid : '';

    this.setData({
      sideBarIndex: value,
      groups: [],
      page: 1,
      loadingTipType: 'none',
      isReachBottom: false,
    });

    await this.loadFresnsPageData(gid);
  },
});
