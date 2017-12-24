define("tetris/parse/_phone.js", function(require, exports, module) {
    /*
     * 从UA中判断头条版本是否是IOS且，版本号大于等于5.7.7
     */
    function isIphoneV577() {
        var navigator = window.navigator    || {};
        var ua        = navigator.userAgent || '';
        var version   = [];
        return ua && ua.match(/iphone/i) && (version = ua.match(/NewsArticle\/([\d.]*)/) || [])
                && (version.length > 1) && (version[1] >= '5.7.7')
    }
    /**
     * 从UA中判断头条版本是否是Android且，版本号大于等于5.9.4
     * Andriod版本的UA格式为：
     * Dalvik/2.1.0 (Linux; U; Android 5.1; HUAWEI TAG-AL00 Build/HUAWEITAG-AL00) NewsArticle/5.9.3 okhttp/3.4.1
     */
    function isAndroidV594() {
        var navigator = window.navigator    || {};
        var ua        = navigator.userAgent || '';
        var version   = [];
        return ua && ua.match(/android/i) && (version = ua.match(/NewsArticle\/([\d.]*)/) || [])
                && (version.length > 1) && (version[1] >= '5.9.4')
    }
    /**
     * 判断是否可以使用ToutiaoJSBridge拨打电话，并返回客户端是iOS还是Android
     * @return {number} 不能拨打返回0，可以拨打且是iOS返回1，可以拨打且是Android返回2
     */
    function canUseJsBridgeDial() {
        if (isIphoneV577()) {
            return 1;
        } else if (isAndroidV594()) {
            return 2;
        } else {
            return 0;
        }
    }


    var GET_VIRTUAL_NUM = '/tetris/get_virtual_number/';


    function Phone() {
    }
    Phone.prototype = {
        isToutiao: function() {
            var istt = (document.referrer && document.referrer.indexOf('//nativeapp.toutiao.com') > 0)
                || /(News|NewsSocial|Explore|NewsArticle|NewsInHouse|joke_essay|Joke|Video|VideoInHouse|VideoArticle)( |\/|_)(\d.\d.\d)/i.test(navigator.userAgent);
            return istt;
        },
        init: function(el, telType, phoneId, virtual_num) {
            var first_tag = true;
            var $el     = $(el);
            var tel_num = $el.attr('data-tel');
            var dial    = canUseJsBridgeDial();
            var phone_status = {}
            var that = this;
            var device_id = 0;

            if (this.isToutiao()) {
                var storage = window.sessionStorage || {};
                if ('function' === typeof storage.getItem) {
                    device_id = storage.getItem("_tt_device_id") || 0;
                }
            } else {//网盟在非头条客户端打开,从url获取
                var infoObj;
                try {
                    infoObj = JSON.parse(window.decodeURIComponent(that.getLocationParam("_toutiao_params") || '{}'));
                } catch (e) {
                    infoObj = {};
                }
                device_id = device_id || infoObj.device_id || 0;
            }

            $el.on('click', function (evt) {

                if (first_tag && telType !== '1') {
                    first_tag = false;
                    _taq.push({
                        page_url  : window.location.href,
                        event_type: 'phone',
                        event_value: tel_num,
                        target    : $el[0],
                        page_type : 1
                    });
                }

                // 智能电话
                if (telType === '1') {

                    tel_num = virtual_num;


                    var site_id = $el.find('input[name="site_id"]').val(),
                        ad_id = $el.find('input[name="ad_id"]').val();
                    device_id = _taq.getCommonData().device_id;

                    var phone_query = _taq.get_query({
                        page_url  : window.location.href,
                        event_type: 'phone_connect',
                        source: 'tel',
                        event_value: tel_num,
                        target    : $el[0],
                        page_type : 1
                    });


                    $.ajax({
                        url: GET_VIRTUAL_NUM,
                        type: 'GET',
                        async: false,
                        data: {
                            'virtual_num': virtual_num,
                            'callback_url': 'http://h5.toutiao.com/tetris/phone/callback/?' + $.param(phone_query),
                            'site_id': site_id,
                            'ad_id': ad_id,
                            'phoneId': phoneId,
                            'device_id': device_id
                        },
                        success: function (resp) {
                            if (!resp || resp.status_code !== '0') {
                                tel_num = virtual_num;
                                $el.attr('data-tel', tel_num);
                                $el.attr('href', 'tel:'+tel_num);
                                return ;
                            }
                            tel_num = resp.virtual_number;
                            $el.attr('data-tel', tel_num);
                            $el.attr('href', 'tel:'+tel_num);
                        },
                        error: function (resp) {
                            tel_num = virtual_num;
                            $el.attr('data-tel', tel_num);
                            $el.attr('href', 'tel:'+tel_num);
                        }
                    });

                    _taq.push({
                        page_url  : window.location.href,
                        event_type: 'phone',
                        event_value: tel_num,
                        target    : $el[0],
                        page_type : 1
                    });
                }

                var IOSbug = /^(171)|(175)/g;
                if (IOSbug.test(+tel_num)) {
                    window.location.href = 'tel:+86' + tel_num;
                } else {
                    window.location.href = 'tel:' + tel_num;
                }

                // 由于callNativePhone的jsbridge客户端实现有问题，无法触发callback
                // 所以暂停使用jsbridge拨打电话
                // if (dial > 0) {
                //     var timerHandler = setTimeout(function () {
                //         window.location.href = 'tel:' + tel_num;
                //     }, 1000);
                //     var dial_action_type = dial===1 ? 1 : 3;
                //     var bridge = window.ToutiaoJSBridge || {};
                //     if (that.isToutiao() && 'function' === typeof bridge.call) {
                //         bridge.call("callNativePhone", {
                //             "tel_num": tel_num,
                //             "dial_action_type": dial_action_type
                //         }, function (res) {
                //             if(res && res.code && res.code == -1 ){ //-1 表示调用失败
                //             }else{
                //                 clearTimeout(timerHandler);
                //             }

                //         });
                //     }
                //     evt.preventDefault();
                // }
                // window.location.href = 'tel://' + tel_num;
                evt.preventDefault();
            });

            if ($('.create-left-content').length) {
                $('.create-left-content')
                .append($el.parent().filter('.fbottom-left'));
            } else {
                $('<div class="create-left-content"/>')
                .append($el.parent().filter('.fbottom-left'))
                .appendTo('#content');
            };

            if ($('.create-right-content').length) {

                $('.create-right-content')
                .append($el.parent().filter('.fbottom-right'));

            } else {

                $('<div class="create-right-content"/>')
                .append($el.parent().filter('.fbottom-right'))
                .appendTo('#content');

            }

            /**
             * 建站落地页需要通过window.__toutiaoNativePhoneCallback将对应站点的电话详细事件进行回传记录
             * @param  {string} status 电话状态（call_up[拨打] | call_cutin[接通] | call_hangup[挂断]）
             * @param  {string} time   状态发生时间
             */
            window.__toutiaoNativePhoneCallback = function(status, time) {
                if (status==='call_hangup') {
                    var valueObj       = {};
                    valueObj.tel       = tel_num;
                    valueObj.duration1 = parseInt(time) - parseInt(phone_status['call_up']);
                    if (dial === 1) {
                        valueObj.duration2 = parseInt(time) - parseInt(phone_status['call_cutin']);
                    }
                    value = JSON.stringify(valueObj);

                    _taq.push({
                        page_url   : window.location.href,
                        event_type : 'phone_duration',
                        event_value: value,
                        target     : $el[0],
                        page_type  : 1
                    })
                } else {
                    phone_status[status] = time;
                }
            };
        },
        getLocationParam: function (param) {
            var adRequest = {
                QueryString: function (val) {
                    var uri = window.location.href;
                    var re = new RegExp("[&\?]{1}" + val + "=([^&?]*)", "ig");
                    return ((uri.match(re)) ? (decodeURI(uri.match(re)[0].substr(val.length + 2))) : '');
                }
            };
            return adRequest.QueryString(param);
        },
    }

    module.exports = {
        init: function (el, telType, phoneId, virtual_num) {
            (new Phone()).init(el, telType, phoneId, virtual_num);
        }
    }
});
