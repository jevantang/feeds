/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig } from '../../api/tool/function';
import { globalInfo } from '../../utils/fresnsGlobalInfo';

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
    currentCategoryGid: null,
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

      const hashtagCompany = {
        gid: 'hashtag-company',
        gname: '公司',
        description: '',
        cover: '',
        banner: '',
      };
      const hashtagStar = {
        gid: 'hashtag-star',
        gname: '人物',
        description: '',
        cover: '',
        banner: '',
      };

      categories.splice(2, 0, hashtagCompany, hashtagStar);
    }

    if (globalInfo.userLogin) {
      const myGroups = {
        gid: 'fresns-my-groups',
        gname: '我的圈子',
        description: '',
        cover: '',
        banner: '',
      };

      categories.unshift(myGroups);
      initialGid = 'fresns-my-groups';
    }

    this.setData({
      title: await fresnsConfig('menu_group_title'),
      logo: await fresnsConfig('site_logo'),
      currentCategoryGid: initialGid,
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
      currentCategoryGid: gid,
    });

    if (this.data.isReachBottom) {
      this.setData({
        loadingStatus: false,
      });

      return;
    }

    const whitelistKeys = 'gid,url,type,gname,description,cover,postCount,postDigestCount,followCount,interaction';

    let resultRes = {};

    switch (gid) {
      case 'fresns-my-groups':
        resultRes = await fresnsApi.user.userMarkList({
          uidOrUsername: globalInfo.uid,
          markType: 'follow',
          listType: 'groups',
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
        break;

      default:
        resultRes = await fresnsApi.group.groupList({
          gid: gid,
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
    }

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
