/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../sdk/services/api';
import { fresnsConfig, fresnsLang } from '../../sdk/helpers/configs';
import { truncateText } from '../../sdk/utilities/toolkit';

Component({
  /** 组件的属性列表 **/
  properties: {
    viewType: {
      type: String,
      value: 'list', // list or detail
    },
    group: {
      type: Object,
      value: null,
    },
  },

  /** 组件的初始数据 **/
  data: {
    postName: '帖子',
    digestName: '精华',
    modifierCompleted: '已',
    description: '',
  },

  /** 组件数据字段监听器 **/
  observers: {
    group: function (group) {
      if (!group) {
        return;
      }

      let description = group.description;
      if (this.data.viewType == 'list') {
        description = truncateText(group.description, 50, true);
      }

      this.setData({
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

      const gid = e.currentTarget.dataset.gid;

      if (!gid) {
        return;
      }

      wx.navigateTo({
        url: '/pages/groups/detail?gid=' + gid,
      });
    },

    // 关注
    onClickGroupFollow: async function () {
      const group = this.data.group;
      const initialGroup = JSON.parse(JSON.stringify(this.data.group)); // 拷贝一个小组初始数据

      if (group.interaction.followStatus) {
        group.interaction.followStatus = false; // 取消关注
      } else {
        group.interaction.followStatus = true; // 关注

        if (group.interaction.blockStatus) {
          group.interaction.blockStatus = false; // 取消屏蔽
        }
      }

      this.setData({
        group: group,
      });

      const resultRes = await fresnsApi.user.mark({
        markType: 'follow',
        type: 'group',
        fsid: group.gid,
      });

      // 接口请求失败，数据还原
      if (resultRes.code != 0) {
        this.setData({
          group: initialGroup,
        });
      }
    },
  },
});
