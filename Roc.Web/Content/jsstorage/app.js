App.directive({
    lazyLoadImages: {
        bind: function (el, binding){
			var width = Math.min(750, $(window).width());
			this.element(el).each(function (i){
				var ratio = parseFloat($(this).attr('data-ratio'));
                if ($(this).attr('src').indexOf('empty') > -1) {
				    $(this).parent().height(width*ratio).addClass('loading-bg');
                }
				if (i < 3) {
					$(this).attr('src', $(this).attr('data-src'));
				}
			});
        },

        update: function (el, binding, self){
            var height = $(window).innerHeight();

            this.element(el).each(function (){
                var rect = this.getClientRects()[0];
                if (rect.bottom < 0 || rect.top > height) {
                    return;
                }

                var dataSrc = $.trim(this.getAttribute('data-src'));
                if (this.src.indexOf(dataSrc) != -1) {
                    return;
                }

                $(this).clearQueue('lazy').queue('lazy', function (next){
                    this.onload = function (){
                        $(this).fadeTo('fast', 1);
                        $(this).parent().removeClass('loading-bg')
                    };

                    $(this).css('opacity', 0);
                    next();
                }).delay(50*Math.random(), 'lazy').queue('lazy', function (next){
                    this.src = dataSrc;
                    next();
                }).delay(1000, 'lazy').queue('lazy', function (){
                    $(this).css('opacity', 1);
                    $(this).parent().removeClass('loading-bg');
                }).dequeue('lazy');
            });
        }
    }
});


App.create(function (){
	var lazyLoadId;

	function scrollTop(){
		return Math.max($('html').scrollTop(), $('body').scrollTop());
	}

    return {
		el: 'body',

		elements: {
			imgs: 'section img',
			win: window
		},

		render: {
			imgs: {
				lazyLoadImages: 'scrollTop'
			},

			win: {
				'on:scroll': function (){
					clearTimeout(lazyLoadId);
					lazyLoadId = setTimeout($.proxy(function (){
					    this.set('scrollTop', scrollTop());
					}, this), 30);
				}
			}
		}
	};
});


App.create({
    el: 'body',

	data: {
        count: 1,
        type: 1,
        price: 268
    },

    willSet: {
        count: function (v){
            return Math.max(1, Math.min(1000, v));
        }
    },

    render: {
        '.js-gotoform': {
            '@click' : function (e){
                var scrollTop = this.element('.js-form').offset().top;
				$('html,body').stop().animate({
					scrollTop: scrollTop
				});
            }
        },

        '.sale-type span': {
            init: function (el){
                var self = this;
                var all = this.element(el);

                all.click(function (){
                    all.removeClass('selected');
                    $(this).addClass('selected');
                    self.set('type', this.getAttribute('data-type'));
                    self.set('price', this.getAttribute('data-price'));
                });
            }
        },

        '.sale-type input': {
            val: 'type'
        },

        '.add-minus span': {
            init: function (el){
                var self = this;
                var span = this.element(el);

                span.click(function (){
                    var count = self.get('count');
                    var add = this.innerHTML == '+';
                    self.set('count', count + (add ? 1 : -1));
                });
            }
        },

        '.add-minus input': {
            'on:input': function (e){
                var val = parseInt(this.element(e).val()) || '';
                this.set('count', val);
                this.element(e).val(this.get('count'));
            },
            'val': 'count'
        },

        '.price': 'price | {{$}}.00',

        '*.js-submit': {
            'on:click': function (){
                //提交验证
                console.log(this.data);

                this.element('.js-input').each(function (){
                    var need = this.getAttribute('data-noneed') != '1';

                    if (this.value == '' && need) {
                        alert(this.getAttribute('placeholder'));
                        this.focus();
                        return false;
                    }
                });
            }
        },

        '.js-input': {
            init: function (el){
                var self = this;

                this.nameMap = {};
                this.element(el).each(function (){
                    var name = this.getAttribute('name');
                    self.set(name, '');
                });
            },

            '@input': function (e){
                var el = this.element(e);
                this.set(el.attr('name'), $.trim(el.val()));
            }
        }
    }
});