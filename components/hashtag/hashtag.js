/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../../api/api';
import { callPageFunction } from '../../utils/fresnsUtilities';
import { fresnsLang } from '../../api/tool/function';

Component({
  /** 组件的属性列表 **/
  properties: {
    hashtag: Object,
  },

  /** 组件的初始数据 **/
  data: {},

  /** 组件功能 **/
  methods: {
    // 关注
    onClickHashtagFollow: async function () {
      const hashtag = this.data.hashtag;
      const initialHashtag = JSON.parse(JSON.stringify(this.data.hashtag)); // 拷贝一个小组初始数据

      const titleText = (await fresnsLang('leave')) + ': ' + hashtag.hname;
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
  },
});
