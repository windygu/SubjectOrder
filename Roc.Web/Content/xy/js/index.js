
$(function () {

    $("#datetime-picker").datetimePicker();
    const indexPage = {
        'pxToRem': function () {
            var nSize = '';
            var screenWidth = document.documentElement.clientWidth
            nSize = 20 * screenWidth / 320;
            if (nSize > 40) {
                nSize = 40;
            }
            document.documentElement.style.fontSize = nSize + 'px';
        },
        is_warning: false,
        warn: function (str, time) {
            var self = this;
            if (!str) {
                return;
            }
            if (self.is_warning) {
                return;
            }
            self.is_warning = true;
            var warnObj = $('.warning');
            warnObj.html(str).addClass('animated slideInUpWarning').show();
            if (!time) {
                var time = 1300;
            }
            setTimeout(function () {
                //warnObj.removeClass('animated slideInUpWarning');
                warnObj.addClass('animated fadeOut');
                setTimeout(function () {
                    warnObj.removeClass('animated fadeOut slideInUpWarning').hide();
                    self.is_warning = false;
                }, 200)
            }, time);
        },
        'tel': function (num) {
            var reg = /^1[3|4|5|7|8][0-9]{9}$/;
            return reg.test(num);
        },
        'email': function (str) {
            var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            return reg.test(str);
        },
        'closeBoxy': function () {
            $('.btn-know').click(function () {
                $('.boxy').hide();
            })
        },
        'buyCount': '1',
        'add': function () {

            $('.add').click((function () {
                var sum = $('.sum-box input').val();
                sum++;
                $('.sum-box input').val(sum)

            }))
        },
        "reduce": function () {

            $('.reduce').click((function () {
                var sum = $('.sum-box input').val();
                sum--;
                if (!sum) {
                    return;
                }
                $('.sum-box input').val(sum)
            }))
        },
        validateForm: function () {
            var self = this;
            var $_form = $('#buyForm');
            var requires = $_form.find('[required]');
            console.log(requires)
            for (var i = 0, len = requires.length; i < len; i++) {
                var tip = {
                    'trade': '请填写商品名称',
                    'count': '请填写商品数量',
                    'name': '请填写姓名',
                    'tel': '请填写联系方式',
                    'code': '请填写验证码',
                    'city': '请选择城区',
                    'address': '请填写具体地址',
                    'type': '请选择付款方式',
                    'money': '请填写金额',
                };
                var $_this = requires.eq(i);
                var name = $_this.data('type');
                var value = '';
                if (name == 'type') {
                    value = $_this.is(':checked');
                    console.log(value)
                } else {
                    value = $_this.val();
                }

                console.log(name + '-' + value);
                if (!value) {
                    self.warn(tip[name]);
                    $_this.focus();
                    return false;
                }
            }
            var model = {};
            model.productname = $("#trade").find("option:selected").text();  
            model.productprice = $("#trade").val();
            model.username = $("#name").val();
            model.phone = $("#tel").val();
            model.area = $("#city-picker").val();
            model.address = $("#address").val();
            model.paytype = $("#type").val();
            model.remark = $("#remark").val();
       
            $.ajax({
                url: '/OrderServiceX/CommitOrder/?rd=' + Math.random(),
                type: "POST",
                data: JSON.stringify(model),
                contentType: "application/json; charset=utf-8",
                dataType: 'JSON',
                success: function (result) {

                    alert(result.message);
                    //if (result.status == "1") {

                    //    alert('提交成功，我们会在收到信息后第一时间联系您');

                    //}
                }
            });
            return true;
        },
        pay: function () {
            var self = this;
            $('.btn').click(function () {
                self.validateForm();
                /*   var ajaxFormOption = {
                 'type': "POST",
                 'dataType': "json",
                 'beforeSubmit': function () {
                 return self.validateForm();
                 },
                 //                    'data': self.paramData,//自定义数据参数，视情况添加
                 //                    'url': "", //请求url
                 'success': function (data) {

                 },
                 "error": function (err) {
                 ;
                 $.alert('错误码: ' + err.status, '');
                 }
                 };
                 $('#buyForm').ajaxSubmit(ajaxFormOption);*/
            })

        }
    }
    indexPage.pxToRem();
    indexPage.add();
    indexPage.reduce();
    indexPage.pay();
    $("#city-picker").cityPicker({
        title: "请选择收货地址"
    });

})

