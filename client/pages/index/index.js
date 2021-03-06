/*
 * 酱茄小程序开源版 v1.1.8
 * Author: 酱茄
 * Help document: https://www.jiangqie.com/ky
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 www.jiangqie.com All rights reserved.
 */

const Constants = require('../../utils/constants');
const Api = require('../../utils/api.js');
const Rest = require('../../utils/rest');
const hitokoto = require('../../utils/hitokoto.js')

Page({
    data: {
        logo: '',

        background: '',

        //顶部导航
        topNav: [{
            id: 0,
            name: '推荐'
        }],
        currentTab: 0, //预设当前项的值

        //幻灯片
        slide: [],

        //图片导航
        iconNav: [],

        //热门文章
        hot: [],

        //热门tab
        postsLast: [],
        loaddingLast: false,
        pullUpOnLast: true,

        //其他tab
        posts: [],
        loadding: false,
        pullUpOn: true,

        //列表模式
        listMode: 3,
    },

    onLoad: function (options) {
        let that = this;

        //获取配置
        Rest.get(Api.JIANGQIE_SETTING_HOME).then(res => {
            let logo = '../../images/logo.png';
            if (res.data.logo && res.data.logo.length > 0) {
                logo = res.data.logo;
            }
            that.setData({
                logo: logo,
                topNav: that.data.topNav.concat(res.data.top_nav),
                slide: res.data.slide,
                iconNav: res.data.icon_nav,
                actives: res.data.actives,
                hot: res.data.hot,
                listMode: res.data.list_mode,

                background: (res.data.slide && res.data.slide.length>0)?Api.JIANGQIE_BG_INDEX:'',
            });

            if (res.data.title && res.data.title.length > 0) {
                getApp().appName = res.data.title;
            }
        })

        //加载文章
        this.loadPostLast(true);



        // 在页面中定义插屏广告
let interstitialAd = null

// 在页面onLoad回调事件中创建插屏广告实例
if (wx.createInterstitialAd) {
  interstitialAd = wx.createInterstitialAd({
    adUnitId: 'adunit-bc0bdd6b2cfdfcf1'
  })
  interstitialAd.onLoad(() => {})
  interstitialAd.onError((err) => {})
  interstitialAd.onClose(() => {})
}

// 在适合的场景显示插屏广告
if (interstitialAd) {
  interstitialAd.show().catch((err) => {
    console.error(err)
  })
}




         // hitokoto 一言
         hitokoto.load(result => {
        console.log("https://v1.hitokoto.cn/ 获取内容:" + result.hitokoto)
        // 下面是处理逻辑示例
        this.setData({
            hitokoto: result.hitokoto
        });
      });





    },

    onReachBottom: function () {
        if (this.data.currentTab == 0) {
            if (!this.data.pullUpOnLast) {
                return;
            }

            this.loadPostLast(false);
        } else {
            if (!this.data.pullUpOn) {
                return;
            }

            this.loadPost(false);
        }
    },

    //首页分析海报配置
    onShareAppMessage: function () {
        return {
            title: this.data.hitokoto,//getApp().appName,
            path: 'pages/index/index',
        }
    },

    onShareTimeline: function () {
        return {
            title: getApp().appName,
        }
    },

    //nav start----
    handlerSearchClick: function (e) {
        wx.navigateTo({
            url: '/pages/search/search'
        })
    },
    //nav end ----

    //slide start----
    handlerSlideChange: function (e) {
        this.setData({
            current: e.detail.current
        })
    },
    //slide end----

    //tab -- start
    swichNav: function (e) {
        let cur = e.currentTarget.dataset.current;
        if (this.data.currentTab == cur) {
            return false;
        }

        this.setData({
            background: (cur==0 && this.data.slide && this.data.slide.length>0)?Api.JIANGQIE_BG_INDEX:'',
            currentTab: cur
        })

        if (cur !== 0) {
            this.loadPost(true);
        }
    },

    handlerTabMoreClick: function (e) {
        wx.switchTab({
          url: '/pages/categories/categories',
        })
    },
    //tab -- end

    handlerIconNavClick: function(e) {
        let link = e.currentTarget.dataset.link;
        this.openLink(link);
    },

    handlerActiveClick: function(e) {
        let link = e.currentTarget.dataset.link;
        this.openLink(link);
    },

    handlerArticleClick: function (e) {
        let post_id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/article/article?post_id=' + post_id
        })
    },

    //加载数据
    loadPostLast: function (refresh) {
        let that = this;

        that.setData({
            loaddingLast: true
        });

        let offset = 0;
        if (!refresh) {
            offset = that.data.postsLast.length;
        }

        Rest.get(Api.JIANGQIE_POSTS_LAST, {
            'offset': offset
        }).then(res => {
            that.setData({
                loaddingLast: false,
                postsLast: refresh ? res.data : that.data.postsLast.concat(res.data),
                pullUpOnLast: res.data.length == Constants.JQ_PER_PAGE_COUNT
            });
        })
    },

    loadPost: function (refresh) {
        let that = this;

        that.setData({
            loadding: true
        });

        let offset = 0;
        if (!refresh) {
            offset = that.data.posts.length;
        }

        Rest.get(Api.JIANGQIE_POSTS_CATEGORY, {
            'offset': offset,
            'cat_id': that.data.topNav[that.data.currentTab].id
        }).then(res => {
            that.setData({
                loadding: false,
                posts: refresh ? res.data : that.data.posts.concat(res.data),
                pullUpOn: res.data.length == Constants.JQ_PER_PAGE_COUNT
            });
        })
    },

    openLink: function(link) {
        if(link.startsWith('/pages')) {
            wx.navigateTo({
              url: link,
            })
        } else {
            wx.navigateToMiniProgram({
                appId: link,
                fail: res => {
                    wx.showToast({
                      title: '无效链接',
                    })
                } 
            })
        }
    }
})