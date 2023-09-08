/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig, fresnsLang } from '../../api/tool/function';
import { globalInfo } from '../../utils/fresnsGlobalInfo';
import { parseUrlParams } from '../../utils/fresnsUtilities';

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
    userLogin: false,
    tabs: {},
    value: 0,
    // 默认查询条件
    requestQuery: null,
    listRequestQuery: null,
    // 当前页面数据
    posts: [],
    // 下次请求时候的页码，初始值为 1
    page: 1,
    // 加载状态
    loadingStatus: false,
    loadingTipType: 'none',
    isReachBottom: false,
  },

  /** 监听页面加载 **/
  onLoad: async function (options) {
    const tabs = {
      index: await fresnsConfig('menu_post_name'),
      follow: await fresnsConfig('menu_follow_all_posts'),
      new: await fresnsConfig('menu_post_list_name'),
    };

    const requestQuery = parseUrlParams(await fresnsConfig('menu_post_query_config'));
    const listRequestQuery = parseUrlParams(await fresnsConfig('menu_post_list_query_config'));

    this.setData({
      title: await fresnsConfig('site_name'),
      userLogin: globalInfo.userLogin,
      loginTip: await fresnsLang('contentLoginError'),
      loginBtn: await fresnsLang('accountLogin'),
      tabs: tabs,
      requestQuery: requestQuery,
      listRequestQuery: listRequestQuery,
    });

    await this.loadFresnsPageData();
  },

  /** 加载列表数据 **/
  loadFresnsPageData: async function () {
    if (this.data.isReachBottom) {
      return;
    }

    wx.showNavigationBarLoading();

    this.setData({
      loadingStatus: true,
    });

    const type = this.data.value;

    const whitelistKeys = 'pid,url,title,content,contentLength,isBrief,isMarkdown,isAnonymous,stickyState,digestState,createdTimeAgo,editedTimeAgo,likeCount,dislikeCount,commentCount,readConfig,affiliatedUserConfig,moreJson,location,operations,files,group.gid,group.gname,group.cover,author.fsid,author.uid,author.username,author.nickname,author.avatar,author.decorate,author.verifiedStatus,author.nicknameColor,author.roleName,author.roleNameDisplay,author.status,quotedPost.pid,quotedPost.title,quotedPost.content,quotedPost.author.nickname,quotedPost.author.avatar,quotedPost.author.status,previewComments,manages,editControls,interaction';

    let resultRes = {};

    switch (type) {
      case '1':
        if (!globalInfo.userLogin) {
          this.setData({
            loadingStatus: false,
          });

          wx.hideNavigationBarLoading();

          return;
        }

        resultRes = await fresnsApi.post.postFollow({
          type: 'all',
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
        break;

      case '2':
        resultRes = await fresnsApi.post.postList(
          Object.assign(this.data.listRequestQuery, {
            whitelistKeys: whitelistKeys,
            page: this.data.page,
          })
        );
        break;

      default:
        resultRes = await fresnsApi.post.postList(
          Object.assign(this.data.requestQuery, {
            whitelistKeys: whitelistKeys,
            page: this.data.page,
          })
        );
    }

    if (resultRes.code === 0) {
      const { paginate, list } = resultRes.data;
      const isReachBottom = paginate.currentPage === paginate.lastPage;

      const listCount = list.length + this.data.posts.length;

      let tipType = 'none';
      if (isReachBottom) {
        tipType = listCount > 0 ? 'page' : 'empty';
      }

      this.setData({
        posts: this.data.posts.concat(list),
        page: this.data.page + 1,
        loadingTipType: tipType,
        isReachBottom: isReachBottom,
      });
    }

    this.setData({
      loadingStatus: false,
    });

    wx.hideNavigationBarLoading();
  },

  /** 监听用户下拉动作 **/
  onPullDownRefresh: async function () {
    this.setData({
      posts: [],
      page: 1,
      loadingTipType: 'none',
      isReachBottom: false,
    });

    await this.loadFresnsPageData();
    wx.stopPullDownRefresh();
  },

  /** 监听用户上拉触底 **/
  onReachBottom: async function () {
    await this.loadFresnsPageData();
  },

  // 菜单切换
  onTabsClick: async function (e) {
    const value = e.detail.value;

    this.setData({
      value: value,
      posts: [],
      page: 1,
      loadingTipType: 'none',
      isReachBottom: false,
    });

    await this.loadFresnsPageData();
  },
});
