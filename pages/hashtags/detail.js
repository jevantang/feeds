/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig, fresnsLang } from '../../api/tool/function';
import { callPrevPageFunction } from '../../utils/fresnsUtilities';

let isRefreshing = false;

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
    fsConfig: {},
    fsLang: {},
    // 详情
    hid: null,
    hashtag: null,
    hashtagFormat: null,

    // 帖子
    query: {},
    posts: [],
    page: 1,
    loadingStatus: false,
    loadingTipType: 'none',
    isReachBottom: false,
  },

  /** 监听页面加载 **/
  onLoad: async function (options) {
    this.setData({
      hid: options.hid,
      query: options,
      fsConfig: {
        post_name: await fresnsConfig('post_name'),
        like_hashtag_name: await fresnsConfig('like_hashtag_name'),
        follow_hashtag_name: await fresnsConfig('follow_hashtag_name'),
      },
      fsLang: {
        contentDigest: await fresnsLang('contentDigest'),
        contentNewList: await fresnsLang('contentNewList'),
        contentHotList: await fresnsLang('contentHotList'),
        contentDigest: await fresnsLang('contentDigest'),
      },
    });

    const hashtagDetailRes = await fresnsApi.hashtag.hashtagDetail({
      hid: options.hid,
    });

    if (hashtagDetailRes.code === 0) {
      this.setData({
        title: hashtagDetailRes.data.detail.hname,
        hashtag: hashtagDetailRes.data.detail,
        hashtagFormat: await fresnsConfig('hashtag_format'),
      });

      wx.setNavigationBarTitle({
        title: hashtagDetailRes.data.detail.hname,
      });

      // 替换上一页数据
      // mixins/fresnsInteraction.js
      callPrevPageFunction('onChangeHashtag', hashtagDetailRes.data.detail);
    }

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
        console.log('热门');

        resultRes = await fresnsApi.post.postList({
          hid: decodeURI(this.data.hid),
          createdDate: 'year',
          orderType: 'comment',
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
        break;

      case '2':
        console.log('精选');

        resultRes = await fresnsApi.post.postList({
          hid: decodeURI(this.data.hid),
          allDigest: 1,
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
        break;

      default:
        console.log('动态');

        resultRes = await fresnsApi.post.postList({
          hid: decodeURI(this.data.hid),
          orderType: 'commentTime',
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
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
    // 防抖判断
    if (isRefreshing) {
      wx.stopPullDownRefresh();
      return;
    }

    isRefreshing = true;

    this.setData({
      posts: [],
      page: 1,
      loadingTipType: 'none',
      isReachBottom: false,
    });

    await this.loadFresnsPageData();

    wx.stopPullDownRefresh();
    setTimeout(() => {
      isRefreshing = false;
    }, 5000); // 防抖时间 5 秒
  },

  /** 监听用户上拉触底 **/
  onReachBottom: async function () {
    await this.loadFresnsPageData();
  },

  // 菜单切换
  onTabsClick: async function (e) {
    const value = e.detail.value;

    console.log('onTabsClick', e, value);

    this.setData({
      value: value,
      posts: [],
      page: 1,
      loadingTipType: 'none',
      isReachBottom: false,
    });

    await this.loadFresnsPageData();
  },

  // 关注
  onClickHashtagFollow: async function () {
    const hashtag = this.data.hashtag;
    const initialHashtag = JSON.parse(JSON.stringify(this.data.hashtag)); // 拷贝一个小组初始数据

    const titleText = await fresnsLang('leave') + ': ' + hashtag.hname;
    const cancelText = await fresnsLang('cancel');
    const confirmText = await fresnsLang('confirm');

    const userResponse = await new Promise((resolve) => {
      if (hashtag.interaction.followStatus) {
        wx.showModal({
          title: titleText,
          cancelText: cancelText,
          confirmText: confirmText,
          success: (res) => {
            resolve(res.cancel); // 返回用户的选择
          },
        });
      } else {
        resolve(false); // 如果不需要显示模态框，返回 false
      }
    });

    if (userResponse) {
      return; // 如果用户选择了取消，结束函数执行
    }

    if (hashtag.interaction.followStatus) {
      hashtag.interaction.followStatus = false; // 取消关注
      hashtag.followCount = hashtag.followCount ? hashtag.followCount - 1 : hashtag.followCount; // 计数减一
    } else {
      hashtag.interaction.followStatus = true; // 关注
      hashtag.followCount = hashtag.followCount + 1; // 计数加一

      if (hashtag.interaction.blockStatus) {
        hashtag.interaction.blockStatus = false; // 取消屏蔽
        hashtag.blockCount = hashtag.blockCount ? hashtag.blockCount - 1 : hashtag.blockCount; // 计数减一
      }
    }

    // mixins/fresnsInteraction.js
    callPageFunction('onChangeHashtag', hashtag);

    const resultRes = await fresnsApi.user.userMark({
      interactionType: 'follow',
      markType: 'hashtag',
      fsid: hashtag.hid,
    });

    // 接口请求失败，数据还原
    if (resultRes.code != 0) {
      callPageFunction('onChangeHashtag', initialHashtag);
    }
  },
});
