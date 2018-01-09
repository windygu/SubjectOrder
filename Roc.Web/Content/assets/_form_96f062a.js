define("tetris/parse/_form.js", function(require, exports, module) {
    var GET_COUNT_URL = "/tetris/form/result/count/";
    var g_ad_id = 0,
        g_cid = 0,
        g_req_id = '',
        g_device_id = 0,
        g_user_id = 0,
        g_user_mobile = '';
    var isWrite = false;
    var pageType = ""; //附加创意
    //custom events
    var MOBILE_READY = 'g_user_mobile_ready';
    var MOBILE_KEY = 'g_mobile_key';

    //自动填充
    var g_telFillStatus = 1;
    var AUTOFILL_KEY = "telFillStatus"; //'' 1 自动填 2不填
    var LAST_TEL_KEY = "lastTelNum";
    var RECENT_SUBMIT_TIME_KEY = "_tt_recent_submit_time";

    //成功失败状态
    var SUCCESS = 'success';
    var FAIL = 'fail';

    //公共函数
    var util = {
        jsonToQueryString: function(json) {
            return '' +
                Object.keys(json).map(function(key) {
                    return encodeURIComponent(key) + '=' +
                        encodeURIComponent(json[key]);
                }).join('&');
        },
        strToJson: function(query) {
            var params = query.split('&'),
                len = params.length,
                result = {},
                i = 0,
                key, value, item, param;

            for (; i < len; i++) {
                if (!params[i]) {
                    continue;
                }
                param = params[i].split('=');
                key = param[0];
                value = param[1];

                item = result[key];
                if ('undefined' == typeof item) {
                    result[key] = value;
                } else if (this.isArray(item)) {
                    item.push(value);
                } else { // 这里只可能是string了
                    result[key] = [item, value];
                }
            }
            return result;
        },
        queryToJson: function(url) {
            var query = url.substr(url.lastIndexOf('?') + 1);
            return this.strToJson(query);
        },
        isArray: function(arr) {
            return toString.call(arr) === '[object Array]';
        },
        getCookie: function() {
            var cookie = document.cookie,
                cookies = cookie.split(';'),
                length = cookies.length,
                i = 0,
                item,
                result = {};

            for (; i < length; i++) {
                if (!cookies[i]) {
                    continue;
                }
                item = cookies[i].split('=');
                var key = item[0].trim(),
                    value = item[1];

                result[key] = value;
            }
            return result;
        },
        //用于将服务器返回的错误信息转为英文，错误信息格式固定
        chinese2English: function(str) {
            if (str.indexOf('格式不正确') >= 0) {
                return 'format error';
            }
            if (str.indexOf('已使用') >= 0) {
                return 'already exist';
            }
            if (str.indexOf('为空') >= 0) {
                return 'cannot be empty';
            }
            if (str.indexOf('时间的格式') >= 0) {
                return 'time format error';
            }
            return 'NONE';
        },

        getLocationParam: function (param) {
            var adRequest = {
                QueryString: function (val) {
                    var uri = window.location.href;
                    var re = new RegExp("[&\?]{1}" + val + "=([^&?|^#?]*)", "ig");
                    if (uri.match(re)) {
                        return decodeURI(uri.match(re)[0].substr(val.length + 2));
                    } else {
                        uri = document.referrer;
                        return ((uri.match(re)) ? (decodeURI(uri.match(re)[0].substr(val.length + 2))) : '');
                    }
                }
            };
            return adRequest.QueryString(param);
        },
        isWebviewDialogUrl: function() {
            var str, reg = /(revealType)(\=)(\w+)/g;
            str = window.location.href.match(reg);
            var parameter = (str && str[0]) ? str[0].split('=') : [];
            if (parameter[0] && parameter[0] === 'revealType' && parameter[1] && parameter[1] === 'dialog') {
                return true;
            } else {
                return false;
            }
        },
        isToutiao: function() {
            var istt = (document.referrer && document.referrer.indexOf('//nativeapp.toutiao.com') > 0) ||
                /(News|NewsSocial|Explore|NewsArticle|NewsInHouse|joke_essay|Joke|Video|VideoInHouse|VideoArticle)( |\/|_)(\d.\d.\d)/i.test(navigator.userAgent);
            return istt;
        },
        getCidFromParam: function() {
            return util.getLocationParam('cid')
        },
        getCid: function() {
            var bridge = window.ToutiaoJSBridge || {};
            if ('function' === typeof bridge.call) {
                bridge.call('adInfo', {}, function(res) {
                    res = res || {};
                    g_cid = g_cid || res.cid || 0;
                });
            }
        },

        fetchUserInfo: function(cb) {
            var that = this;
            var bridge = window.ToutiaoJSBridge || {};
            if ('function' === typeof bridge.call) {
                bridge.call('appInfo', {}, function(res) {
                    res = res || {};
                    g_device_id = res.device_id || 0;
                    g_user_id = res.user_id || 0;
                    if (g_user_id) {
                        cb && cb(g_user_id);
                    }
                });
            }
        },

        getMobileByUserId: function(user_id, cb) {
            g_user_mobile = sessionStorage.getItem(MOBILE_KEY) || '';
            if (g_user_mobile) {
                cb();
                return;
            }
            $.ajax({
                url: '/tetris/user_mobile_info/',
                data: {
                    uid: user_id
                },
                success: function(data) {
                    g_user_mobile = data.mobile || '';
                    if(g_user_mobile){
                        sessionStorage.setItem(MOBILE_KEY, g_user_mobile);
                    }
                    cb && cb();
                }
            });
        },

        localValue: function(key, value) {
            if (arguments.length > 1) {
                return localStorage.setItem(key, value);
            } else {
                return localStorage.getItem(key);
            }
        },

        getAdUserDeviceInfo: function(cb) {
            var that = this;
            var adUserDeviceInfoCommonData = {}
            var taq_timer = setInterval(function() {

                try {
                    if (window._taq && window._taq.getCommonDataPromise) {
                        clearInterval(taq_timer);

                        adUserDeviceInfoCommonData = window._taq.getCommonDataPromise();
                        g_ad_id = g_ad_id || adUserDeviceInfoCommonData.ad_id;
                        //没有 Promise 表示从网盟拿到的数据
                        if (!adUserDeviceInfoCommonData.adInfo && !adUserDeviceInfoCommonData.appInfo) {
                            g_req_id = g_req_id || adUserDeviceInfoCommonData.req_id;
                            g_cid = g_cid || adUserDeviceInfoCommonData.cid;
                            g_user_id = g_user_id || adUserDeviceInfoCommonData.user_id;
                            g_device_id = g_device_id || adUserDeviceInfoCommonData.device_id;
                        }

                        adUserDeviceInfoCommonData.adInfo && typeof(adUserDeviceInfoCommonData.adInfo.then) == 'function' && adUserDeviceInfoCommonData.adInfo.then(function(adInfo) {
                            g_req_id = g_req_id || adInfo.req_id;
                            g_cid = g_cid || adInfo.cid;
                        });
                        adUserDeviceInfoCommonData.appInfo && typeof(adUserDeviceInfoCommonData.appInfo.then) == 'function' && adUserDeviceInfoCommonData.appInfo.then(function(appInfo) {
                            g_device_id = g_device_id || appInfo.device_id;
                            g_user_id = g_user_id || appInfo.user_id;

                        });
                    }
                } catch (e) {
                }

            }, 200);
        }
    }



    function Form(opt) {
        var that = this;
        this.siteOpt = opt;
        this.$el = opt.$el;
        this.formId = opt.formId || this.$el.attr('form_id');;
        this.$submitbtn = this.$el.find('.btn-i[type="submit"]');
        this.$reset = this.$el.find('#reset');
        this.$jump = this.$el.find('.btn-jump');
        this.$textarea = this.$el.find('textarea');
        this.$input = this.$el.find('input[type = "text"]');
        this.padding = 20;
        //site config
        this.showJump = opt.showJump;
        this.successUrl = opt.successUrl;
        this.failedUrl = opt.failedUrl;
        this.recommendAdPageUrl = opt.recommendAdPageUrl;
        this.successmsg = opt.successmsg;
        this.isShowCount = opt.isShowCount;
        this.locateBgColor = opt.locateBgColor;
        this.countPos = opt.countPos ? parseInt(opt.countPos) : 0;
        this.countNum = isNaN(opt.countNum) ? 0 : parseInt(opt.countNum);
        this.countText = opt.countText;
        this.telAutoFill = opt.telAutoFill;
        this.recentSubmitStyle = opt.recentSubmitStyle;
        //end of site
        this.csrf = util.getCookie()['csrftoken'] || this.$el.find('[name="csrfmiddlewaretoken"]').val() || "";
        this.$telInput = null;
        this.preFillTelNum = null;
        this.submitValueChanged = 0;
        this.submitFormData = '';
        this.submitData = '';
        this.kafkaId = '';
        this.uacLogId = this.makeUniqueLogId();
        this.setPageType();
        this.getCurrentPosition();
        this.doCityCtr();
        this.addEvent();
        this.initCount();
        this.renderRecentSubmitHistory();
        this.sendWriteActionLog();
        this.TriggerAutoFill = false;

        var query = util.queryToJson(location.href);
        g_ad_id = g_ad_id || query.ad_id || 0;
        g_req_id = g_req_id || query.req_id || "";

        if (util.isToutiao()) {
            g_ad_id = util.getLocationParam('ad_id');
            g_req_id = util.getLocationParam('req_id');
            g_cid = util.getCidFromParam('cid');
            var storage = window.sessionStorage || {};
            if ('function' === typeof storage.getItem) {
                g_cid = g_cid || storage.getItem("_tt_cid") || 0;
                g_req_id = g_req_id || storage.getItem("_tt_req_id") || 0;
                g_user_id = storage.getItem("_tt_user_id") || 0;
                g_device_id = storage.getItem("_tt_device_id") || 0;
            }
            if(!g_cid){
                var bridgeTimer = setInterval(function() {
                    if (window.ToutiaoJSBridge) {
                        clearInterval(bridgeTimer);
                        util.getCid();
                    }
                }, 200);
            }
            if (!g_user_id) {
                var bridgeUserTimer = setInterval(function() {
                    if (window.ToutiaoJSBridge) {
                        clearInterval(bridgeUserTimer);
                        util.fetchUserInfo(function(){
                            util.getMobileByUserId(g_user_id, function(){
                                that.$el.trigger(MOBILE_READY);
                            });
                        });
                    }
                }, 200);
            }else{
                util.getMobileByUserId(g_user_id, function(){
                    that.$el.trigger(MOBILE_READY);
                });
            }

        } else { //网盟在非头条客户端打开,从url获取
            var infoObj;
            try {
                infoObj = JSON.parse(window.decodeURIComponent(util.getLocationParam("_toutiao_params") || '{}'));
            } catch (e) {
                infoObj = {};
            }
            g_cid = g_cid || infoObj.cid || '';
            g_user_id = g_user_id || infoObj.uid || 0;
            g_device_id = g_device_id || infoObj.device_id || 0;
        }
        util.getAdUserDeviceInfo();
    }

    $.extend(Form.prototype, {
        setPageType: function() {
            var that = this;
            var $creative_title = $('#creative-title'),
                $submit_result = $('#submit-result'),
                is_creative_page = $creative_title.length > 0,
                get_dialog_ua = navigator.userAgent.match(/RevealType\/Dialog/i),
                is_webview_dialog = get_dialog_ua || util.isWebviewDialogUrl();

            if (is_creative_page && is_webview_dialog) {
                pageType = that.pageType = "creative";
            } else {
                pageType = that.pageType = "normal";
            }
        },

        isCreativePage: function() {
            return this.pageType === 'creative';
        },

        //表单操作行为 ID
        makeUniqueLogId: function() {
            return this.formId + '-' + this.csrf + '-' + (+new Date());
        },

        sendWriteActionLog: function() {
            var that = this;
            $('form input').on('input', function() {
                if (!isWrite) {
                    window.addTetrisAction({
                        component_type: 'form',
                        component_id: that.formId,
                        action_type: 'form_write',
                        action_value: '1'
                    });
                    isWrite = true;
                }
            })
        },

        sendFormAutoFillLog: function(action_type, action_value) {
            if (window.addTetrisAction) {
                window.addTetrisAction({
                    component_type: 'form',
                    component_id: this.formId,
                    action_type: action_type,
                    action_value: action_value
                });
            }
        },

        sendFormSubmitWithAutoFillLog: function(type) {
            if (window.addTetrisAction) {
                window.addTetrisAction({
                    component_type: 'form',
                    component_id: this.formId,
                    action_type: 'submit_with_tel_autofill_' + type,
                    action_value: this.TriggerAutoFill ? '1' : '0'
                });
            }
        },
        removeFormAutoFillLog: function() {
            if (window.removeTetrisAction) {
                window.removeTetrisAction('form', 'trigger_tel_autofill');
            }
        },

        doCityCtr: function() {
            this.$city = this.$el.find('.city-group');
            if (this.$city && this.$city.length) {
                this.city = [];
                this.cityData = {
                    "cities": ["北京|beijing|bj", "天津|tianjin|tj", "河北|hebei|hb", "山西|shanxi|sx", "内蒙古|neimenggu|nmg", "辽宁|liaoning|ln", "吉林省|jilinsheng|jls", "黑龙江|heilongjiang|hlj", "上海|shanghai|sh", "江苏|jiangsu|js", "浙江|zhejiang|zj", "安徽|anhui|ah", "福建|fujian|fj", "江西|jiangxi|jx", "山东|shandong|sd", "河南|henan|hn", "湖北|hubei|hb", "湖南|hunan|hn", "广东|guangdong|gd", "广西|guangxi|gx", "海南|hainan|hn", "重庆|chongqing|cq", "四川|sichuan|sc", "贵州|guizhou|gz", "云南|yunnan|yn", "西藏|xizang|xz", "陕西|shanxi|sx", "甘肃|gansu|gs", "青海|qinghai|qh", "宁夏|ningxia|nx", "新疆|xinjiang|xj", "台湾|taiwan|tw", "香港|xianggang|xg", "澳门|aomen|am", "石家庄|shijiazhuang|sjz", "唐山|tangshan|ts", "秦皇岛|qinhuangdao|qhd", "邯郸|handan|hd", "邢台|xingtai|xt", "保定|baoding|bd", "张家口|zhangjiakou|zjk", "承德|chengde|cd", "沧州|cangzhou|cz", "廊坊|langfang|lf", "衡水|hengshui|hs", "太原|taiyuan|ty", "大同|datong|dt", "阳泉|yangquan|yq", "长治|changzhi|cz", "晋城|jincheng|jc", "朔州|shuozhou|sz", "忻州|xinzhou|xz", "临汾|linfen|lf", "运城|yuncheng|yc", "呼和浩特|huhehaote|hhht", "包头|baotou|bt", "乌海|wuhai|wh", "赤峰|chifeng|cf", "通辽|tongliao|tl", "鄂尔多斯|eerduosi|eeds", "沈阳|shenyang|sy", "大连|dalian|dl", "鞍山|anshan|as", "抚顺|fushun|fs", "本溪|benxi|bx", "丹东|dandong|dd", "锦州|jinzhou|jz", "营口|yingkou|yk", "阜新|fuxin|fx", "辽阳|liaoyang|ly", "盘锦|panjin|pj", "铁岭|tieling|tl", "朝阳|chaoyang|cy", "葫芦岛|huludao|hld", "长春|changchun|cc", "四平|siping|sp", "辽源|liaoyuan|ly", "通化|tonghua|th", "白城|baicheng|bc", "延边|yanbian|yb", "哈尔滨|haerbin|heb", "齐齐哈尔|qiqihaer|qqhe", "鸡西|jixi|jx", "鹤岗|hegang|hg", "双鸭山|shuangyashan|sys", "大庆|daqing|dq", "宜春|yichun|yc", "佳木斯|jiamusi|jms", "七台河|qitaihe|qth", "牡丹江|mudanjiang|mdj", "绥化|suihua|sh", "黑河|heihe|hh", "大兴安岭|daxinganling|dxal", "南京|nanjing|nj", "无锡|wuxi|wx", "徐州|xuzhou|xz", "常州|changzhou|cz", "苏州|suzhou|sz", "南通|nantong|nt", "连云港|lianyungang|lyg", "盐城|yancheng|yc", "扬州|yangzhou|yz", "镇江|zhenjiang|zj", "泰州|taizhou|tz", "宿迁|suqian|sq", "杭州|hangzhou|hz", "宁波|ningbo|nb", "温州|wenzhou|wz", "嘉兴|jiaxing|jx", "湖州|huzhou|hz", "绍兴|shaoxing|sx", "金华|jinhua|jh", "衢州|quzhou|qz", "舟山|zhoushan|zs", "丽水|lishui|ls", "台州|taizhou|tz", "合肥|hefei|hf", "芜湖|wuhu|wh", "蚌埠|bangbu|bb", "淮南|huainan|hn", "马鞍山|maanshan|mas", "淮北|huaibei|hb", "铜陵|tongling|tl", "安庆|anqing|aq", "阜阳|fuyang|fy", "宿州|suzhou|sz", "滁州|chuzhou|cz", "六安|liuan|la", "宣城|xuancheng|xc", "池州|chizhou|cz", "亳州|bozhou|bz", "福州|fuzhou|fz", "厦门|xiamen|xm", "莆田|putian|pt", "三明|sanming|sm", "泉州|quanzhou|qz", "漳州|zhangzhou|zz", "南平|nanping|np", "宁德|ningde|nd", "龙岩|longyan|ly", "陇南|longnan|ln", "庆阳|qingyang|qy", "南昌|nanchang|nc", "景德镇|jingdezhen|jdz", "萍乡|pingxiang|px", "九江|jiujiang|jj", "新余|xinyu|xy", "鹰潭|yingtan|yt", "赣州|ganzhou|gz", "宜春|yichun|yc", "上饶|shangrao|sr", "吉安|jian|ja", "济南|jinan|jn", "青岛|qingdao|qd", "淄博|zibo|zb", "枣庄|zaozhuang|zz", "东营|dongying|dy", "烟台|yantai|yt", "潍坊|weifang|wf", "济宁|jining|jn", "泰安|taian|ta", "威海|weihai|wh", "日照|rizhao|rz", "滨州|binzhou|bz", "德州|dezhou|dz", "聊城|liaocheng|lc", "临沂|linyi|ly", "菏泽|heze|hz", "莱芜|laiwu|lw", "郑州|zhengzhou|zz", "开封|kaifeng|kf", "洛阳|luoyang|ly", "平顶山|pingdingshan|pds", "安阳|anyang|ay", "鹤壁|hebi|hb", "新乡|xinxiang|xx", "焦作|jiaozuo|jz", "濮阳|puyang|py", "许昌|xuchang|xc", "漯河|leihe|lh", "三门峡|sanmenxia|smx", "商丘|shangqiu|sq", "周口|zhoukou|zk", "驻马店|zhumadian|zmd", "南阳|nanyang|ny", "信阳|xinyang|xy", "武汉|wuhan|wh", "黄石|huangshi|hs", "十堰|shiyan|sy", "随州|suizhou|sz", "宜昌|yichang|yc", "襄樊|xiangfan|xf", "鄂州|ezhou|ez", "荆门|jingmen|jm", "黄冈|huanggang|hg", "孝感|xiaogan|xg", "咸宁|xianning|xn", "荆州|jingzhou|jz", "恩施|enshi|es", "长沙|changsha|cs", "株洲|zhuzhou|zz", "湘潭|xiangtan|xt", "衡阳|hengyang|hy", "邵阳|shaoyang|sy", "岳阳|yueyang|yy", "常德|changde|cd", "张家界|zhangjiajie|zjj", "益阳|yiyang|yy", "娄底|loudi|ld", "郴州|chenzhou|cz", "永州|yongzhou|yz", "怀化|huaihua|hh", "广州|guangzhou|gz", "韶关|shaoguan|sg", "深圳|shenzhen|sz", "珠海|zhuhai|zh", "汕头|shantou|st", "江门|jiangmen|jm", "湛江|zhanjiang|zj", "茂名|maoming|mm", "肇庆|zhaoqing|zq", "惠州|huizhou|hz", "梅州|meizhou|mz", "汕尾|shanwei|sw", "河源|heyuan|hy", "阳江|yangjiang|yj", "潮州|chaozhou|cz", "揭阳|jieyang|jy", "云浮|yunfu|yf", "清远|qingyuan|qy", "东莞|dongguan|dg", "中山|zhongshan|zs", "南宁|nanning|nn", "柳州|liuzhou|lz", "桂林|guilin|gl", "梧州|wuzhou|wz", "北海|beihai|bh", "防城港|fangchenggang|fcg", "贵港|guigang|gg", "贺州|hezhou|hz", "玉林|yulin|yl", "百色|baise|bs", "河池|hechi|hc", "钦州|qinzhou|qz", "海口|haikou|hk", "三亚|sanya|sy", "成都|chengdu|cd", "自贡|zigong|zg", "攀枝花|panzhihua|pzh", "阿坝|aba|ab", "甘孜|ganzi|gz", "凉山|liangshan|ls", "广安|guangan|ga", "巴中|bazhong|bz", "泸州|luzhou|lz", "德阳|deyang|dy", "绵阳|mianyang|my", "广元|guangyuan|gy", "遂宁|suining|sn", "内江|najiang|nj", "乐山|leshan|ls", "宜宾|yibin|yb", "南充|nanchong|nc", "达州|dazhou|dz", "雅安|yaan|ya", "眉山|meishan|ms", "资阳|ziyang|zy", "贵阳|guiyang|gy", "六盘水|liupanshui|lps", "遵义|zunyi|zy", "铜仁|tongren|tr", "毕节|bijie|bj", "安顺|anshun|as", "昆明|kunming|km", "德宏|dehong|dh", "昭通|zhaotong|zt", "曲靖|qujing|qj", "楚雄|chuxiong|cx", "玉溪|yuxi|yx", "红河|honghe|hh", "文山|wenshan|ws", "西双版纳|xishuangbanna|xsbn", "大理|dali|dl", "保山|baoshan|bs", "怒江|nujiang|nj", "丽江|lijiang|lj", "迪庆|diqing|dq", "临沧|lincang|lc", "拉萨|lasa|ls", "昌都|changdu|cd", "山南|shannan|sn", "日喀则|rikaze|rkz", "那曲|naqu|nq", "阿里|ali|al", "林芝|linzhi|lz", "西安|xian|xa", "铜川|tongchuan|tc", "宝鸡|baoji|bj", "咸阳|xianyang|xy", "渭南|weinan|wn", "汉中|hanzhong|hz", "安康|ankang|ak", "商洛|shangluo|sl", "延安|yanan|ya", "榆林|yulin|yl", "兰州|lanzhou|lz", "嘉峪关|jiayuguan|jyg", "金昌|jinchang|jc", "白银|baiyin|by", "天水|tianshui|ts", "酒泉|jiuquan|jq", "张掖|zhangye|zy", "武威|wuwei|ww", "定西|dingxi|dx", "平凉|pingliang|pl", "临夏|linxia|lx", "西宁|xining|xn", "果洛|guoluo|gl", "海西|haixi|hx", "海东|haidong|hd", "海北|haibei|hb", "玉树|yushu|ys", "黄南|huangnan|hn", "银川|yinchuan|yc", "石嘴山|shizuishan|szs", "吴忠|wuzhong|wz", "固原|guyuan|gy", "乌鲁木齐|wulumuqi|wlmq", "克拉玛依|kelamayi|klmy", "吐鲁番|tulufan|tlf", "哈密|hami|hm", "昌吉|changji|cj", "阿克苏|akesu|aks", "喀什|kashi|ks", "和田|hetian|ht", "伊犁|yili|yl", "塔城|tacheng|tc", "阿勒泰|aletai|alt", "佛山|foshan|fs", "松原|songyuan|sy", "黄山|huangshan|hs", "吕梁|lvliang|ll", "晋中|jinzhong|jz", "抚州|fuzhou|fz", "来宾|laibin|lb", "崇左|chongzuo|cz", "博尔塔拉|boertala|betl", "巴音郭楞|bayinguoleng|bygl", "克孜勒苏|kezilesu|kzls", "白山|baishan|bs", "吉林市|jilinshi|jls", "伊春|yichun|yc", "济源|jiyuan|jy", "漯河|luohe|lh", "襄阳|xiangyang|xy", "呼伦贝尔|hunlunbeier|hlbe", "巴彦淖尔|bayannaoer|byne", "乌兰察布|wulanchabu|wlcb", "淮安|huaian|ha", "普洱|puer|pe"],
                    "codes": [11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 61, 62, 63, 64, 65, 71, 81, 82, 130100, 130200, 130300, 130400, 130500, 130600, 130700, 130800, 130900, 131000, 131100, 140100, 140200, 140300, 140400, 140500, 140600, 140900, 141000, 140800, 150100, 150200, 150300, 150400, 150500, 150600, 210100, 210200, 210300, 210400, 210500, 210600, 210700, 210800, 210900, 211000, 211100, 211200, 211300, 211400, 220100, 220300, 220400, 220500, 220800, 222400, 230100, 230200, 230300, 230400, 230500, 230600, 360900, 230800, 230900, 231000, 231200, 231100, 232700, 320100, 320200, 320300, 320400, 320500, 320600, 320700, 320900, 321000, 321100, 321200, 321300, 330100, 330200, 330300, 330400, 330500, 330600, 330700, 330800, 330900, 331100, 331000, 340100, 340200, 340300, 340400, 340500, 340600, 340700, 340800, 341200, 341300, 341100, 341500, 341800, 341700, 341900, 350100, 350200, 350300, 350400, 350500, 350600, 350700, 350900, 350800, 621200, 621000, 360100, 360200, 360300, 360400, 360500, 360600, 360700, 360900, 361100, 360800, 370100, 370200, 370300, 370400, 370500, 370600, 370700, 370800, 370900, 371000, 371100, 371600, 371400, 371500, 371300, 371700, 371200, 410100, 410200, 410300, 410400, 410500, 410600, 410700, 410800, 410900, 411000, 411100, 411200, 411400, 411600, 411700, 411300, 411500, 420100, 420200, 420300, 421300, 420500, 420600, 420700, 420800, 421100, 420900, 421200, 421000, 422800, 430100, 430200, 430300, 430400, 430500, 430600, 430700, 430800, 430900, 431300, 431000, 431100, 431200, 440100, 440200, 440300, 440400, 440500, 440700, 440800, 440900, 441200, 441300, 441400, 441500, 441600, 441700, 445100, 445200, 445300, 441800, 441900, 442000, 450100, 450200, 450300, 450400, 450500, 450600, 450800, 451100, 450900, 451000, 451200, 450700, 460100, 460200, 510100, 510300, 510400, 513200, 513300, 513400, 511600, 511900, 510500, 510600, 510700, 510800, 510900, 511000, 511100, 511500, 511300, 511700, 511800, 511400, 512000, 520100, 520200, 520300, 522200, 522400, 520400, 530100, 533100, 530600, 530300, 532300, 530400, 532500, 532600, 532800, 532900, 530500, 533300, 530700, 533400, 530900, 540100, 542100, 542200, 542300, 542400, 542500, 542600, 610100, 610200, 610300, 610400, 610500, 610700, 610900, 611000, 610600, 610800, 620100, 620200, 620300, 620400, 620500, 620900, 620700, 620600, 621100, 620800, 622900, 630100, 632600, 632800, 632100, 632200, 632700, 632300, 640100, 640200, 640300, 640400, 650100, 650200, 652100, 652200, 652300, 652900, 653100, 653200, 654000, 654200, 654300, 440600, 220700, 341000, 141100, 140700, 361000, 451300, 451400, 652700, 652800, 653000, 220600, 220200, 230700, 411800, 411100, 420600, 150700, 150800, 150900, 320800, 530800]
                };

                var cities = this.cityData.cities,
                    codes = this.cityData.codes,
                    that = this,
                    len = cities.length;
                for (var i = 0; i < len; i++) {
                    var ele = cities[i];
                    var obj = {
                        name: ele,
                        code: codes[i]
                    };
                    that.city.push(obj);
                }
                var $proList = this.$city.find('#pro');

                $proList.bind('change', function(evt) {
                    that.initCity($(this).val());
                });

                this.initCity($proList.val());
                this.fillCurrentLocation(this.cityData);
            } //end of if
        },

        getCurrentPosition: function(cb) {
            var that = this;
            if (that.addressInfo) {
                cb && cb(that.addressInfo);
                return;
            }
            var bridgeTimer = setTimeout(function() {
                if (window.ToutiaoJSBridge) {
                    window.ToutiaoJSBridge.call('get_address', {}, function(res) {
                        res = res || {};
                        that.addressInfo = res || {};
                        cb && cb(that.addressInfo);
                    });
                }
            }, 100);

        },
        fillCurrentLocation: function(city_data) {
            var removeLastWord = function(str) {
                var rs = '';
                if (str.indexOf('省') > -1) {
                    rs = str.slice(0, str.indexOf('省'))
                }
                if (str.indexOf('市') > -1) {
                    rs = str.slice(0, str.indexOf('市'))
                }
                return rs;
            }
            setTimeout(function() {
                this.getCurrentPosition(function(res) {
                    if (res.address_info) {
                        var province = removeLastWord(res.address_info.province || '');
                        var city = removeLastWord(res.address_info.locality || '');

                        var pro_effective = city_data.cities.toString().indexOf(province) !== -1;
                        var city_effective = city_data.cities.toString().indexOf(city) !== -1;

                        if (province && city && pro_effective && city_effective) {
                            $('.city-group-province').find('select').val(province).change();
                            $('.city-group-city').find('select').val(city).change();
                        }
                    }
                });
            }.bind(this), 300)
        },

        addEvent: function() {
            this.jumpBtnEvent();
            this.multiSelectEvent();
            this.radioSelectEvent();
            this.chkboxSelectEvent();
            this.submitEvent();
            this.captchaEvent();
            this.placeholderEvent();
            this.validateEvent();
            this.autocompleteEvent();
            this.telPhoneAutoFillEvent();
            this.clearInputEvent();
            this.formBehaviorEvents();
            this.spamUserDialogEvent();

        },
        normalizeFieldName: function(target) {
            var $target = $(target);
            var name = $target.attr('name');
            // 正常情况直接返回
            if (!!name && /^[0-9]+$/.test(name)) {
                return name
            }

            // 地区
            if ($target.closest('.need-serialize').length) {
                return $target.closest('.need-serialize').attr('name')
            }
            // 下拉
            if ($target.closest('.selectMulti-group').length) {
                return $target.closest('.selectMulti-group').children('input[name]').attr('name')
            }
            // 单选、多选
            if (/^(radio|checkbox)-/.test(name || '')) {
                return $target.closest('.radio-group, .checkbox-group').children('input[name]').attr('name')
            }

            return 'ANONYMOUS'
        },
        normalizeFieldValue: function(target) {
            var $target = $(target);
            var name = this.normalizeFieldName($target);
            var valueNode = this.$el.find('[name="' + name + '"]')
            if (valueNode.hasClass('need-serialize')) {
                var result = valueNode.find('input, select').map(function(_, field) {
                    return $(field).val()
                });
                return [].slice.call(result).join('+')
            }

            return valueNode.val()
        },
        normalizeFieldType: function(target) {
            var $target = $(target);

            var eletype = $target.attr('eletype')
            if (eletype) {
                return eletype
            }

            if ($target.attr('type')) {
                return $target.attr('type')
            }

            if ($target.hasClass('form-date')) {
                return 'date'
            }

            if ($target.closest('.gender-group').length) {
                return 'gender'
            }

            if ($target.closest('.city-group').length) {
                return 'city'
            }

            if ($target.closest('.textarea-group').length) {
                return 'textarea'
            }

            if ($target.closest('.selectMulti-group').length) {
                return 'select'
            }
        },
        formBehaviorEvents: function() {
            var that = this;
            var __behaviors = [];
            this.getCurrentBehavitors = function(){
                return __behaviors;
            }
            this.addToCurrentBehavitors= function(eventName){
                addEvent(eventName);
            }
            this.getFormatCurrentBehaviors = function() {
                var eventTypeMap= {
                    impression:'00',
                    field_focus:'01',
                    field_change:'02',
                    field_blur:'03',
                    submit:'10',
                }
                var eleTypeMap = {
                    'form': '00',
                    'name': '01',
                    'telphone': '02',
                    'captcha': '03',
                    'email': '04',
                    'date': '05',
                    'input': '06',
                    'text': '06',
                    'select': '07',
                    'select-one': '07',
                    'city': '08',
                    'radio': '09',
                    'checkbox': '10',
                    'gender': '11',
                    'textarea': '12',
                    'submit': '99'
                }

                // [tiggertime eventtype+eletype  name  value]
                __behaviorsarr = __behaviors.map(function(b){
                    var item  = [];
                    var ts = b.tm;
                    item[0] = ts;
                    item[1] = eventTypeMap[b.et] + (eleTypeMap[b.t]|| '')
                    if( b.et === 'impression' ){
                        item[2] = b.ltm
                        item[3] = b.top
                    }else{
                        item[2] = b.n || ''
                        item[3] = (b.v || '')
                    }
                    return item
                });
                return __behaviorsarr
            };

            var focusedField = null;
            //uac add event
            var addEvent = function(type, target) {
                var name = this.normalizeFieldName(target);
                var now = new Date().getTime();

                if (type === 'field_focus') {
                    var lastEvent = __behaviors.slice(-1).pop()
                    if (lastEvent && lastEvent.et === 'field_blur' && lastEvent.n === name) {
                        __behaviors = __behaviors.slice(0, -1);
                        return;
                    }
                }

                if (type === 'submit') {
                    __behaviors.push({
                        et: type,
                        tm: now,
                        t: 'submit'
                    });
                    return;
                }

                if (name === 'ANONYMOUS') {
                    return
                }

                __behaviors.push({
                    et: type,
                    t: this.normalizeFieldType(target),
                    n: name,
                    v: this.normalizeFieldValue(target),
                    tm: now
                });

                if(__behaviors.length >= 15){
                    var sentBehavLen = __behaviors.length;
                    var beforeSentBehaviors = [].concat(__behaviors);
                    //在请求发送过程开始但是未完成的这段时间  可能有新的行为进入
                    $.ajax({
                        url: '/tetris/form/collect_uac/',
                        type: 'POST',
                        csrf: that.csrf,
                        data:{
                            csrfmiddlewaretoken: that.csrf,
                            uacid: that.uacLogId,
                            // uaclist: encodeURIComponent( JSON.stringify( that.getFormatCurrentBehaviors() ) )
                            uaclist: JSON.stringify( that.getFormatCurrentBehaviors() )
                        },
                        success: function(res){
                        },
                        error: function(){
                            __behaviors = beforeSentBehaviors.concat(__behaviors)
                        }
                    });
                    __behaviors = [];
                }

            }.bind(this);

            this.$el
                .on('focusin', function onFieldFocus(event) {
                    var name = this.normalizeFieldName(event.target);
                    // 还在同一个 field 内
                    if (focusedField && focusedField === name) {
                        return
                    }
                    focusedField = name;
                    addEvent('field_focus', event.target);
                }.bind(this))
                .on('focusout', function onFieldtBlur(event) {
                    focusedField = null
                    addEvent('field_blur', event.target);
                }.bind(this))
                .on('change', 'input, textarea, select', function onFieldValueChange(event) {
                    addEvent('field_change', event.target);
                }.bind(this))
                .on('form-submit', function onFormSubmit(event) {

                }.bind(this));

            window.addEventListener('beforeunload', function() {
                if ('function' === typeof window.addTetrisAction) {
                    __behaviors.forEach(function(event) {
                        window.addTetrisAction({
                            component_type: 'form',
                            component_id: this.formId,
                            action_type: event.et,
                            action_value: JSON.stringify(event)
                        });
                    }.bind(this));
                }
            }.bind(this));

            window.addEventListener('load', function() {
                var loaded = Date.now();
                var windowHeight = window.innerHeight;
                var formNode = this.$el.get(0)
                if (window.performance && window.performance.timing) {
                    loaded = performance.timing.domInteractive;
                }

                function isInViewport(target) {
                    var rect = target.getBoundingClientRect();

                    return (
                        rect.top > 0 && rect.top < windowHeight ||
                        rect.top <= 0 && rect.bottom > 0 && rect.bottom < windowHeight
                    )
                }

                function getOffsetTop(target) {
                    var top = target.getBoundingClientRect().top + window.scrollY
                    return parseFloat((top / windowHeight).toFixed(2))
                }

                var visiable = isInViewport(formNode);
                var impressionpushed = 0;
                if (visiable) {
                    __behaviors.push({
                        et: 'impression',
                        ltm: loaded,
                        top: 0,
                        t: 'form',
                        tm: +(new Date())
                    });
                    impressionpushed = 1;
                    return
                }

                var ticking = false;

                var timer;
                var onScroll;
                var update = function() {
                    if (isInViewport(formNode)) {
                        if(!impressionpushed){

                            __behaviors.push({
                                tm: (+new Date()),
                                et: 'impression',
                                t: 'form',
                                ltm: loaded,
                                top: getOffsetTop(formNode),
                            });
                            impressionpushed = 1;
                        }
                        window.removeEventListener('scroll', onScroll);
                    }
                };
                onScroll = function() {
                    clearTimeout(timer);
                    timer = setTimeout( update, 50 );
                };



                var passiveSupported = false;
                try {
                    var options = Object.defineProperty({}, "passive", {
                        get: function() {
                            passiveSupported = true;
                        }
                    });

                    window.addEventListener("test", null, options);
                } catch (err) {}
                window.addEventListener('scroll', onScroll, passiveSupported ? {
                    passive: true
                } : false);
            }.bind(this));
        },

        placeholderEvent: function() {
            this.$el.find('input,textarea').focus(function(e) {
                if ($(this).siblings('.style2-placeholder') && $(this).siblings('.style2-placeholder').length > 0) {
                    $(this).siblings('.style2-placeholder')[0].style.display = 'none';
                }
            }).blur(function() {
                if ($(this).siblings('.style2-placeholder') && $(this).siblings('.style2-placeholder').length > 0 && $(this).val().trim() == '') {
                    $(this).siblings('.style2-placeholder')[0].style.display = 'block';
                    $(this).val('');
                }
            });
        },

        submitEvent: function() {
            var that = this;
            that.ajaxLock = false;
            that.$submitbtn.bind('click', function(evt) {
                g_cid = g_cid || sessionStorage.getItem('_tt_cid') || 0;
                g_req_id = g_req_id || sessionStorage.getItem('_tt_req_id') || sessionStorage.getItem('umeng_req_id') || 0;
                var o = {
                    g_ad_id: g_ad_id,
                    g_req_id: g_req_id,
                    g_cid: g_cid,
                    g_user_id: g_user_id,
                    _tt_cid: sessionStorage.getItem('_tt_cid'),
                    ocpc: window._taq.get_query({
                        event_type: 'normal',
                        event_value:'from_feed_dialog'
                    }),
                }
                evt.preventDefault();
                if (!that.ajaxLock) {

                    that.doSubmit(evt.currentTarget);
                    that.ajaxLock = true;
                    setTimeout(function(){
                        that.ajaxLock = false;
                    }, 800);
                }
            });
        },

        jumpBtnEvent: function() {
            var showJump = this.showJump;
            var that = this;
            var scrollTimer;
            var lastScroll = +new Date();
            if (showJump == "1") {
                this.$jump.removeClass('hide');
                this.$jump.css({
                    'background-color': that.locateBgColor
                });
                this.$jump.bind('click', function(evt) {
                    var offset = that.$el.offset();
                    var scrollValue = offset.top; //浏览器会自动修正scroll超出范围
                    window.scrollTo(0, scrollValue);
                });
            }
            if ($('.create-left-content').length) {
                $('.create-left-content').append(this.$jump);
            } else {
                $('<div class="create-left-content"/>')
                    .append(this.$jump)
                    .appendTo('#content');
            };
            if ($('.create-right-content').length) {
                $('.create-right-content').append(this.$jump);
            } else {
                $('<div class="create-right-content"/>')
                    .append(this.$jump)
                    .appendTo('#content');
            }
        },
        getSmsinfo: function (target) {
            var bridge = window.ToutiaoJSBridge || {};
            if ('function' === typeof bridge.call) {
                bridge.call('getSMSAuthCode', {}, function(res) {
                    try {
                        res = res || {};
                        res.status === 'success' && $(target).val(res.auth_code);
                    } catch (e) {
                        console.log(e.message);
                    }
                });
            }
        },
        captchaEvent: function() {
            var that = this;
            var $smsValidate = that.$el.find('.sms-validate');
            if ($smsValidate.length === 0) {
                return;
            }

            var $picValidateWrapper = that.$el.find('.sms-pic-validate-wrapper'); //弹窗容器
            var $validateImg = $picValidateWrapper.find('img');
            var $smsInfo = that.$el.find('.sms-info');
            var $closeBtn = that.$el.find('.close');
            $picValidateWrapper.attr('pic-validate', '0');

            //非弹窗发送短信按钮
            var $smsSendBtn = $smsValidate.find('.send-sms');

            // 弹窗中发送短信按钮
            var $smsValidateSendBtn = $picValidateWrapper.find('.send_sms_validate');

            //刷新
            $picValidateWrapper.find('.refresh-pic-btn').click(function() {
                $validateImg.attr('src', $validateImg.attr('origin-src') + '&_t=' + (+new Date()));
            });

            //点击灰色区域
            $closeBtn.on('click', function() {
                $picValidateWrapper.addClass('hide');
            });
            $picValidateWrapper.on('click', function(e) {
                var $target = $(e.target);
                if (e.target === e.currentTarget) {
                    $picValidateWrapper.addClass('hide');
                }
            });

            //弹窗中发送短信按钮(最早验证码的弹窗)
            $smsValidateSendBtn.on('click', function(e) {
                var phone_number = $smsValidate.parent().children("div.m-input-text").children('input').val();
                //send_captcha 接口在需要验证码时状态 success
                //图片验证码错误 和   发送频繁 超限制 返回 fail
                $.ajax({
                    // url: '/tetris/check_img_captcha/',
                    url: '/tetris/send_captcha/',
                    type: 'POST',
                    data: {
                        cvalue: $picValidateWrapper.find('input').val(),
                        ckey: $picValidateWrapper.attr('captcha_key'),
                        phone_number: phone_number,
                        csrfmiddlewaretoken: that.csrf,
                    },
                    beforeSend: function(request) {
                        request.setRequestHeader("X-CSRFToken", that.csrf);
                    },
                    success: function(rs) {
                        if (rs.status === SUCCESS) {

                            if (rs.pic_captcha === 1) {
                                $smsInfo.text(rs.msg || '请输入图形验证码');
                            } else {
                                $picValidateWrapper.addClass('hide');
                                //成功调用了一次发送后 原有按钮进入倒计时
                                // that.makeCountDownBtn($btn);
                            }
                        } else {
                            $smsInfo.text(rs.msg || '短信发送失败');
                        }
                    },
                    error: function() {
                        $smsInfo.text(rs.msg || '短信发送失败');
                    }
                });
            });

            // 发送短信按钮(captcha字段)
            $smsSendBtn.on('click', function() {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                var phone_number = $smsValidate.parent().children("div.m-input-text").children("input").val();
                if (phone_number.trim().length != 11 || !/\d{11}/.test(phone_number)) {
                    TTNotice.create($('body'), {
                        content: '电话号码应为11位数字',
                        type: 1
                    });
                    return;
                }

                //表示已经请求过一次 之后发送都需要图形验证码 然后又点击发送验证码
                if ($picValidateWrapper.attr('pic-validate') == '1') {
                    $smsInfo.text('请输入图形验证码');
                    $picValidateWrapper.find('input').val('');
                    $picValidateWrapper.removeClass('hide');
                    return;
                }

                $.ajax({
                    url: '/tetris/send_captcha/',
                    type: 'POST',
                    data: {
                        phone_number: phone_number,
                        csrfmiddlewaretoken: that.csrf
                    },
                    beforeSend: function(request) {
                        request.setRequestHeader("X-CSRFToken", that.csrf);
                    },
                    success: function(rs) {
                        if (rs.data && !rs.data.captcha_key) {
                            $picValidateWrapper.addClass('hide');
                            //成功调用了一次发送后 原有按钮进入倒计时
                            that.makeCountDownBtn($smsSendBtn);
                        }
                        //表示应该提供图片验证码而未能提供
                        if (rs.data && rs.data.captcha_key) {
                            //.validate-dialog 为1 要求输入图片验证码
                            $picValidateWrapper.attr('pic-validate', '1');
                            var $validateImg = $picValidateWrapper.find('img');
                            $validateImg.attr('src', rs.data.captcha_url + '&_t=' + (+new Date()));
                            $validateImg.attr('origin-src', rs.data.captcha_url);
                            $picValidateWrapper.attr('captcha_key', rs.data.captcha_key);
                            // $validateImg.attr('src', $validateImg.attr('origin-src') + '&_t=' + (+new Date()));
                            $picValidateWrapper.removeClass('hide');
                            $smsInfo.text('请输入图形验证码');
                        }
                        if (rs.msg) {
                            TTNotice.create($('body'), {
                                content: rs.msg || '短信发送失败',
                                type: 1
                            });
                        }
                    }
                });
            });
        },

        multiSelectEvent: function() {
            var that = this;
            var $selectGroups = this.$el.find('.selectMulti-group');
            if (!$selectGroups.length) {
                return;
            }

            $selectGroups.each(function() {
                var $selectGroup = $(this);
                var data;
                var $allSelects, $select1, $input;

                try {
                    data = $selectGroup.attr('data-select');
                    data = JSON.parse(data);
                    // data.arr = data.arrObj.filter(function(item) {
                    //     return item.id != '0';
                    // })
                } catch (e) {
                }
                if ($selectGroup) {
                    $selectWrappers = $selectGroup.find('.select-wrapper');
                    $select1 = $selectGroup.find('.select-list1');

                    $allSelects = $selectGroup.find('select');
                    $input = $selectGroup.find('.multi-select'); //下拉选择的值存在$input中

                    var inputValJson = {}; //$input.data('value');  //{1: .., 2:...}
                    var inputStr;

                    //当有下一层选项才显示
                    $selectWrappers.hide().removeClass('showing');
                    $select1.show().addClass('showing');
                    //每当用户操作  计算所选择的值
                    (function($selectWrappers) {
                        $allSelects.on('change', function(e) {
                            var selectElem = e.target;
                            var val = $(this).val();
                            var id, $next;
                            var selectIndex = $(this).index();
                            //计算当前被选中的option的data-id值
                            //根据data-id填充下一个select
                            //Zepto不支持:selected  下面是获取被选中的option的data-id (包含嵌套关系)
                            var options = Array.prototype.slice.call(selectElem.options);
                            for (var i = 0; i < options.length; i++) {
                                if (options[i].value === val) {
                                    id = options[i].dataset.id;
                                }
                            }
                            $next = $(this).parent().next(); //zepto 没有nextAll()
                            //填充下一个select
                            appendOpt($next, id);
                            inputValJson = that.getSelectValue($selectWrappers);
                            inputStr = (function() {
                                var str = '';
                                for (var key in inputValJson) {
                                    str = str + inputValJson[key] + ',';
                                }
                                str = str.slice(0, str.length - 1);
                                return str;
                            })();
                            $input.val(inputStr);
                        });
                    })($selectWrappers);

                    //新增checkbox
                    (function($selectWrappers) {
                        $selectGroup.on('change', 'input[type="checkbox"]', function(e) {
                            inputValJson = that.getSelectValue($selectWrappers);
                            inputStr = (function() {
                                var str = '';
                                for (var key in inputValJson) {
                                    str = str + inputValJson[key] + ',';
                                }
                                str = str.slice(0, str.length - 1);
                                return str;
                            })();
                            $input.val(inputStr);
                        });
                    })($selectWrappers);

                }


                //关于级联选择  一种是次级每次都是 请选择 //目前使用这一种
                //另一种是  显示第一个值


                function appendOpt($selectWrapper, pid) {
                    if (!($selectWrapper && $selectWrapper.length)) return;

                    var parentNode = data.arrObj[pid];

                    if (parentNode.type == 'checked') {
                        $selectWrapper[0].dataset.checkbox = '1'; //获取数据的时候根据这个判断是否多选
                        $selectWrapper.addClass('select-checkbox');
                    } else {
                        $selectWrapper.removeClass('select-checkbox');
                        $selectWrapper[0].dataset.checkbox = '';
                        $selectWrapper.removeAttr('data-checkbox');
                    }


                    setToEmpty($selectWrapper);

                    if (pid === '0') { //前一个select再次选为Root时
                        $selectWrapper.hide().removeClass('showing');
                        appendOpt($selectWrapper.next(), '0'); //那么所有次级都是 请选择
                    } else {
                        var added = 0;
                        if (parentNode && parentNode.sid) {

                            if (!parentNode.type) {
                                //单选  添加option
                                parentNode.sid.forEach(function(id) {
                                    var item = data.arrObj[id];
                                    // if(firstId === 0 )firstId = item.id;
                                    added = 1;
                                    var opt = document.createElement("option");
                                    opt.dataset.id = item.id;
                                    opt.value = item.text;
                                    opt.text = item.text;
                                    $selectWrapper.find('select')[0].add(opt, null);
                                });
                            } else if (parentNode.type == 'checked') {
                                var $cbWrapper = $('<div class="cb-wrapper"></div>');
                                $selectWrapper.append($cbWrapper);
                                $cbWrapper.empty();
                                parentNode.sid.forEach(function(id) {
                                    var item = data.arrObj[id];
                                    // if(firstId === 0 )firstId = item.id;
                                    added = 1;
                                    var html = '<label class="cbx-item"><input type="checkbox" id="{{item_id}}" value="{{item_value}}"/>{{item_text}}</label>';
                                    html = html.replace('{{item_id}}', item.id);
                                    html = html.replace('{{item_value}}', item.text);
                                    html = html.replace('{{item_text}}', item.text);
                                    var cbx = $(html);
                                    // ckb.dataset.id = item.id;
                                    // ckb.value = item.text;
                                    // ckb.text = item.text;
                                    $cbWrapper.append(cbx);
                                });
                            }

                        }
                        if (added) {
                            $selectWrapper.show().addClass('showing');
                        } else {
                            $selectWrapper.hide().removeClass('showing');
                        }
                        // appendOpt($selectWrapper.next(), firstId); //所有次级都是第一个值
                        appendOpt($selectWrapper.next(), '0'); //请选择
                    }
                }

                function setToEmpty($selectWrapper) {
                    var $select = $selectWrapper.find('select');
                    var $cbWrapper = $selectWrapper.find('.cb-wrapper');
                    $select[0].value = ''; //清空之前选择的值
                    //逻辑修改了  现在存在checkbox
                    if ($select[0].options) {
                        $select[0].options.length = 0;
                    }
                    var opt = document.createElement("option");
                    opt.dataset.id = '0';
                    opt.value = 'null';
                    opt.text = '--请选择--';
                    $select[0].add(opt, null);
                    // $elem.empty()

                    if ($cbWrapper) {
                        $cbWrapper.remove();
                        // $cbWrapper.children().each(function(idx) {
                        //     $(this).prop('checked', false);
                        // })
                    }
                }
            });
        },

        getSelectValue: function($selectWrappers) {
            var showingItems = $selectWrappers.filter('.showing');
            var inputVal = {};
            showingItems.each(function(idx) {

                if ($(this)[0].dataset.checkbox == '1') {
                    var $cbWrapper = $(this).children('.cb-wrapper');
                    var rs = [];
                    if ($cbWrapper) {
                        $cbWrapper.children().each(function(idx2, cbx) {
                            var $cbx = $(cbx);
                            if ($cbx.children('input').prop('checked')) {
                                rs.push($cbx.children().val());
                            }
                        })
                    }
                    inputVal[idx + 1] = '[' + rs.toString() + ']';
                } else {
                    inputVal[idx + 1] = $(this).children('select').val() || 'null';
                }

            });
            if (inputVal[1] === 'null') {
                inputVal = {}
            };
            return inputVal;
        },
        //单选 多选框
        radioSelectEvent: function() {
            var $radioGroups = this.$el.find('.radio-group');
            $radioGroups.each(function() {
                var $radioGroup = $(this);
                var $radioInputs = $radioGroup.find('input[type="radio"]');
                var $radioValue = $radioGroup.find('input.radio-select');
                $radioInputs.on('change', function(e) {
                    var selectRadio = $radioGroup.find('input[type="radio"]:checked');
                    $radioValue.val(selectRadio.val());
                }.bind(this));
            });
        },

        chkboxSelectEvent: function() {
            var $checkboxGroups = this.$el.find('.checkbox-group');
            $checkboxGroups.each(function() {
                var $checkboxGroup = $(this);
                var $checkboxInputs = $checkboxGroup.find('input[type="checkbox"]');
                var $checkboxValue = $checkboxGroup.find('input.checkbox-select');
                $checkboxInputs.on('change', function(e) {
                    var $selectcheckbox = $checkboxGroup.find('input[type="checkbox"]:checked');

                    var selectValue = [];
                    $.each($selectcheckbox, function(idx, item) {
                        selectValue.push(item.value);
                    });
                    $checkboxValue.val(selectValue.toString());
                }.bind(this));
            });
        },

        //spam 和 smart captcha 都会使用此弹窗
        spamUserDialogEvent: function() {
            var that = this;
            var $spamUserWrapper = that.$el.find('.spam-user-validate-wrapper');

            var $spamUserDialog = that.$el.find('.spam-user-validate-dialog');
            var $sendSms = $spamUserDialog.find('.spam-send-sms');
            var $picValidate = $spamUserDialog.find('.pic-validate');
            var $picCaptchaInput = $spamUserDialog.find('input.spam-pic-captcha');
            var $spamSmsInput = $spamUserDialog.find('input.spam-send-sms');
            var $img = $spamUserDialog.find('.validate-img');
            var $refreshBtn = $spamUserDialog.find('.spam-refresh-pic-btn');
            var $spamSubmit = $spamUserDialog.find('.spam-submit');
            var $spamInfo = $spamUserDialog.find('.spam-info');
            var $closeBtn = $spamUserDialog.find('.close');

            var needPicValidate;
            var picValidateValue;

            $closeBtn.on('tap', function(e) {
                $spamUserWrapper.addClass('hide');
            });
            var moveHandler = function(e) {
                e.preventDefault();
                e.stopPropagation();
            };


            $spamUserWrapper.on('touchmove', moveHandler, false);
            $spamUserWrapper.on('click', function(e) {
                var $target = $(e.target);
                if (e.target === e.currentTarget) {
                    $spamUserWrapper.addClass('hide');
                }
            });
            $refreshBtn.on('tap', function(e) {
                $img.attr('src', $img.attr('origin-src') + '&_t=' + (+new Date()));
            });
            $sendSms.on('tap', function(e) {
                var $target = $(e.currentTarget);
                needPicValidate = $spamSubmit.attr('need-pic-validate');
                picValidateValue = $spamUserDialog.find('.spam-pic-captcha').val() || '';

                if ($target.hasClass('disabled')) return;

                //需要图形验证码却没有输入图形验证码
                if (needPicValidate && picValidateValue.length === 0) {
                    $spamInfo.text('请输入图形验证码');
                    return;
                }

                that.makeCountDownBtn($sendSms);

                $.ajax({
                    url: '/tetris/send_captcha/',
                    type: 'POST',
                    data: {
                        cvalue: $picCaptchaInput.val() || '',
                        ckey: $img.attr('captcha_key') || '',
                        phone_number: $sendSms.attr('phone-number'),
                        csrfmiddlewaretoken: that.csrf,
                    },
                    beforeSend: function(request) {
                        request.setRequestHeader("X-CSRFToken", that.csrf);
                    },
                    success: function(rs) {
                        if (rs.status != SUCCESS) {
                            $spamInfo.html(rs.data.msg || rs.msg);
                            //当图片验证码错误的时候应该取消倒计时（此时并未发送短信）
                            //此时再发短信恰好要输入验证码
                            if (rs.data && rs.data.picValidateErr === 1) {
                                $spamSubmit.attr('need-pic-validate', '1');
                                $spamInfo.text(rs.msg || '图形验证码错误');
                                $picValidate.removeClass('hide');
                                that.clearCountDownBtn($sendSms);
                            } else {
                                $picValidate.addClass('hide');
                            }
                        }
                        //短信成功发送
                        $spamInfo.html(rs.data.msg || '');
                    }
                });
            });

            //spam submit
            $spamSubmit.on('tap', function(e) {
                var smsValidateValue = $spamUserDialog.find('.spam-sms-captcha').val() || '';

                needPicValidate = $spamSubmit.attr('need-pic-validate');
                picValidateValue = $spamUserDialog.find('.spam-pic-captcha').val() || '';

                // if (needPicValidate && picValidateValue.length === 0) {
                //     $spamInfo.text('请输入图片验证码');
                //     return;
                // }
                if (!smsValidateValue || smsValidateValue.length === 0) {
                    $spamInfo.text('请输入短信验证码');
                    return;
                }
                that.submitData = that.getEncodeSubmitData();
                that.submitData.spam_sms_validate = smsValidateValue;
                that.sendSubmitRequest($spamSubmit[0]);
            });
        },

        //只有通过短信验证 提交的电话号码才保存在本地
        saveTelToLocal: function() {
            var phonenumber = this.$inputTel.val() || '';
            if(phonenumber){
                localStorage.setItem(LAST_TEL_KEY, phonenumber)
            }
        },

        validateEvent: function() {
            var that = this;
            if (!that.isCreativePage()) {
                this.$el.on('blur', '.input-group-i[validate] .m-input-text > input', function onBlurHandler(e) {
                    var $input = $(e.target);
                    // var $group = $input.closest('.input-group-i[validate]');
                    // var validate = $.trim($group.attr('validate'));
                    var validate = $input.attr("validate");
                    if (validate !== '') {
                        this.validateHandler($input, validate);
                    }
                }.bind(this));
            }
        },

        validateHandler: function(target, validate) {
            var value = $.trim(target.val());
            target.val(value);
            if (value === '') {
                this.emptyMessage(target);
                return
            }

            function ValidateError(message) {
                this.message = message
                this.stack = ''
            }

            ValidateError.prototype = Error.prototype

            var validators = {
                name: function(input) {
                    var reg = /^([\u4e00-\u9fa5]{1,6}|[a-zA-Z]{1,10}(\s+[a-zA-Z]{1,10})*)$/
                    if (reg.test(input)) {
                        return null
                    }
                    return new ValidateError('姓名格式不正确，请重新输入')
                },
                cellphone: function(input) {

                    // normalize
                    input = input.replace(/[-\s]/g, '');
                    var localphoneReg = /^(0\d{2,3})-?\d{7,8}$/;
                    var cellphoneReg = /^1[3-8][0-9][- ]?[0-9]{4}[- ]?[0-9]{4}$/;
                    if (localphoneReg.test(input) || cellphoneReg.test(input)) {
                        return null
                    }
                    return new ValidateError('电话格式不正确，请重新输入')
                },
                captcha: function(input) {
                    var reg = /^1[3-8][0-9][- ]?[0-9]{4}[- ]?[0-9]{4}$/;
                    if (reg.test(input)) {
                        return null
                    }
                    return new ValidateError('手机格式不正确，请重新输入')
                },
                email: function(input) {
                    var reg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                    if (reg.test(input)) {
                        return null
                    }
                    return new ValidateError('邮箱格式不正确，请重新输入')
                }
            };

            if (validators[validate]) {
                var result = validators[validate](value);
                if (result instanceof Error) {
                    this.displayMessage(target, result.message);
                } else {
                    this.emptyMessage(target);
                }
            }
        },

        displayMessage: function(target, message) {
            var $msgNode = target.closest('.input-group-i[validate]').children('.form-control-error');
            if (!$msgNode.length) {
                $msgNode = target.closest('.input-group-i[validate]').append('<span class="form-control-error"></span>')
                    .find('.form-control-error');
            }
            $msgNode.text(message);
        },

        emptyMessage: function(target, message) {
            var $msgNode = target.closest('.input-group-i[validate]').children('.form-control-error');
            $msgNode.remove();
        },



        autocompleteEvent: function() {
            var compositionstart = false;

            var onInputHandler = function(e) {
                if (compositionstart) return;

                var $input = $(e.target);
                var $group = $input.closest('.input-group-i[validate]');
                var validate = $.trim($group.attr('validate'));
                var value = $.trim($input.val());

                if (validate !== '') {
                    this.showAutocomplete($input, validate, value);
                } else {
                    compositionstart = false;
                    this.hideAutocomplete($input);
                }
            }.bind(this);

            this.$el.on('compositionstart', function() {
                compositionstart = true;
            }).on('compositionend', function(e) {
                compositionstart = false;
                onInputHandler(e)
            }).on('input',
                '.input-group-i[validate] input',
                onInputHandler
            );
        },

        showAutocomplete: function(target, validate, value) {
            var suggestions = {
                email: function(value) {
                    if (value.length < 3) {
                        return []
                    }
                    var defaultDomain = [
                        '163.com',
                        '126.com',
                        'qq.com',
                        'sina.com',
                        'sina.cn',
                        'gmail.com'
                    ];

                    value = value.split('@');
                    if ($.trim(value[1])) {
                        defaultDomain = defaultDomain.filter(function(domain) {
                            return ~domain.indexOf($.trim(value[1]))
                        });
                    }

                    return $.map(defaultDomain, function(domain) {
                        return value[0] + '@' + domain
                    })
                },
                name: function(value) {
                    if (!value || value.length > 1) {
                        return []
                    }

                    var defaultDomain = [
                        '先生',
                        '女士'
                    ];

                    return defaultDomain.map(function(domain) {
                        return value + domain
                    })
                }
            };

            if (suggestions[validate]) {
                var result = suggestions[validate](value);
                if (!result.length) {
                    this.hideAutocomplete(target);
                    return
                }

                var list = target.siblings('.form-autocomplete-list');
                if (!list.length) {
                    var $input = $(target);
                    list = target.after('<div class="form-autocomplete-list"></div>').siblings('.form-autocomplete-list');
                    list.one('click mousedown', '.form-autocomplete-item', function(e) {
                        e.stopPropagation();
                        target.val($(e.target).data('value'));
                        this.hideAutocomplete(target);
                        setTimeout(function() {
                            try {
                                target.focus();
                            } catch (error) {}
                        }, 0);
                    }.bind(this));

                    $input.one('blur', function(e) {
                        setTimeout(function() {
                            this.hideAutocomplete(target);
                        }.bind(this), 0);
                    }.bind(this));
                }
                list.empty();
                list.append(
                    result.map(function(item) {
                        return '<div class="form-autocomplete-item" data-value="' + item + '">' + item + '</div>'
                    }).join('')
                );
            }
        },

        hideAutocomplete: function(target) {
            target.siblings('.form-autocomplete-list').remove();
        },

        telPhoneAutoFillEvent: function() {
            var that = this;
            g_telFillStatus = +(localStorage.getItem(AUTOFILL_KEY) || 1);

            var $inputGroups = this.$el.find(".input-group-i");
            $inputGroups = $inputGroups.filter(function() {
                return $(this).attr("validate") && (
                    $(this).attr("validate") == "cellphone" || $(this).attr("validate") == "captcha" || $(this).attr("validate") == "captchav2"
                );
            });
            var $currentInputTel = this.$inputTel = $inputGroups.children("div.m-input-text").children("input");

            // 超过一定时间仍未拿到注册的号码则使用上次获取的电话号码
            // g_user_mobile = g_user_mobile || localStorage.getItem(LAST_TEL_KEY) || '';
            // setTimeout(function(){
            //     that.$el.trigger(MOBILE_READY);
            // },500);

            that.$el.on(MOBILE_READY, function(){
                var telphonestr = g_user_mobile.replace(' ','').replace('-','') ;
                if (g_telFillStatus == 1) {
                    that.doTelAutoFill(that.$inputTel, telphonestr);
                }
            });


            //自动填充开关
            var $telFillBtn = $(".form-tel-autofillbtn");
            var $checkbox = $telFillBtn.find("input");
            if (g_telFillStatus == 1){
                $checkbox.attr("checked", true);
            }

            $checkbox.click(function(e) {
                var $this = $(e.target);
                if ($this.is(":checked")) {
                    // getCurrentInput($this);
                    localStorage.setItem(AUTOFILL_KEY, 1);
                    // that.getTelInfoFromLocal(); //更新全局变量状态
                    //之前曾经填过的电话号码
                    that.doTelAutoFill($currentInputTel, g_user_mobile);
                    that.sendFormAutoFillLog("click_check", "1");
                    that.TriggerAutoFill = true; //是否为自动填充 log
                } else {
                    // getCurrentInput($this);
                    localStorage.setItem(AUTOFILL_KEY, 2);
                    // that.getTelInfoFromLocal();
                    // that.doTelAutoFill($currentInputTel);
                    that.sendFormAutoFillLog("click_check", "0");
                    that.TriggerAutoFill = false; //是否为自动填充 log
                }
                e.stopPropagation();
            });
        },

        doTelAutoFill: function($inputEl, value) {
            var that = this;
            if (value) {
                $inputEl.val(value);
                that.TriggerAutoFill = true;
                window.addTetrisAction({
                    component_type: 'form',
                    component_id: that.formId,
                    action_type: 'trigger_tel_autofill',
                    action_value: '1'
                })
            } else {
                $inputEl.val("");
            }
        },


        //快速清除输入
        clearInputEvent: function() {
            var that = this;
            var $clearBtn = $(".m-input-text").children("span.el-input-clear");
            $clearBtn.on("click", function(e) {
                var $target = $(e.target);
                var $currentInput = $target.prev();
                var currentValue = $currentInput.val();
                $currentInput.val("");
                if ($currentInput.attr("validate") == "cellphone") {
                    if (that.isCreativePage()) {
                        if (currentValue) {
                            that.sendFormAutoFillLog("click_delete", 1 + "_" + currentValue);
                        }
                    } else {
                        if (currentValue) {
                            that.sendFormAutoFillLog("click_delete", 2 + "_" + currentValue);
                        }
                    }
                    that.TriggerAutoFill = false; //是否为自动填充 log
                }
                e.stopPropagation();
                e.preventDefault();
            });
        },

        ocpcQuery: function(eventType, eventValue) {
            if (!window._taq || 'function' !== typeof window._taq.get_query) {
                return '';
            }
            var params = window._taq.get_query({
                event_type: eventType,
                event_value: eventValue
            });
            params.source = "tetris";
            return window.encodeURIComponent(util.jsonToQueryString(params));
        },

        //非弹窗表单提交
        doSubmit: function(target) {
            var that = this;
            this.$el.trigger('form-submit'); //uac统计用
            that.addToCurrentBehavitors('submit');
            //后面的正则针对 城市字段
            that.serializeData = that.$el.serialize().replace(/[^&]+=&/g, '').replace(/&[^&]+=$/g, '').replace(/&=[^&]*/g, '');
            that.getSmsinfo($('.spam-sms-captcha'));
            that.submitData = that.getEncodeSubmitData();
            that.sendSubmitRequest(target);
            return false;
        },

        _getAjaxDataObj: function() {
            var that = this;
            // 这里的数据将会 serilize 之后加入到serializeData中 共同形成 ajax_data
            var ajaxDataExtendObj = {
                form_id: that.formId,
                req_id: g_req_id,
                cid: g_cid,
                ad_id: g_ad_id,
                user_id: g_user_id,
                device_id: g_device_id,
                localInfo: JSON.stringify(that.addressInfo || {}),
            };

            if (that.kafkaId) {
                ajaxDataExtendObj['log_id'] = that.kafkaId;
            }

            //城市字段（转为 河北+石家庄）
            that.$el.find('.need-serialize').each(function(idx, ele) {
                var $ele = $(ele),
                    query = '';
                $ele.find('input,select').each(function(idx, ele) {
                    query += $(ele).val() + '+';
                });
                query = query.substring(0, query.length - 1);
                ajaxDataExtendObj[$ele.attr('name')] = query;
            });

            if( window.getTetrisAction && typeof(window.getTetrisAction) == 'function'){
                ajaxDataExtendObj['stay_time'] = (window.getTetrisAction('page', 'stay_time') || {}).action_value || '';
                ajaxDataExtendObj['page_length'] = (window.getTetrisAction('page', 'browse_pages') || {}).action_value || '';
                ajaxDataExtendObj['page_read_pct'] = (window.getTetrisAction('page', 'read_pct') || {}).action_value || '';
            }
            if(localStorage.getItem(RECENT_SUBMIT_TIME_KEY)){
                ajaxDataExtendObj['recent_submit_time'] = localStorage.getItem(RECENT_SUBMIT_TIME_KEY) || ''
            }


            //OCPC
            var ocpcEventValue = 'normal';
            if (that.isCreativePage()) {
                ocpcEventValue = 'from_feed_dialog';
            }
            var ocpcQueryStr = that.ocpcQuery("form", ocpcEventValue);

            if (ocpcQueryStr) {
                ajaxDataExtendObj.send = ocpcQueryStr;
            }
            return ajaxDataExtendObj;
        },

        /**
         * doSubmit 以及弹窗中的提交会调用getEncodeSubmitData  而getEncodeSubmitData 调用了_getExtendSubmitData
         * 与功能相关和用户提交数据无关的信息
         */
        _getExtendSubmitData: function() {
            var that = this;

            //返回填充页面又改了数据再提交 //submitFormData在提交发送时获取
            if (that.submitFormData != that.serializeData) {
                that.submitValueChanged = 1
                that.kafkaId = that.makeUniqueLogId();
                that.hasInterrupt = ''; //作为新提交不再记录原有原因
            } else {
                that.submitValueChanged = 0
            }
            var obj = {
                page_type: that.pageType,
                support_submit_check: that.isCreativePage() ? 0 : 1, //附加创意不支持
                spam: that.spamed || '',
                newValue: that.submitValueChanged,
                log_id: that.kafkaId,
                uacid: that.uacLogId
            }
            return obj;
        },
        /**
         * doSubmit 以及弹窗中的提交会调用
         * 表单发送数据的格式 {ajax_data:xxxx   }
         */
        getEncodeSubmitData: function() {
            var that = this;
            var extendData = that._getExtendSubmitData(); //生成 logid
            var ajaxDataExtendObj = that._getAjaxDataObj(); //要用到 log_id
            var ajax_data_querystr = that.serializeData + '&' + util.jsonToQueryString(ajaxDataExtendObj)
            var ajax_data = Base64.encode(ajax_data_querystr);

            return $.extend({
                csrfmiddlewaretoken: that.csrf,
                ajax_data: ajax_data,
                behaviors: JSON.stringify(that.getFormatCurrentBehaviors())
            }, extendData);
        },
        //doSubmit 以及spam弹窗中的 submit 会调用
        sendSubmitRequest: function(target) {
            var that = this;
            var submitData = that.submitData;
            that.submitFormData = that.serializeData;

            $.ajax({
                type: "POST",
                url: that.$el.attr('action_url') || '/tetris/form/submit/',
                data: submitData,
                success: function(result) {
                    that.ajaxLock = false;
                    var errTxt = '';
                    if (result.status === SUCCESS) {
                        that.submitValueChanged = 0;
                        that.trackSubmitLog(result, target);
                        that.showOrHideSpamDialog(result);
                        that.formSuccessAlertOrJump();
                        that.addCount();
                        that.sendFormSubmitWithAutoFillLog(that.pageType);
                        that._finishSubmit();
                    } else {
                        // 失败的时候log 要发送具体的原因 在validateCallback中才有具体原因
                        // that.trackSubmitLog(result, target);
                        that.validateCallback(result, target);
                        that.showOrHideSpamDialog(result); //spam用户检测
                        that.spamed = result.data && result.data.spam ? result.data.spam : 0;

                        if (that.isCreativePage()) {
                            //客户端
                            toutiao.formDialogClose({
                                "submit_result": 0,
                                success: function(o) {
                                    console.log('success: ' + JSON.stringify(o));
                                },
                                fail: function(o) {
                                    console.log('fail: ' + JSON.stringify(o));
                                },
                                error: function(o) {
                                    console.log('error: ' + JSON.stringify(o));
                                }
                            });
                        }
                    }
                },
                error: function(){
                    that.ajaxLock = false;
                }
            });
        },

        showOrHideSpamDialog: function(result) {
            var that = this;
            var $spamDialog = that.$el.find('.spam-user-validate-wrapper');
            if ($spamDialog.length === 0) return;

            // 有formSubmitCheck 表示进入了新增的恶意验证逻辑判断
            if (result.status !== SUCCESS && result.data.formSubmitCheck) {

                var $picValidate = $spamDialog.find('.pic-validate');
                var $img = $spamDialog.find('.validate-img');
                var $sendSms = $spamDialog.find('.spam-send-sms');
                var $spamInfo = $spamDialog.find('.spam-info');
                var $captchaInput = $spamDialog.find('.spam-sms-captcha');
                var $picInput = $spamDialog.find('.spam-pic-captcha');
                var $spamSubmit = $spamDialog.find('.spam-submit');

                $spamInfo.html(result.data.msg || result.msg);
                $sendSms.attr('phone-number', result.data.phone_number);

                that._form_check_uac_log(result);

                if (result.data.pic_captcha == 1) {
                    $picValidate && $picValidate.removeClass('hide');
                    $img.attr('src', result.data.captcha_url);
                    $img.attr('origin-src', result.data.captcha_url);
                    $img.attr('captcha_key', result.data.captcha_key);
                    $spamSubmit.attr('need-pic-validate', '1');
                }

                if ($spamDialog.hasClass('hide')) {
                    $spamDialog.removeClass('hide');
                    $picInput.val('');
                    $captchaInput.val('');
                }

                //表示系统主动发送了短信
                if (result.data.sentStatus === 0) {
                    that.makeCountDownBtn($sendSms);
                } else if (result.data.sentStatus === 1) {
                    if (result.data.pic_captcha === 1) {
                        that.clearCountDownBtn($sendSms); //未发送需要图片验证码
                    } else {
                        that.makeCountDownBtn($sendSms); //发送过于频繁 //spam 用户第一次提交成功又准备提交。。。
                    }
                }
            } else if (result.status === SUCCESS) {
                $spamDialog.addClass('hide');
                that._form_check_uac_log(result);
            }
        },

        //用户spam行为跟踪统计
        _form_check_uac_log: function(result) {
            var that = this;
            var action_type = '';
            var action_value = '';

            //失败
            if (result.status !== SUCCESS) {
                if (result.data.spam == 1) {
                    action_type = 'trigger_smart_captcha';
                    that.hasInterrupt = 'spam';
                    if (result.data.spam_reason) {
                        that.hasInterruptReason = result.data.spam_reason
                    }
                } else if (result.data.captchav2 == 1) {
                    action_type = 'trigger_captcha';
                    that.hasInterrupt = 'captcha';
                }
                action_value = '0' + (that.hasInterruptReason || '');

                if ('function' === typeof window.addTetrisAction) {
                    if (that.submitValueChanged && that.kafkaId) { //只有新值才发送数据
                        window.addTetrisAction({
                            component_type: 'form',
                            component_id: that.kafkaId,
                            action_type: action_type,
                            action_value: action_value
                        });
                    }
                }
            } else if (result.status == SUCCESS) {
                if (that.hasInterrupt) {
                    if (that.hasInterrupt == 'spam') {
                        action_type = 'trigger_smart_captcha';
                    } else if (that.hasInterrupt == 'captcha') {
                        action_type = 'trigger_captcha';
                    }
                    action_value = '1' + (that.hasInterruptReason || '');
                    if ('function' === typeof window.addTetrisAction) {
                        window.addTetrisAction({
                            component_type: 'form',
                            component_id: that.kafkaId,
                            action_type: action_type,
                            action_value: action_value
                        });
                    }
                }
            }
        },

        validateCallback: function(result, target) {
            var that = this;

            //理论上说 有 isSpam 肯定 validate 已经通过
            if (result.data.formSubmitCheck) return; //spam 直接进入 spam 的逻辑

            var $inputs = that.$el.find('input,select,textarea'),
                len = $inputs.length,
                i = 0;
            for (; i < len; i++) {
                var name = $inputs.eq(i).attr('name');
                var $prev;
                if ($inputs.eq(i).parent("div.m-input-text").length > 0) {
                    $prev = $inputs.eq(i).parent().prev();
                } else {
                    $prev = $inputs.eq(i).prev();
                }
                var info = '';
                //附加创意是的提示不用弹窗
                if (result.data[name] === undefined) {
                    continue;
                }
                if (result.data[name]) {
                    info = $prev.text() + result.data[name];
                } else if (result.data[name] == '') {
                    // 注意  undefined 并不进入这里 而是 continue 循环
                    info = $prev.text() + '不能为空!';
                }
                if (that.isCreativePage()) {
                    var $submit_result = that.$el.find('#submit-result');
                    $submit_result.html(info);
                } else {

                    TTNotice.create($('body'), {
                        content: info,
                        type: 1,
                        title: '提交失败',
                        callback: function() {
                            if (that.failedUrl) {
                                window.location.href = that.failedUrl;
                            }
                        }
                    });
                }

                errTxt = $prev.text() + ' ' + $inputs.eq(i).prop('tagName') + ' ' + util.chinese2English(result.data[name]);
                that.trackSubmitLog(result, target, errTxt);
                return;
            }
        },

        formSuccessAlertOrJump: function() {
            var that = this;
            //推荐广告具有最高优先级
            if (that.recommendAdPageUrl) {
                window.location.href = that.recommendAdPageUrl;
                return;
            }
            if (that.successUrl) {
                var REG_INDEX = /tetris\/page\/index\/(\d{6})\/?\d*/;
                var GET_PREFIX = /(.*page\/)index\/\d{6}\/?/;

                // 旧逻辑兼容
                if (REG_INDEX.test(that.successUrl)) {
                    var page_link_id = that.successUrl.match(REG_INDEX)[1]; //字符串
                    var page_id = GLOBAL_VAR.pageid_map[page_link_id];
                    var prefix = that.successUrl.match(GET_PREFIX)[1];
                    if (GLOBAL_VAR.pageid_map) {
                        that.successUrl = prefix + page_id + '/';
                    }
                }
            }

            if (that.isCreativePage()) {
                var $submit_result = that.$el.find('#submit-result');
                $submit_result.html('');
                toutiao.formDialogClose({
                    "submit_result": 1,
                    success: function(o) {
                        console.log('success: ' + JSON.stringify(o));
                    },
                    fail: function(o) {
                        console.log('fail: ' + JSON.stringify(o));
                    },
                    error: function(o) {
                        console.log('error: ' + JSON.stringify(o));
                    }
                });
            } else {
                var alertmsg = that.successmsg || '表单提交成功!';
                TTNotice.create($('body'), {
                    content: alertmsg,
                    title: '提交成功',
                    callback: function(){
                        if(that.successUrl){
                            window.location.href = that.successUrl;
                        }
                    }
                });
                // 提交成功两秒后跳转
                setTimeout(function () {
                    if (that.successUrl) {
                        window.location.href = that.successUrl;
                    }
                }, 2000);

                var placeholderList = that.$el.find('.style2-placeholder');
                for (var i = 0; i < placeholderList.length; i++) {
                    placeholderList[i].style.display = "block";
                }
            }
        },

        getCodeByName: function(name) {
            var length = this.city.length,
                i = 0;
            for (; i < length; i++) {
                var ele = this.city[i];
                if (ele.name.indexOf(name) === 0) {
                    return ele.code;
                }
            }
            return false;
        },

        getListByCode: function(code) {
            var list = [],
                length = this.city.length;
            for (var i = 0; i < length; i++) {
                var ele = this.city[i];
                if (ele.code.toString().indexOf(code) === 0) {
                    list.push(ele);
                }
            }
            return list;
        },

        initCity: function(pro) {
            var code = this.getCodeByName(pro);
            var list = this.getListByCode(code);
            var $cityList = this.$city.find('#city'),
                html = '';

            $cityList.children().remove();

            var len = list.length;
            if (len > 1) {
                list.shift();
                len--;
            }

            for (var i = 0; i < len; i++) {
                var name = list[i].name.split('|')[0];
                html += '<option>' + name + '</option>';
            }
            $cityList.append(html);
        },

        renderCount: function() {
            if (this.isShowCount !== "true") {
                return;
            }
            var texts = this.countText.split('{计数}');
            var targetNode = 0 === this.countPos ? "bottomCount" : "topCount";
            this.$el.parent('.form-piece').find('[data-node="' + targetNode + '"]').css("display", "flex");
            this.$el.parent('.form-piece').find('[data-node="countTextNum"]').text(this.countNum);
            this.$el.parent('.form-piece').find('[data-node="countTextPre"]').text(texts[0]);
            this.$el.parent('.form-piece').find('[data-node="countTextPos"]').text(texts[1]);
        },

        initCount: function() {
            if (this.isShowCount !== "true") {
                return;
            }
            var that = this;
            $.get(GET_COUNT_URL, {
                form_id: this.formId
            }, function(res) {
                res = res || {};
                if (res.status !== SUCCESS) {
                    return;
                }
                that.countNum += parseInt(res.count, 10);
                that.renderCount();
            });
        },

        addCount: function() {
            this.countNum += 1;
            this.renderCount();
        },

        renderRecentSubmitHistory: function(){
            this.recentSubmitStyle = +this.recentSubmitStyle
            if (!this.recentSubmitStyle){
                return
            }
            var that = this;
            var recentList = [];
            var $recentContent = that.$el.parent().find('.recent-submit-content')
            $recentContent.addClass('style' + that.recentSubmitStyle)

            var $swiperContainer = $recentContent.find('.swiper-container')
            var $swiperWrapper = $('<div class="swiper-wrapper"></div>');
            $swiperContainer.append($swiperWrapper)

            var renderList = function(style, recentList){
                if (!recentList || recentList.length < 10){
                    return
                }
                $recentContent.removeClass('hide')
                recentList.forEach(function(dataItem){
                    var $oneItem;
                    if (dataItem.city){
                        $oneItem = $('<li class="recent-submit-item fourcol swiper-slide">\
                        <span class="text name"></span>\
                        <span class="text phone"></span>\
                        <span class="text city"></span>\
                        <span class="text time"></span>\</li>')

                    }else{

                        $oneItem = $('<li class="recent-submit-item threecol swiper-slide">\
                        <span class="text name"></span>\
                        <span class="text phone"></span>\
                        <span class="text time"></span>\</li>')
                    }

                    $oneItem.find('.name').text(dataItem.name)
                    $oneItem.find('.phone').text(dataItem.phone)
                    $oneItem.find('.city').text(dataItem.city)
                    $oneItem.find('.time').text(dataItem.time)
                    $swiperWrapper.append($oneItem)
                })
                // <option value="1">滚动墙</option>
                // <option value="2">滚动条</option>
                var slidesPerview = (function(){
                    return that.recentSubmitStyle == 1 ? 4 : 1;
                })()
                new Swiper($swiperContainer[0], {
                    autoplay: 2000,
                    loop: true,
                    direction: 'vertical',
                    simulateTouch : false,
                    touchMoveStopPropagation: false,
                    noSwiping: true,
                    speed: 732,
                    slidesPerView : slidesPerview,
                    onSetTransition: function(swiper) {
                        swiper.disableTouchControl();
                    },
                })

            }
            if ( that.recentSubmitStyle ){
                var query = $.ajax({
                    url:'/tetris/form/recent_submit/',
                    type: 'GET',
                    data:{
                        form_id: that.formId
                    },
                    success: function(res){
                        if(res.data){
                            recentList = res.data
                            renderList(that.recentSubmitStyle, recentList)

                        }else{

                        }
                    }
                })
            }
        },

        trackSubmitLog: function(result, target, errTxt) {
            var that = this;
            //taq.push 是转化事件
            if (result.status === SUCCESS) {
                //上报行为日志
                if ('function' === typeof window.addTetrisAction) {
                    window.addTetrisAction({
                        component_type: 'form',
                        component_id: that.formId,
                        action_type: 'success'
                    });
                }
            } else if (result.status === FAIL) {
                //上报行为日志
                if ('function' === typeof window.addTetrisAction) {
                    window.addTetrisAction({
                        component_type: 'form',
                        component_id: that.formId,
                        action_type: 'error',
                        action_value: errTxt
                    });
                }
            }
        },

        makeCountDownBtn: function($btn) {
            var that = this;
            if ($btn.hasClass('disabled')) return;
            var counter = 59;
            var originSendText = $btn.find('.text').text();
            $btn.attr('origin-text', originSendText);
            $btn.addClass('disabled');
            $btn.children('.timer').text('(' + (counter--) + ')');
            $btn.children('.text').text('重新获取');
            var counteTimer = that.btnTimer = setInterval(function() {
                $btn.children('.timer').text('(' + (counter--) + ')');
                if (counter <= -1) {
                    $btn.children('.timer').text('');
                    $btn.children('.text').text(originSendText);
                    clearInterval(counteTimer);
                    $btn.removeClass('disabled');
                }

            }.bind(this), 1000);
        },

        clearCountDownBtn: function($btn) {
            var that = this;
            clearInterval(that.btnTimer);
            $btn.children('.text').text($btn.attr('origin-text'));
            $btn.children('.timer').text('');
            $btn.removeClass('disabled');
        },

        _finishSubmit: function() {
            var that = this;
            that.$reset.click();
            $.each(that.$el.find('input[type=hidden]'), function() {
                var $input = $(this);

                //hidden的元素有很多 只有 name 是 elementid 的元素才reset //附加创意不 reset hidden
                if (!that.isCreativePage()) {
                    if (/^\d+/.test($input.attr('name'))) {
                        $input.val('');
                    }
                }
            });

            that.$el.find('.showing:not(.select-list1)').removeClass('showing').hide();
            if (that.$city && that.$city.length) {
                that.initCity(that.$city.find('#pro').val());
            }

            that.submitData = '';
            that.submitFormData = '';

            localStorage.setItem(RECENT_SUBMIT_TIME_KEY, +new Date());

        }
    });

    exports.init = function(opt) {
        opt.$el = $(opt.id);
        var formInstance = new Form(opt);
        return formInstance;
    };
});
