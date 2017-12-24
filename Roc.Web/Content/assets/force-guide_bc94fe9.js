/**
 * 悬浮组件（转化强引导）JSSDK
 */
(function (win, doc) {
  var BRICK_CLASS_MAP = {
    form: ['.piece.form-piece'],
    phone: ['.piece a.tel-btn'],
    qqcustomer: ['.piece a.qqcustomer-btn'],
    button: ['.piece.button-piece a.nor-btn[href]', '.piece.button-piece a.image-link[href]'],
    downloadbutton: ['.piece.downloadbutton a.nor-downloadbtn'],
    map: ['.piece .map-con > a[href]'],
  };
  var PRIORITY = Object.keys(BRICK_CLASS_MAP);
  var EXTERNAL_MAP = {
    '1': 'phone',
    '2': 'form',
    '3': 'map',
    '5': 'button',
    '9': 'downloadbutton',
    '97': 'qqcustomer',
  }

  /**
   * hide fixed bricks which are in the tetris page
   *
   */
  function hideFixedBricks() {
    var $style = doc.createElement('style');
    $style.setAttribute('force-guide', '');
    $style.innerHTML = '.fbottom,.create-left-content,.create-right-content{display:none}';
    doc.head.appendChild($style);
  }

  /**
   * display fixed bricks which are in the tetris page
   *
   */
  function showFixedBricks() {
    var $style = doc.head.querySelector('style[force-guide]');
    $style.parentElement.removeChild($style);
  }

  /**
   * get necessary parameters, such as pricing_type, external_type, force_guide and so on
   * 
   * @param {Function} callback
   */
  function getNecessaryParams(callback) {
    var jsbridgeTimeout = false;
    var timer = setTimeout(function () {
      jsbridgeTimeout = true;
      callback(null, null)
    }, 1000)
    getADInfo(callback);

    function getADInfo(callback) {
      if (!jsbridgeTimeout && window.ToutiaoJSBridge) {
        window.ToutiaoJSBridge.call('adInfo', {}, function (o) {
          clearTimeout(timer);

          o = o || {};
          if (typeof o === 'string') {
            o = JSON.parse(o);
          }

          var logExtra = o.log_extra || {};
          if (typeof logExtra === 'string') {
            logExtra = JSON.parse(logExtra);
          }

          var externalAction = logExtra.external_action;
          var reqId = logExtra.req_id;
          var convertComponentSuspend = logExtra.convert_component_suspend;
          callback(externalAction, reqId, convertComponentSuspend);
        });
      } else {
        setTimeout(function () {
          getADInfo(callback)
        }, 50);
      }
    }
  }

  /**
   * check if the ad parameters meet force guide contidions
   * 
   * @param {number} externalAction
   * @returns {boolean}
   */
  function meetForceGuideConditions(externalAction, reqId, convertComponentSuspend) {
    if (Object.keys(EXTERNAL_MAP).indexOf('' + externalAction) === -1) {
      if (convertComponentSuspend == 1) {
        if (navigator.userAgent.indexOf('RevealType/Dialog') === -1) {
          return true;
        }
      }
    }

    // 测试逻辑
    // var BLACK_REQ_ID = ['0', '2', '4', '6', '8', 'A', 'C', 'E'];
    // if (reqId) {
    //   var lastLetter = reqId[reqId.length - 1] || '';
    //   if (BLACK_REQ_ID.indexOf(lastLetter) === -1) {
    //     return true;
    //   }
    // }

    return false;
  }

  /**
   * find convert bricks from the tetris page
   * 
   * @returns {{string: HTMLElement}}
   */
  function findConvertBricks() {
    var result = {};

    PRIORITY.map(function (brickName, index) {
      BRICK_CLASS_MAP[brickName].map(function (selector) {
        if (result[brickName]) {
          return;
        }
        var tmpBrick = doc.querySelector(selector);
        if (!tmpBrick) {
          return;
        }
        switch(brickName) {
          case 'button': {
            if (tmpBrick.href) {
              result[brickName] = tmpBrick;
            }
            break;
          }
          default: {
            result[brickName] = tmpBrick;
          }  
        }
      });
    })

    return result;
  }

  /**
   * render force guide UI
   * 
   * @param {{type: string, element: HTMLElement}[]} bricks
   */
  function renderForceGuide(bricks) {
    addStyle(bricks.length);

    var $wrapper = addHtml(bricks);

    bindForceGuideEvent($wrapper, bricks);

    /**
     * add html to document
     * 
     * @param {{type: string, element: HTMLElement}[]} bricks
     * @returns {HTMLElement}
     */
    function addHtml(bricks) {
      var htmlStr = bricks.map(function (brick, index) {
        var convert;
        if (index === 0) {
          convert = true;
        } else {
          convert = false;
        }
        return renderItem(brick.type, convert);
      }).join('');

      var $wrapper = doc.createElement('DIV');
      $wrapper.className = 'force-guide';
      $wrapper.innerHTML = htmlStr;

      doc.body.appendChild($wrapper);

      return $wrapper;
    }

    /**
     * render force guide item according to type
     * 
     * @param {string} type 
     * @param {boolean} convert 
     * @returns {string}
     */
    function renderItem(type, convert) {
      var MAP = {
        form: { image: { light: '3541000b9eba1db25a4b', dark: '353d001937714b6fd883' }, text: '立即提交' },
        phone: { image: { light: '353e000b9fad0d331382', dark: '3541000b9ebcd8c016af' }, text: '电话拨打' },
        qqcustomer: { image: { light: '3541000b9eb9ab5a99d3', dark: '353f000ba03c5f3c2d8d' }, text: '在线咨询' },
        button: { image: { light: '353d0020c8c0405c5673', dark: '354200136d7b00d77c6b' }, text: '查看详情' },
        downloadbutton: { image: { light: '354200136d7dc5905c46', dark: '35390020d0ccaf9fd258' }, text: '应用下载' },
        map: { image: { light: '3541000b9ebbb807be81', dark: '353e000b9facf067e1bd' }, text: '地图搜索' },
      };
      var imageSrc;
      var text = MAP[type]['text'];
      var itemStr = '<div class="{item} guide-{type}" tetris-data-click tetris-data-component-type="force-guide-{type}" tetris-data-action-type="click"><img src="{src}" alt=""><span>{text}</span></div>'
      if (convert) {
        itemStr = itemStr.replace('{item}', 'guide-convert-item')
        imageSrc = generateSrc(MAP[type]['image']['light']);
      } else {
        itemStr = itemStr.replace('{item}', 'force-guide-item')
        imageSrc = generateSrc(MAP[type]['image']['dark']);
      }
      return itemStr.replace(/\{type\}/g, type).replace('{src}', imageSrc).replace('{text}', text);
    }

    /**
     * generate image src on the basis of cdn key
     * 
     * @param {string} id 
     * @returns {string}
     */
    function generateSrc(id) {
      var random = (Math.random() * 10) | 0;
      var src = '//p{random}.pstatp.com/origin/' + id;
      return src.replace('{random}', random);
    }

    /**
     * add style to document
     * 
     * @param {number} number 
     */
    function addStyle(number) {
      // add style tag
      var style = doc.createElement('style');
      var styleStr = '.force-guide{display:flex;height:50px;position:fixed;left:0;bottom:0;z-index:10000;width:100%;}.force-guide .force-guide-item{background-color:#fff;border:1px solid #E7E7E7;color:#666;font-size:12px;display:flex;flex-flow:column nowrap;align-items:center;justify-content:center}.force-guide .force-guide-item img{width:20px}.force-guide .force-guide-item:nth-child(n+1){border-left-width:0px}.force-guide .guide-convert-item{background-color:#f85959;color:#fff;font-size:18px;display:flex;flex-flow:row nowrap;align-items:center;justify-content:center;order:1}.force-guide .guide-convert-item img{width:22px}.force-guide .guide-convert-item span{margin-left:6px}';
      if (number === 1) {
        styleStr += '.force-guide .guide-convert-item{flex:0 0 100%}';
      } else if (number === 2) {
        styleStr += '.force-guide .guide-convert-item{flex:0 0 70%}.force-guide .force-guide-item{flex:0 0 30%}';
      } else if (number === 3) {
        styleStr += '.force-guide .guide-convert-item{flex:0 0 50%}.force-guide .force-guide-item{flex:0 0 25%}';
      }
      style.innerHTML = styleStr;
      doc.head.appendChild(style);

      // add body padding-bottom
      doc.body.style.paddingBottom = '50px';
    }

    /**
     * bind event for force guide items
     * 
     * @param {HTMLElement} $wrapper 
     * @param {{type: string, element: HTMLElement}[]} bricks
     */
    function bindForceGuideEvent($wrapper, bricks) {
      bricks.map(function (brick) {
        if (brick.type == 'form') {
          $wrapper.querySelector('.guide-' + brick.type).addEventListener('click', function (evt) {
            window.scrollTo(0, getOffsetTop(brick.element));
          })
        } else {
          $wrapper.querySelector('.guide-' + brick.type).addEventListener('click', function (evt) {
            NativeTrigger(brick.element, 'click');
          })
        }
      })
    }

    /**
     * get HTMLElement offset from document
     * 
     * @param {HTMLElement} elem 
     * @returns {number}
     */
    function getOffsetTop(elem) {
      var box = elem.getBoundingClientRect();

      var body = document.body;
      var docEl = document.documentElement;

      var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;

      var clientTop = docEl.clientTop || body.clientTop || 0;

      var top = box.top + scrollTop - clientTop;

      return Math.round(top);
    }

    /**
     * trigger event of element
     * 
     * @param {HTMLElement} element 
     * @param {string} type 
     */
    function NativeTrigger(element, type) {
      var event;

      if (document.createEvent) {
        event = document.createEvent("MouseEvents");
        event.initEvent(type, true, true);
      } else {
        event = document.createEventObject();
        event.eventType = type;
      }

      event.eventName = type;

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent("on" + event.eventType, event);
      }
    }
  }

  /**
   * execute force guide logic
   * 
   * @returns {void}
   */
  function doForceGuide(convertTarget) {
    if (finishForceGuide) {
      return;
    }
    finishForceGuide = true;

    var convertBricksMap = findConvertBricks();
    var convertBricks = Object.keys(convertBricksMap);
    if (convertBricks.indexOf(convertTarget) == -1) {
      showFixedBricks();
      return;
    }

    var forceGuideBricks = [{ type: convertTarget, element: convertBricksMap[convertTarget] }];
    PRIORITY.map(function (type) {
      if (forceGuideBricks.length == 3 || type === convertTarget) {
        return forceGuideBricks;
      }
      if (convertBricks.indexOf(type) > -1) {
        forceGuideBricks.push({ type: type, element: convertBricksMap[type] });
      }
      return forceGuideBricks;
    });
    
    renderForceGuide(forceGuideBricks);
  }

  function getExternalTarget(externalAction) {
    return EXTERNAL_MAP['' + externalAction] || '';
  }

  // start from here
  var finishForceGuide = false;

  hideFixedBricks();
  getNecessaryParams(function (externalAction, reqId, convertComponentSuspend) {
    if (!meetForceGuideConditions(externalAction, reqId, convertComponentSuspend)) {
      showFixedBricks();
      return;
    }

    var externalTarget = getExternalTarget(externalAction)
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', function () {
        doForceGuide(externalTarget);
      })
    } else {
      doForceGuide(externalTarget);
    }
  });
})(window, document);
