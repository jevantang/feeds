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
        newContent = newContent.replace(/(?<!\n)\n(?!\n)/g, '\n\n'); // 替换单独的换行
        newContent = newContent.replace(/\n{3,}/g, '\n\n'); // 如果有3个或更多连续的换行，只保留两个

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

        /**
         * 以下处理自有链接
         */
        let matches = [];
        let matchId = 0;

        // 匹配 fresns.cn 和 zhijieshequ.com
        let domainPattern = '(fresns.cn|zhijieshequ.com)';

        // 提取所有链接并替换为占位符
        newContent = newContent.replace(
          new RegExp(
            `(\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]*${domainPattern}[^)]*)\\)|<a\\s+href="(https?:\\/\\/[^"]*${domainPattern}[^"]*)"[^>]*>([^<]+)<\\/a>|(^|[^"])(https?:\\/\\/[^ \\n<]*${domainPattern}[^ \\n<]*))`,
            'gi'
          ),
          (match, p1, p2, p3, p4, p5, p6, p7) => {
            let replacement;
            if (p2 && p3) {
              // 对于 Markdown 格式
              replacement = `<a href="/pages/webview?url=${p3}">${p2}</a>`;
            } else if (p4 && p5) {
              // 对于 <a> 标签格式
              replacement = `<a href="/pages/webview?url=${p4}">${p5}</a>`;
            } else if (p7) {
              // 对于纯 URL 格式
              replacement = `<a href="/pages/webview?url=${p7}">${p7}</a>`;
            }

            matches.push(replacement);
            return `PLACEHOLDER_${matchId++}`;
          }
        );

        // 将占位符替换为原始的链接
        matches.forEach((match, index) => {
          const placeholder = `PLACEHOLDER_${index}`;
          const regex = new RegExp(placeholder, 'g');
          newContent = newContent.replace(regex, match);
        });
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
    onClickToDetail(e) {
      if (this.data.type != 'list') {
        return;
      }

      wx.navigateTo({
        url: '/pages/posts/detail?pid=' + this.data.post.pid,
      });
    },

    triggerComment: function () {
      this.selectComponent('#interactionComponent').onClickCreateComment();
    },
  },
});
