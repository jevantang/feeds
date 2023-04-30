'use strict';
function t(e) {
    '@babel/helpers - typeof';
    return (t =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
            ? function (t) {
                  return typeof t;
              }
            : function (t) {
                  return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
              })(e);
}
function e(t, e, i) {
    return (
        (e = r(e)),
        e in t ? Object.defineProperty(t, e, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : (t[e] = i),
        t
    );
}
function r(e) {
    var r = i(e, 'string');
    return 'symbol' === t(r) ? r : String(r);
}
function i(e, r) {
    if ('object' !== t(e) || null === e) return e;
    var i = e[Symbol.toPrimitive];
    if (void 0 !== i) {
        var o = i.call(e, r || 'default');
        if ('object' !== t(o)) return o;
        throw new TypeError('@@toPrimitive must return a primitive value.');
    }
    return ('string' === r ? String : Number)(e);
}
Component({
    data: { ctrl: {}, isiOS: wx.getSystemInfoSync().system.includes('iOS') },
    properties: { childs: Array, opts: Array },
    options: { addGlobalClass: !0 },
    attached: function () {
        this.triggerEvent('add', this, { bubbles: !0, composed: !0 });
    },
    methods: {
        copyCode: function (t) {
            wx.showActionSheet({
                itemList: ['复制代码'],
                success: function () {
                    return wx.setClipboardData({ data: t.currentTarget.dataset.content });
                },
            });
        },
        noop: function () {},
        getNode: function (t) {
            try {
                for (var e = t.split('_'), r = this.data.childs[e[0]], i = 1; i < e.length; i++) r = r.children[e[i]];
                return r;
            } catch (t) {
                return { text: '', attrs: {}, children: [] };
            }
        },
        play: function (t) {
            if ((this.root.triggerEvent('play'), this.root.data.pauseVideo)) {
                for (var e = !1, r = t.target.id, i = this.root._videos.length; i--; )
                    this.root._videos[i].id === r ? (e = !0) : this.root._videos[i].pause();
                if (!e) {
                    var o = wx.createVideoContext(r, this);
                    (o.id = r),
                        this.root.playbackRate && o.playbackRate(this.root.playbackRate),
                        this.root._videos.push(o);
                }
            }
        },
        imgTap: function (t) {
            var e = this.getNode(t.target.dataset.i);
            if (e.a) return this.linkTap(e.a);
            if (!e.attrs.ignore && (this.root.triggerEvent('imgtap', e.attrs), this.root.data.previewImg)) {
                var r = this.root.imgList[e.i];
                wx.previewImage({ showmenu: this.root.data.showImgMenu, current: r, urls: this.root.imgList });
            }
        },
        imgLoad: function (t) {
            var r,
                i = t.target.dataset.i,
                o = this.getNode(i);
            o.w
                ? ((this.data.opts[1] && !this.data.ctrl[i]) || -1 === this.data.ctrl[i]) && (r = 1)
                : (r = t.detail.width),
                r && this.setData(e({}, 'ctrl.' + i, r)),
                this.checkReady();
        },
        checkReady: function () {
            var t = this;
            this.root.data.lazyLoad ||
                ((this.root.imgList._unloadimgs -= 1),
                this.root.imgList._unloadimgs ||
                    setTimeout(function () {
                        t.root
                            .getRect()
                            .then(function (e) {
                                t.root.triggerEvent('ready', e);
                            })
                            .catch(function () {
                                t.root.triggerEvent('ready', {});
                            });
                    }, 350));
        },
        linkTap: function (t) {
            var e = t.currentTarget ? this.getNode(t.currentTarget.dataset.i) : {},
                r = e.attrs || t,
                i = r.href;
            this.root.triggerEvent('linktap', Object.assign({ innerText: this.root.getText(e.children || []) }, r)),
                i &&
                    ('#' === i[0]
                        ? this.root.navigateTo(i.substring(1)).catch(function () {})
                        : i.split('?')[0].includes('://')
                        ? this.root.data.copyLink &&
                          wx.setClipboardData({
                              data: i,
                              success: function () {
                                  return wx.showToast({ title: '链接已复制' });
                              },
                          })
                        : wx.navigateTo({
                              url: i,
                              fail: function () {
                                  wx.switchTab({ url: i, fail: function () {} });
                              },
                          }));
        },
        mediaError: function (t) {
            var r = t.target.dataset.i,
                i = this.getNode(r);
            if ('video' === i.name || 'audio' === i.name) {
                var o = (this.data.ctrl[r] || 0) + 1;
                if ((o > i.src.length && (o = 0), o < i.src.length)) return this.setData(e({}, 'ctrl.' + r, o));
            } else 'img' === i.name && (this.data.opts[2] && this.setData(e({}, 'ctrl.' + r, -1)), this.checkReady());
            this.root && this.root.triggerEvent('error', { source: i.name, attrs: i.attrs, errMsg: t.detail.errMsg });
        },
    },
});
