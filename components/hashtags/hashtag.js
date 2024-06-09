/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsConfig, fresnsLang } from '../../sdk/helpers/configs';
import { truncateText } from '../../sdk/utilities/toolkit';

Component({
  /** 组件的属性列表 **/
  properties: {
    viewType: {
      type: String,
      value: 'list', // list or detail
    },
    hashtag: {
      type: Object,
      value: null,
    },
  },

  /** 组件的初始数据 **/
  data: {
    postName: '帖子',
    digestName: '精华',
    modifierCompleted: '已',
    name: '',
    description: '',
  },

  /** 组件数据字段监听器 **/
  observers: {
    hashtag: async function (hashtag) {
      if (!hashtag) {
        return;
      }

      let name = hashtag.name;
      if (this.data.viewType == 'detail') {
        const hashtagFormat = await fresnsConfig('hashtag_format');
        let newName = '#' + hashtag.name;
        name = hashtagFormat == 1 ? newName : newName + '#';
      }

      let description = hashtag.description;
      if (this.data.viewType == 'list') {
        description = truncateText(hashtag.description, 50, true);
      }

      this.setData({
        name: name,
        description: description,
      });
    },
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      this.setData({
        postName: await fresnsConfig('post_name'),
        digestName: await fresnsLang('contentDigest'),
        modifierCompleted: await fresnsLang('modifierCompleted'),
      });
    },
  },

  /** 组件功能 **/
  methods: {
    // onClickToDetail
    onClickToDetail: function (e) {
      if (this.data.viewType == 'detail') {
        return;
      }

      const htid = e.currentTarget.dataset.htid;

      if (!htid) {
        return;
      }

      wx.navigateTo({
        url: '/pages/hashtags/detail?htid=' + htid,
      });
    },

    // 关注
    onClickHashtagFollow: async function () {
      const hashtag = this.data.hashtag;
      const initialHashtag = JSON.parse(JSON.stringify(this.data.hashtag)); // 拷贝一个小组初始数据

      if (hashtag.interaction.followStatus) {
        hashtag.interaction.followStatus = false; // 取消关注
      } else {
        hashtag.interaction.followStatus = true; // 关注

        if (hashtag.interaction.blockStatus) {
          hashtag.interaction.blockStatus = false; // 取消屏蔽
        }
      }

      this.setData({
        hashtag: hashtag,
      });

      const resultRes = await fresnsApi.user.mark({
        markType: 'follow',
        type: 'hashtag',
        fsid: hashtag.htid,
      });

      // 接口请求失败，数据还原
      if (resultRes.code != 0) {
        this.setData({
          hashtag: initialHashtag,
        });
      }
    },
  },
});
