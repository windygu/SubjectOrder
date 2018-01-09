;+function() {
	var NIGHT_MODE_CODE = 0,
		LIGHT_MODE_CODE = 1,
		APP_DIALOG_CODE = 'dialog';
	var matchParam = function(key) {
		return function(value) {
			var str, reg = new RegExp("(" + key + ")(\\=)(\\w+)", "g");
			str = window.location.href.match(reg);
			var parameter = (str && str[0]) ? str[0].split('=') : [];
			if (parameter[0] && parameter[0] === key && parameter[1] && parameter[1] == value) {
				return true;
			} else {
				return false;
			}
		}
	}
	var isWebviewDialogUrl = matchParam('revealType');
	var isNightMode = matchParam('dayMode');
	function isAppDialog (){
        var get_dialog_ua = navigator.userAgent.match(/RevealType\/Dialog/i);
        return get_dialog_ua || isWebviewDialogUrl(APP_DIALOG_CODE);
    }

    +function(el, className){
        if(isAppDialog() && isNightMode(NIGHT_MODE_CODE)){
            document.getElementsByTagName(el)[0].className = className;
        }
    }('html', 'ui-night-mode');
}();