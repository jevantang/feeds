'use strict';
function e(t) {
    '@babel/helpers - typeof';
    return (e =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
            ? function (e) {
                  return typeof e;
              }
            : function (e) {
                  return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
              })(t);
}
function t(e, t, o) {
    return (
        (t = n(t)),
        t in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : (e[t] = o),
        e
    );
}
function n(t) {
    var n = o(t, 'string');
    return 'symbol' === e(n) ? n : String(n);
}
function o(t, n) {
    if ('object' !== e(t) || null === t) return t;
    var o = t[Symbol.toPrimitive];
    if (void 0 !== o) {
        var i = o.call(t, n || 'default');
        if ('object' !== e(i)) return i;
        throw new TypeError('@@toPrimitive must return a primitive value.');
    }
    return ('string' === n ? String : Number)(t);
}
/*!
 * mp-html v2.4.1
 * https://github.com/jin-yufeng/mp-html
 *
 * Released under the MIT license
 * Author: Jin Yufeng
 */
var i = require('./parser'),
    r = [require('./markdown/index.js'), require('./highlight/index.js')];
Component({
    data: { nodes: [] },
    properties: {
        markdown: Boolean,
        containerStyle: String,
        content: {
            type: String,
            value: '',
            observer: function (e) {
                this.setContent(e);
            },
        },
        copyLink: { type: Boolean, value: !0 },
        domain: String,
        errorImg: String,
        lazyLoad: Boolean,
        loadingImg: String,
        pauseVideo: { type: Boolean, value: !0 },
        previewImg: { type: Boolean, value: !0 },
        scrollTable: Boolean,
        selectable: null,
        setTitle: { type: Boolean, value: !0 },
        showImgMenu: { type: Boolean, value: !0 },
        tagStyle: Object,
        useAnchor: null,
    },
    created: function () {
        this.plugins = [];
        for (var e = r.length; e--; ) this.plugins.push(new r[e](this));
    },
    detached: function () {
        this._hook('onDetached');
    },
    methods: {
        in: function (e, t, n) {
            e && t && n && (this._in = { page: e, selector: t, scrollTop: n });
        },
        navigateTo: function (e, n) {
            var o = this;
            return (
                (e = this._ids[decodeURI(e)] || e),
                new Promise(function (i, r) {
                    if (!o.data.useAnchor) return void r(Error('Anchor is disabled'));
                    var a = wx
                        .createSelectorQuery()
                        .in(o._in ? o._in.page : o)
                        .select((o._in ? o._in.selector : '._root') + (e ? ''.concat('>>>', '#').concat(e) : ''))
                        .boundingClientRect();
                    o._in
                        ? a.select(o._in.selector).scrollOffset().select(o._in.selector).boundingClientRect()
                        : a.selectViewport().scrollOffset(),
                        a.exec(function (e) {
                            if (!e[0]) return void r(Error('Label not found'));
                            var a =
                                e[1].scrollTop +
                                e[0].top -
                                (e[2] ? e[2].top : 0) +
                                (n || parseInt(o.data.useAnchor) || 0);
                            o._in
                                ? o._in.page.setData(t({}, o._in.scrollTop, a))
                                : wx.pageScrollTo({ scrollTop: a, duration: 300 }),
                                i();
                        });
                })
            );
        },
        getText: function (e) {
            var t = '';
            return (
                (function e(n) {
                    for (var o = 0; o < n.length; o++) {
                        var i = n[o];
                        if ('text' === i.type) t += i.text.replace(/&amp;/g, '&');
                        else if ('br' === i.name) t += '\n';
                        else {
                            var r =
                                'p' === i.name ||
                                'div' === i.name ||
                                'tr' === i.name ||
                                'li' === i.name ||
                                ('h' === i.name[0] && i.name[1] > '0' && i.name[1] < '7');
                            r && t && '\n' !== t[t.length - 1] && (t += '\n'),
                                i.children && e(i.children),
                                r && '\n' !== t[t.length - 1]
                                    ? (t += '\n')
                                    : ('td' !== i.name && 'th' !== i.name) || (t += '\t');
                        }
                    }
                })(e || this.data.nodes),
                t
            );
        },
        getRect: function () {
            var e = this;
            return new Promise(function (t, n) {
                wx.createSelectorQuery()
                    .in(e)
                    .select('._root')
                    .boundingClientRect()
                    .exec(function (e) {
                        return e[0] ? t(e[0]) : n(Error('Root label not found'));
                    });
            });
        },
        pauseMedia: function () {
            for (var e = (this._videos || []).length; e--; ) this._videos[e].pause();
        },
        setPlaybackRate: function (e) {
            this.playbackRate = e;
            for (var t = (this._videos || []).length; t--; ) this._videos[t].playbackRate(e);
        },
        setContent: function (e, t) {
            var n = this;
            (this.imgList && t) || (this.imgList = []), (this._videos = []);
            var o = {},
                r = new i(this).parse(e);
            if (t) for (var a = this.data.nodes.length, s = r.length; s--; ) o['nodes['.concat(a + s, ']')] = r[s];
            else o.nodes = r;
            if (
                (this.setData(o, function () {
                    n._hook('onLoad'), n.triggerEvent('load');
                }),
                this.data.lazyLoad || this.imgList._unloadimgs < this.imgList.length / 2)
            ) {
                var l = 0,
                    c = function e(t) {
                        (t && t.height) || (t = {}),
                            t.height === l
                                ? n.triggerEvent('ready', t)
                                : ((l = t.height),
                                  setTimeout(function () {
                                      n.getRect().then(e).catch(e);
                                  }, 350));
                    };
                this.getRect().then(c).catch(c);
            } else
                this.imgList._unloadimgs ||
                    this.getRect()
                        .then(function (e) {
                            n.triggerEvent('ready', e);
                        })
                        .catch(function () {
                            n.triggerEvent('ready', {});
                        });
        },
        _hook: function (e) {
            for (var t = r.length; t--; ) this.plugins[t][e] && this.plugins[t][e]();
        },
        _add: function (e) {
            e.detail.root = this;
        },
    },
});
