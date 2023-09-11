/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { callPageFunction, truncateText } from '../../utils/fresnsUtilities';
import { fresnsConfig, fresnsLang } from '../../api/tool/function';

Component({
  /** 组件的属性列表 **/
  properties: {
    group: Object,
    currentCategoryGid: String,
  },

  /** 组件的初始数据 **/
  data: {
    postName: '帖子',
    digestName: '精华',
    description: '',
  },

  /** 组件数据字段监听器 **/
  observers: {
    group: function (group) {
      if (!group) {
        return;
      }

      this.setData({
        description: truncateText(group.description, 56, true),
      });
    },
  },

  /** 组件功能 **/
  methods: {
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
      callPageFunction('onChangeGroup', group);

      const resultRes = await fresnsApi.user.userMark({
        interactionType: 'follow',
        markType: 'group',
        fsid: group.gid,
      });

      // 接口请求失败，数据还原
      if (resultRes.code != 0) {
        callPageFunction('onChangeGroup', initialGroup);
      }
    },

    // onClickToDetail
    onClickToDetail: function (e) {
      const gid = e.currentTarget.dataset.gid;
  
      if (!gid) {
        return;
      }
  
      wx.navigateTo({
        url: '/pages/groups/detail?gid=' + gid,
      });
    },
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      this.setData({
        postName: await fresnsConfig('post_name'),
        digestName: await fresnsLang('contentDigest'),
      });
    },
  },
});
