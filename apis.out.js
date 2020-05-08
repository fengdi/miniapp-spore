"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _mpCloudSdk = _interopRequireDefault(require("@tbmp/mp-cloud-sdk"));

var _default = function _default(config) {
  _mpCloudSdk["default"].init({
    env: config.env
  });

  var fn = _mpCloudSdk["default"]["function"].invoke.bind(_mpCloudSdk["default"]["function"]);

  var f = function f(name, data) {
    var args = name.split(".");
    args.splice(1, 0, data);
    return fn.apply(_mpCloudSdk["default"]["function"], args);
  };

  var toast = function toast(str) {
    my.showToast({
      content: str
    });
  };

  var toastError = function toastError(str) {
    my.showToast({
      content: str || "",
      type: "exception"
    });
  };

  var fetchData = function fetchData(res) {
    try {
      if (res) {
        if (!res.success) {
          toastError(res.message);
        } else {
          return res.data;
        }
      } else {
        toastError("请求服务器失败");
      }
    } catch (e) {
      toastError(e.toString());
    }

    return null;
  };

  var fetchMessage = function fetchMessage(res) {
    try {
      if (res) {
        if (!res.success) {
          toastError(res.message);
        } else {
          return res.message;
        }
      } else {
        toastError("请求服务器失败");
      }
    } catch (e) {
      toastError(e.toString());
    }

    return null;
  };

  var randomByWeights = function randomByWeights(boxProbabilitys) {
    if (!Array.isArray(boxProbabilitys)) {
      return -1;
    }

    boxProbabilitys = [0].concat(boxProbabilitys);
    var boxProbabilityMap = [];
    var boxProbabilityWeight = boxProbabilitys.reduce(function (a, c) {
      boxProbabilityMap.push(a + c);
      return a + c;
    });
    var randomWeight = Math.random() * boxProbabilityWeight;
    return boxProbabilityMap.findIndex(function (pb) {
      return pb > randomWeight;
    });
  };

  var shuffle = function shuffle(a) {
    var length = a.length;
    var shuffled = Array(length);

    for (var index = 0, rand; index < length; index++) {
      rand = ~~(Math.random() * (index + 1));
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = a[index];
    }

    return shuffled;
  };

  var dateFormat = function dateFormat(timeStamp, fmt) {
    var d = new Date(timeStamp);
    var o = {
      "M+": d.getMonth() + 1,
      "d+": d.getDate(),
      "h+": d.getHours() % 12 === 0 ? 12 : d.getHours() % 12,
      "H+": d.getHours(),
      "m+": d.getMinutes(),
      "s+": d.getSeconds(),
      "q+": Math.floor((d.getMonth() + 3) / 3),
      S: d.getMilliseconds()
    };
    var week = ["日", "一", "二", "三", "四", "五", "六"];

    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    if (/(E+)/.test(fmt)) {
      var name = "";

      if (RegExp.$1.length > 2) {
        name = "星期";
      } else if (RegExp.$1.length > 1) {
        name = "周";
      }

      fmt = fmt.replace(RegExp.$1, name + week[d.getDay()]);
    }

    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }

    return fmt;
  };

  var env = function env(t) {
    var e = t.title,
        r = t.content,
        n = t.backgroundColor || "#1475b2",
        i = ["%c ".concat(e, " %c ").concat(r, " "), "padding: 1px; border-radius: 3px 0 0 3px; color: #fff; text-decoration: none; background: ".concat("#606060", ";"), "padding: 1px; border-radius: 0 3px 3px 0; color: #fff; text-decoration: none; background: ".concat(n, ";")];
    return function () {
      var t;
      console && "function" === typeof console.log && (t = console).log.apply(t, arguments);
    }.apply(void 0, i);
  };

  var sysInfo = null;
  var icssData = {};
  var activityId = "";
  var apis = {
    cloud: _mpCloudSdk["default"],
    f: f,
    fn: fn,
    env: env,
    toast: toast,
    toastError: toastError,
    fetchData: fetchData,
    fetchMessage: fetchMessage,
    dateFormat: dateFormat,
    randomByWeights: randomByWeights,
    shuffle: shuffle,
    alert: function alert(str) {
      my.alert({
        content: str
      });
    },
    setActivityId: function setActivityId(id) {
      activityId = id;
    },
    icss: function icss() {
      var _arguments = arguments;
      return (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee() {
        var page;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                page = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : "index";

                if (!icssData[page]) {
                  _context.next = 5;
                  break;
                }

                _context.t0 = icssData[page];
                _context.next = 8;
                break;

              case 5:
                _context.next = 7;
                return fn("icss", {}, page);

              case 7:
                _context.t0 = icssData[page] = _context.sent;

              case 8:
                return _context.abrupt("return", _context.t0);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    authorize: function authorize() {
      return new Promise(function (resolve, reject) {
        my.authorize({
          scopes: "scope.userInfo",
          success: function success(res) {
            resolve(res);
          },
          fail: function fail(e) {
            reject(e);
          }
        });
      });
    },
    getUserInfo: function getUserInfo() {
      return new Promise(function (resolve, reject) {
        my.getAuthUserInfo({
          success: function success(res) {
            resolve(res);
          },
          fail: function fail(e) {
            reject(e);
          }
        });
      });
    },
    getSystemInfo: function getSystemInfo() {
      return sysInfo ? sysInfo : sysInfo = my.getSystemInfoSync();
    },
    openItem: function openItem(id) {
      apis.jump("https://detail.m.tmall.com/item.htm?id=".concat(id));
    },
    getAppInfo: function getAppInfo() {
      var sysData = my.getSystemInfoSync();
      var height = 750 * sysData.screenHeight / sysData.screenWidth;
      ;
      var appInfo = {
        height: height,
        headerHeight: 176,
        platform: sysData.platform
      };

      if (height <= 1350) {
        appInfo.type = "minPage";
        appInfo.headerHeight = 132;
        appInfo.appType = 'pagemin';
      } else {
        appInfo.type = "maxPage";
        appInfo.headerHeight = 176;
        appInfo.appType = 'pagemax';
      }

      appInfo.platform = appInfo.platform.toLowerCase();

      if (appInfo.platform && appInfo.platform.toLowerCase() == 'android') {
        appInfo.headerHeight = 150;
      }

      var result = {
        success: true,
        data: appInfo
      };
      return result;
    },
    collectItem: function collectItem(id) {
      return new Promise(function (resolve, reject) {
        my.tb.collectGoods({
          id: id,
          success: function success(res) {
            resolve(res);
          },
          fail: function fail(e) {
            reject(e);
          }
        });
      });
    },
    checkCollectItems: function checkCollectItems() {
      var ids = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      return Promise.all(ids.map(function (id) {
        return new Promise(function (resolve, reject) {
          my.tb.checkGoodsCollectedStatus({
            id: id,
            success: function success(res) {
              resolve(res);
            },
            fail: function fail(e) {
              reject(e);
            }
          });
        });
      }));
    },
    favorShop: function favorShop(id) {
      id = parseInt(id || config.shop.sellerId);
      return new Promise(function (resolve, reject) {
        my.tb.favorShop({
          id: id,
          success: function success(res) {
            resolve(res);
          },
          fail: function fail(e) {
            reject(e);
          }
        });
      });
    },
    shareApp: function shareApp() {
      return new Promise(function (resolve, reject) {
        my.showSharePanel({
          success: function success(res) {
            resolve(res);
          },
          fail: function fail(e) {
            reject(e);
          }
        });
      });
    },
    getAppUrl: function getAppUrl(page) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      page = page ? page : 'pages/index/index';
      var base = config.appUrl;
      var query = apis.query(params || {});
      return "".concat(base, "&page=").concat(page, "?") + encodeURIComponent("".concat(query));
    },
    getShareUrl: function getShareUrl(page) {
      var shareQuery = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return apis.getAppUrl(page, shareQuery);
    },
    tobeMember: function tobeMember(page) {
      var _arguments2 = arguments;
      return (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2() {
        var params, memberUrl, backUrl;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                params = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : {};
                memberUrl = "https://market.m.taobao.com/app/sj/shop-membership-center/pages/index?wh_weex=true&sellerId=".concat(config.shop.sellerId, "&extraInfo=%7B%22source%22%3A%22isvapp%22%2C%22activityId%22%3A%22miniapp%22%2C%22entrance%22%3A%22hudong%22%7D&callbackUrl=");
                backUrl = apis.getAppUrl(page, params);
                apis.jump("".concat(memberUrl).concat(encodeURIComponent(backUrl)));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    jump: function jump(url) {
      return new Promise(function (resolve, reject) {
        var config = {
          url: url,
          success: function success(res) {
            resolve(res);
          },
          fail: function fail(e) {
            reject(e);
          }
        };

        if (/^\w+\:\/\//.test(url)) {
          my.call("navigateToOutside", config);
        } else {
          my.navigateTo(config);
        }
      });
    },
    query: function query(params) {
      params = params || {};
      return Object.keys(params).map(function (k) {
        return "".concat(k, "=").concat(params[k]);
      }).join("&");
    },
    cloudFile: function cloudFile() {
      var _arguments3 = arguments;
      return (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3() {
        var urls, map, resUrls;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                urls = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : [];
                urls = Array.isArray(urls) ? urls : [urls];
                map = {};
                _context3.next = 5;
                return _mpCloudSdk["default"].file.getTempFileURL({
                  fileId: urls
                });

              case 5:
                resUrls = _context3.sent;
                resUrls.map(function (res) {
                  return map[res.fileId] = res.url;
                });
                return _context3.abrupt("return", urls.map(function (url) {
                  return map[url] || "";
                }));

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    }
  };
  return apis;
};

exports["default"] = _default;
