/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { fresnsConfig, fresnsLang } from '../../api/tool/function';
import { truncateText, callPrevPageFunction } from '../../utils/fresnsUtilities';

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
    // 详情
    title: null,
    comment: null,
    commentName: null,

    // 评论框
    commentBtnName: null,
    showCommentBox: false,
    nickname: null,

    // 评论列表
    query: {},
    comments: [],
    page: 1,
    loadingStatus: false,
    loadingTipType: 'none',
    isReachBottom: false,
  },

  /** 监听页面加载 **/
  onLoad: async function (options) {
    wx.setNavigationBarTitle({
      title: await fresnsConfig('comment_name'),
    });

    this.setData({
      query: options,
      commentName: await fresnsConfig('comment_name'),
    });

    const commentDetailRes = await fresnsApi.comment.commentDetail({
      cid: options.cid,
    });

    if (commentDetailRes.code === 0) {
      const userDeactivate = await fresnsLang('userDeactivate');
      const authorAnonymous = await fresnsLang('contentAuthorAnonymous');
      const comment = commentDetailRes.data.detail;

      let commentTitle = truncateText(comment.content, 20);
      let nickname = comment.author.nickname;

      if (!comment.author.status) {
        nickname = userDeactivate;
      } else if (comment.isAnonymous) {
        nickname = authorAnonymous;
      }

      this.setData({
        comment: comment,
        title: nickname + ': ' + commentTitle,
        nickname: nickname,
        commentBtnName: await fresnsConfig('publish_comment_name'),
      });

      // 替换上一页数据
      // mixins/fresnsInteraction.js
      // callPrevPageFunction('onChangeComment', comment);
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

    const commentsRes = await fresnsApi.comment.commentList(
      Object.assign(this.data.query, {
        orderDirection: 'asc',
        whitelistKeys:
          'cid,url,content,contentLength,isBrief,isMarkdown,isAnonymous,isSticky,digestState,createdTimeAgo,editedTimeAgo,likeCount,dislikeCount,commentCount,moreJson,location,files,isCommentPrivate,author.fsid,author.uid,author.username,author.nickname,author.avatar,author.decorate,author.verifiedStatus,author.nicknameColor,author.roleName,author.roleNameDisplay,author.status,author.isPostAuthor,manages,editControls,interaction,replyToPost.pid,replyToComment.cid,replyToComment.content,replyToComment.isAnonymous,replyToComment.createdDatetime,replyToComment.author.nickname,replyToComment.author.status',
        page: this.data.page,
      })
    );

    if (commentsRes.code === 0) {
      const { paginate, list } = commentsRes.data;
      const isReachBottom = paginate.currentPage === paginate.lastPage;
      let tipType = 'none';
      if (isReachBottom) {
        tipType = this.data.comments.length > 0 ? 'page' : 'empty';
      }

      this.setData({
        comments: this.data.comments.concat(list),
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
      comments: [],
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

  // 评论
  onClickCreateComment() {
    this.setData({
      showCommentBox: true,
    });
  },
});
