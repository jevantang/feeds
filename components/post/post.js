/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { globalInfo } from '../../utils/fresnsGlobalInfo';
import { fresnsLang } from '../../api/tool/function';

Component({
  /** 外部 mixin 引入 **/
  mixins: [require('../../mixins/fresnsExtensions')],

  /** 组件的属性列表 **/
  properties: {
    type: String,
    post: Object,
  },

  /** 组件的初始数据 **/
  data: {
    showPrivacy: false,
    postContent: null,
    contentPreReadInfo: null,
  },

  /** 组件数据字段监听器 **/
  observers: {
    post: async function (post) {
      if (!post) {
        return;
      }

      let newContent = post.content;

      if (newContent) {
        // 处理换行
        newContent = newContent.replace(/(?<!\n)(?<!```[^\n]*)\n(?!\n)/g, '\n\n'); // 替换单独的换行
        newContent = newContent.replace(/\n{3,}/g, '\n\n'); // 如果有 3 个或更多连续的换行，只保留 2 个

        // 匹配话题
        newContent = newContent.replace(
          /<a\s+href="(?:[^"]*\/)?([^"]+)"\s+class="fresns_hashtag"\s+target="_blank">([\s\S]*?)<\/a>/gi,
          '<a href="/pages/hashtags/detail?hid=$1">$2</a>'
        );

        // 匹配艾特
        newContent = newContent.replace(
          /<a\s+href="(?:[^"]*\/)?([^"]+)"\s+class="fresns_mention"\s+target="_blank">@([\s\S]*?)<\/a>/gi,
          '<a href="/pages/profile/posts?fsid=$1">@$2</a>'
        );

        // 替换用户默认首页
        const userHomePath = await globalInfo.userHomePath();
        newContent = newContent.replace('/pages/profile/posts?fsid=', userHomePath);

        // 增加表情图样式
        newContent = newContent.replace(
          /<img\s+src="([^"]+)"\s+class="fresns_sticker"\s+alt="([\s\S]*?)"\s*\/?>/gi,
          '<img src="$1" style="zoom: 0.5" alt="$2"/>'
        );

        // 处理自有链接
        const domainPattern = '(tangjie.me|fresns.cn|zhijieshequ.com)';
        const pureURLPattern = new RegExp(`(^|\\s)(https?:\\/\\/[^ \\n<]*${domainPattern}[^ \\n<]*)`, 'gi');
        const markdownURLPattern = new RegExp(
          `(?<!!)\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]*${domainPattern}[^)]*)\\)`,
          'gi'
        );
        const aTagHrefPattern = new RegExp(`(\\<a[^>]*?)href="((https?:\\/\\/[^"]*${domainPattern}[^"]*))"`, 'gi');

        newContent = newContent.replace(pureURLPattern, '$1<a href="/pages/webview?url=$2">$2</a>');
        newContent = newContent.replace(markdownURLPattern, '<a href="/pages/webview?url=$2">$1</a>');
        newContent = newContent.replace(aTagHrefPattern, '$1href="/pages/webview?url=$2"');
      }

      this.setData({
        postContent: newContent,
      });
    },
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      this.setData({
        contentPreReadInfo: await fresnsLang('contentPreReadInfo'),
      });
    },
  },

  /** 组件功能 **/
  methods: {
    // 进入详情页
    onClickToDetail(e) {
      if (this.data.type != 'list') {
        return;
      }

      wx.navigateTo({
        url: '/pages/posts/detail?pid=' + this.data.post.pid,
      });
    },

    // 用户点击链接
    onClickContentLink(e) {
      const link = e.detail.href;

      if (link.startsWith('/pages/webview')) {
        return;
      }

      // 触发复制功能，判断隐私授权
      if (wx.canIUse('getPrivacySetting')) {
        wx.getPrivacySetting({
          success: (res) => {
            if (res.needAuthorization) {
              // 需要弹出隐私协议
              this.setData({
                showPrivacy: true,
              });
            }
          },
        });
      }
    },

    // 发表评论事件
    triggerComment: function () {
      this.selectComponent('#interactionComponent').onClickCreateComment();
    },
  },
});
