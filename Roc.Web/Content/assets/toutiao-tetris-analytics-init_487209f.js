(function() {
    _tt_config = true; //当此值为false或者未定义时，会发送用户的所有点击行为，当为true时，关闭此统计
    _page_type = 1;//1为静态建站，2为动态建站，不填或0为非建站
    var ta = document.createElement('script'); ta.type = 'text/javascript'; ta.async = true;
    ta.src = document.location.protocol + '//' + 's3.pstatp.com/bytecom/resource/track_log/src/toutiao-track-log.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ta, s);
})();
