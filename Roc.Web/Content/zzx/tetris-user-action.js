!function(t,e){function n(t){N.push(t),H&&o()}function o(){for(H=!0;N.length;){var t=N.shift();t.call(null)}}function i(t){var e={QueryString:function(t){var e=window.location.href,n=new RegExp("[&?]{1}"+t+"=([^&?|^#?]*)","ig");return e.match(n)?decodeURI(e.match(n)[0].substr(t.length+2)):""}};return e.QueryString(t)}function a(){var e=setInterval(function(){function n(t){a.push(t),a.length>1&&o()}var i=t.ToutiaoJSBridge||{};if("function"==typeof i.call){var a=[];i.call("adInfo",{},function(t){var e;t=t||{},"string"==typeof t&&(t=JSON.parse(t)),T=T||t.cid||t.ad_id||"",e=JSON.parse(t.log_extra||"{}"),A=e.req_id||"",S=null!=e.rit&&JSON.stringify(e.rit),n("adInfo")}),i.call("appInfo",{},function(t){t=t||{},g=t.device_id||"",y=t.user_id||"",i.call("adInfo",{},function(t){t=t||{},"string"==typeof t&&(t=JSON.parse(t)),T=T||t.cid||t.ad_id||"",n("appInfo")})}),clearInterval(e)}},1e3)}function r(){h=i("ad_id"),T=i("cid"),A=A||i("req_id")}function c(){var t,e=window.decodeURIComponent(i("_toutiao_params")||"");try{t=JSON.parse(e),g=g||t.device_id||"",y=y||t.uid||"",A=A||t.req_id,S=S||t.rit||""}catch(n){}finally{o()}}function d(){var t="http://nativeapp.toutiao.com"==document.referrer||/(News|NewsSocial|Explore|NewsArticle|NewsInHouse|joke_essay|Joke|Video|VideoInHouse|VideoArticle)( |\/|_)(\d.\d.\d)/i.test(navigator.userAgent);return t}function u(t){var e=[];t=t||{};var n=/^(?:string|boolean|number)/i;for(var o in t)t.hasOwnProperty(o)&&n.test(typeof t[o])&&e.push(o+"="+t[o]);return e.join("&")}function p(t){var e=new XMLHttpRequest;e.open("POST",t.url,!1),e.setRequestHeader("Content-type","application/x-www-form-urlencoded"),e.send(u(t.data))}function s(t){var e=new XMLHttpRequest;e.open("POST",t.url,!0),e.setRequestHeader("Content-type","application/x-www-form-urlencoded"),e.send(u(t.data))}function l(){var e=t.location.pathname,n=/\d+/g,o=e.match(n)||[];return o[0]||""}function _(){E++,window.removeTetrisAction("page","stay_time"),window.addTetrisAction({component_type:"page",component_id:l(),action_type:"stay_time",action_value:E+"s"}),window.setTimeout(_,1e3)}function m(){var t=[{component_type:"page",component_id:l(),action_type:"pageview",action_value:document.visibilityState||"visible"}];s({url:I,data:v(t)})}function f(){window.addEventListener("load",function(){window.setTimeout(_,1e3);var t=window.screen.availHeight,e=document.body.scrollTop,n=document.documentElement.scrollHeight>document.documentElement.clientHeight?document.documentElement.scrollHeight:document.documentElement.clientHeight,o=t+e;o>n&&(o=n);var i=Math.round(100*o/n)+"%";window.addTetrisAction({component_type:"page",component_id:l(),action_type:"read_pct",action_value:i});var a=!0;window.addEventListener("scroll",function(){a&&(setTimeout(function(){window.removeTetrisAction("page","read_pct");var e=document.body.scrollTop||document.documentElement.scrollTop,o=t+e;o>n&&(o=n);var i=Math.round(100*o/n)+"%";window.addTetrisAction({component_type:"page",component_id:l(),action_type:"read_pct",action_value:i})},500),a=!1)}),window.addTetrisAction({component_type:"page",component_id:l(),action_type:"browse_pages",action_value:Math.ceil(n/t)})})}function v(t){var e={};return e.device_id=g||"",e.user_id=y||"",e.ad_id=h||"",e.cid=T||"",e.req_id=A||"",e.rit=S||"",e.site_id=l(),e.actions=JSON.stringify(t),e}function w(){b.length&&p({url:I,data:v(b)})}var y,g,h,T,A,S,b=[],E=0,I="//ad.toutiao.com/link_monitor/tetris_user_profile",N=[],H=!1;t.addTetrisAction=function(t){b.push({component_type:t.component_type||"",component_id:t.component_id||"",action_type:t.action_type||"",action_value:t.action_value||""})},t.removeTetrisAction=function(t,e){for(var n in b)b[n].component_type===t&&b[n].action_type===e&&b.splice(n,1)},t.getTetrisAction=function(t,e){for(var n in b)if(b[n].component_type===t&&b[n].action_type===e)return b[n];return null},t.__USER_ACTIONS__=function(){return b},t.addEventListener("click",function(t){for(var n=t.target,o={};n!=e;)n.hasAttribute("tetris-data-click")&&(o.component_type=n.getAttribute("tetris-data-component-type")||"",o.component_id=n.getAttribute("tetris-data-component-id")||"",o.action_type=n.getAttribute("tetris-data-action-type")||"",o.action_valule=n.getAttribute("tetris-data-action-value")||"",b.push(o)),n=n.parentNode},!1),t.addEventListener("unload",w,!1),r(),d()?a():c(),f(),n(m)}(window,document);