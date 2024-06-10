/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
const marked = require('./marked.min.js');

Component({
  /** 组件的属性列表 **/
  properties: {
    content: {
      type: String,
      value: '',
    },
  },

  /** 组件的初始数据 **/
  data: {
    html: '',
  },

  /** 组件功能 **/
  methods: {
    renderMarkdown: function (content) {
      if (!content) {
        return;
      }

      // 使用 marked 解析 Markdown 文本
      const parsedContent = marked.parse(content);

      this.setData({
        html: parsedContent,
      });
    },
  },
});
