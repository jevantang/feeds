/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig } from '../../api/tool/function';
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
    // 默认查询条件
    requestState: null,
    requestQuery: null,
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
    let requestState = await fresnsConfig('menu_post_list_query_state');
    let requestQuery = parseUrlParams(await fresnsConfig('menu_post_list_query_config'));

    if (requestState === 3) {
      requestQuery = Object.assign(requestQuery, options);
    }

    this.setData({
      title: await fresnsConfig('menu_post_list_title'),
      requestState: requestState,
      requestQuery: requestQuery,
    });

    wx.setNavigationBarTitle({
      title: await fresnsConfig('menu_post_list_title'),
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

    const resultRes = await fresnsApi.post.postList(
      Object.assign(this.data.requestQuery, {
        whitelistKeys:
          'pid,url,title,content,contentLength,isBrief,isMarkdown,isAnonymous,stickyState,digestState,createdTimeAgo,editedTimeAgo,likeCount,dislikeCount,commentCount,readConfig,affiliatedUserConfig,moreJson,location,operations,files,group.gid,group.gname,group.cover,author.fsid,author.uid,author.username,author.nickname,author.avatar,author.decorate,author.verifiedStatus,author.nicknameColor,author.roleName,author.roleNameDisplay,author.status,manages,editControls,interaction,quotedPost.pid,quotedPost.author.status,,quotedPost.author.avatar,quotedPost.author.nickname,quotedPost.isAnonymous,quotedPost.title,quotedPost.content,previewComments.0.author.status,previewComments.0.author.fsid,previewComments.0.author.nickname,previewComments.0.isAnonymous,previewComments.0.content,previewComments.1.author.status,previewComments.1.author.fsid,previewComments.1.author.nickname,previewComments.1.isAnonymous,previewComments.1.content,previewComments.2.author.status,previewComments.2.author.fsid,previewComments.2.author.nickname,previewComments.2.isAnonymous,previewComments.2.content,previewComments.3.author.status,previewComments.3.author.fsid,previewComments.3.author.nickname,previewComments.3.isAnonymous,previewComments.3.content,previewComments.4.author.status,previewComments.4.author.fsid,previewComments.4.author.nickname,previewComments.4.isAnonymous,previewComments.4.content',
        page: this.data.page,
      })
    );

    if (resultRes.code === 0) {
      const { paginate, list } = resultRes.data;
      const isReachBottom = paginate.currentPage === paginate.lastPage;
      let tipType = 'none';
      if (isReachBottom) {
        tipType = this.data.posts.length > 0 ? 'page' : 'empty';
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
    // 不接受客户端传参，包括分页
    if (this.data.requestState == 1) {
      this.setData({
        loadingTipType: this.data.posts.length > 0 ? 'page' : 'empty',
        isReachBottom: true,
      });
      return;
    }

    await this.loadFresnsPageData();
  },
});
