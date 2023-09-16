/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig, fresnsLang, fresnsCodeMessage } from '../../api/tool/function';
import { callPrevPageFunction } from '../../utils/fresnsUtilities';

let isRefreshing = false;

Page({
  /** 外部 mixin 引入 **/
  mixins: [
    require('../../mixins/globalConfig'),
    require('../../mixins/checkSiteMode'),
    require('../../mixins/fresnsExtensions'),
    require('../../mixins/fresnsInteraction'),
    require('../../mixins/fresnsExtensions'),
  ],

  /** 页面的初始数据 **/
  data: {
    title: null,
    fsConfig: {},
    fsLang: {},
    // 详情
    gid: null,
    group: null,
    extensions: [],
    viewContentTip: '',
    showPublishBtn: false,

    // 置顶帖子
    tabs: {},
    value: 0,

    // 帖子
    stickyPosts: [],
    query: {},
    posts: [],
    page: 1,
    loadingStatus: false,
    loadingTipType: 'none',
    isReachBottom: false,
  },

  /** 监听页面加载 **/
  onLoad: async function (options) {
    const groupDetailRes = await fresnsApi.group.groupDetail({
      gid: options.gid,
    });

    if (groupDetailRes.code === 0) {
      this.setData({
        title: groupDetailRes.data.detail.gname,
        group: groupDetailRes.data.detail,
        extensions: groupDetailRes.data.items.extensions,
        showPublishBtn: groupDetailRes.data.detail.publishRule.allowPost,
      });

      wx.setNavigationBarTitle({
        title: groupDetailRes.data.detail.gname,
      });

      // 替换上一页数据
      // mixins/fresnsInteraction.js
      callPrevPageFunction('onChangeGroup', groupDetailRes.data.detail);
    }

    const resultRes = await fresnsApi.post.postList({
      gid: options.gid,
      stickyState: 2,
      whitelistKeys: 'pid,title,content',
    });

    let stickyPosts = [];
    if (resultRes.code === 0) {
      resultRes.data.list.forEach((post) => {
        post.shortContent = post.content.substring(0, 20);
        stickyPosts.push(post);
      });
    }

    this.setData({
      gid: options.gid,
      query: options,
      stickyPosts: stickyPosts,
      fsConfig: {
        post_name: await fresnsConfig('post_name'),
        like_group_name: await fresnsConfig('like_group_name'),
        follow_group_name: await fresnsConfig('follow_group_name'),
      },
      fsLang: {
        contentDigest: await fresnsLang('contentDigest'),
        errorUnavailable: await fresnsLang('errorUnavailable'),
        contentNewList: await fresnsLang('contentNewList'),
        contentHotList: await fresnsLang('contentHotList'),
        contentDigest: await fresnsLang('contentDigest'),
      },
      viewContentTip: await fresnsCodeMessage('37103'),
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

    const whitelistKeys = 'pid,url,title,content,contentLength,isBrief,isMarkdown,isAnonymous,stickyState,digestState,createdTimeAgo,editedTimeAgo,likeCount,dislikeCount,commentCount,readConfig,affiliatedUserConfig,moreJson,location,operations,files,author.fsid,author.uid,author.username,author.nickname,author.avatar,author.decorate,author.verifiedStatus,author.nicknameColor,author.roleName,author.roleNameDisplay,author.status,quotedPost.pid,quotedPost.title,quotedPost.content,quotedPost.author.nickname,quotedPost.author.avatar,quotedPost.author.status,previewComments,manages,editControls,interaction';

    let resultRes = {};

    switch (type) {
      case '1':
        console.log('热门');

        resultRes = await fresnsApi.post.postList({
          gid: this.data.gid,
          createdDays: 3,
          orderType: 'comment',
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
        break;

      case '2':
        console.log('精选');

        resultRes = await fresnsApi.post.postList({
          gid: this.data.gid,
          allDigest: 1,
          whitelistKeys: whitelistKeys,
          page: this.data.page,
        });
        break;

      default:
        console.log('动态');

        resultRes = await fresnsApi.post.postList({
          gid: this.data.gid,
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

  // 关注
  onClickGroupFollow: async function () {
    const group = this.data.group;
    const initialGroup = JSON.parse(JSON.stringify(this.data.group)); // 拷贝一个小组初始数据

    const titleText = await fresnsLang('leave') + ': ' + group.gname;
    const cancelText = await fresnsLang('cancel');
    const confirmText = await fresnsLang('confirm');

    const userResponse = await new Promise((resolve) => {
      if (group.interaction.followStatus) {
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

    if (group.interaction.followStatus) {
      group.interaction.followStatus = false; // 取消关注
      group.followCount = group.followCount ? group.followCount - 1 : group.followCount; // 计数减一
    } else {
      group.interaction.followStatus = true; // 关注
      group.followCount = group.followCount + 1; // 计数加一

      if (group.interaction.blockStatus) {
        group.interaction.blockStatus = false; // 取消屏蔽
        group.blockCount = group.blockCount ? group.blockCount - 1 : group.blockCount; // 计数减一
      }
    }

    // mixins/fresnsInteraction.js
    this.onChangeGroup(group);

    const resultRes = await fresnsApi.user.userMark({
      interactionType: 'follow',
      markType: 'group',
      fsid: group.gid,
    });

    // 接口请求失败，数据还原
    if (resultRes.code != 0) {
      this.onChangeGroup(initialGroup);
    }
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

  // 发表
  onClickPublish() {
    const group = this.data.group;

    wx.navigateTo({
      url: '/pages/editor/index?type=post' + '&postGid=' + group.gid,
    });
  },
});
