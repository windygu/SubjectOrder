window.TTNotice = (function(){
        var b1;
        var moveHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
        };
        function Notice($parent, title, content, buttonContent, type, callback, confirm, canclecb) {
            var show_confirm = confirm ? 'inline-block' : 'none';
            var tpl1 = [
                '<div class="popup-wrap">',
                    '<div class="popup-box">',
                        '<div class = "title">',
                            '<div class="warm-icon"></div>',
                            '<span class= "notice-title">',
			    	            title,
                            '</span>',
                        '</div>',
                        '<div class= "content">',
                            content,
                        '</div>',
                        '<div class="btn popup-close">',
                            buttonContent,
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');
            var tpl2 =['<div class="popup-wrap">',
                    '<div class="popup-box">',
                        '<div class = "title">',
                            '<div class="success-icon"></div>',
                            '<span class= "notice-title">',
                                title,
                            '</span>',
                        '</div>',
                        '<div class= "content">',
                            content,
                        '</div>',
                        '<div class="btn popup-cancle" style="display:'+show_confirm+'">',
                            '取消',
                        '</div>',
                        '<div class="btn popup-close">',
                            buttonContent,
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');
            // type 1为warm，0为成功提示
            this.tpl = type == 1 ? tpl1 : tpl2;
            this.$parent = $parent;
            this.$el = $(this.tpl);
            this.callback = callback;
            this.canclecb = canclecb;
            this.init(this.$el);
            this.bindEvent(this.$el);
        }

        Notice.prototype = {
            init: function($el){
                this.$parent.append($el);
                document.body.style.overflow = "hidden";
                document.getElementsByTagName("body")[0].addEventListener("touchmove", moveHandler, false);
            },
            bindEvent: function($el){
                var that = this;
                $el.on('click', '.popup-close', function(e) {
                    $('.popup-wrap').remove();
                    document.body.style.overflow = "";
                    document.getElementsByTagName("body")[0].removeEventListener("touchmove", moveHandler, false);
                    e.preventDefault();
                    e.stopPropagation();
                    if(that.callback){
                        that.callback();
                    }
                });
                $el.on('click', '.popup-cancle', function(e) {
                    $('.popup-wrap').remove();
                    document.body.style.overflow = "";
                    document.getElementsByTagName("body")[0].removeEventListener("touchmove", moveHandler, false);
                    e.preventDefault();
                    e.stopPropagation();
                    that.canclecb && canclecb();
                });
                $el.on('click', '.popup-wrap', function(e) {
                    $('.popup-wrap').remove();
                    document.body.style.overflow = "";
                    document.getElementsByTagName("body")[0].removeEventListener("touchmove", moveHandler, false);
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        };


        return {
            create: function($parent, opt) {
                var title = opt.title || '提示';
                var content = opt.content || '';
                var buttonContent = opt.buttonContent || '关闭';
                var type = opt.type || 0;
                var cb = opt.callback;
                var confirm = opt.confirm || false;
                var canclecb = opt.canclecb;
                return new Notice($parent, title, content, buttonContent, type, cb, confirm, canclecb);
            }
        };
})();
