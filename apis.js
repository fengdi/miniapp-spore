import cloud from "@tbmp/mp-cloud-sdk";

export default (config) => {
    // console.log("config", config);

    cloud.init({
        // env: 'test' //'online'
        env: config.env,
    });

    //云函数简化版 1 
    //用法 fn(云函数, 数据, 函数名)
    const fn = cloud.function.invoke.bind(cloud.function);

    //云函数简化版 2
    //用法 await f(`${云函数.函数名}`, 数据)
    // f("winonaLachineCms.appletEntrance", data)
    const f = (name, data) => {
        let args = name.split(".");
            args.splice(1, 0, data);
        return fn.apply(cloud.function, args);
    };

    
    //简化系统提示信息
    const toast = function (str) {
        my.showToast({
            content: str,
        });
    };
    //简化错误提示信息
    const toastError = function (str) {
        my.showToast({
            content: str || "",
            type: "exception",
        });
    };

    //取云函数data字段，自动检测错误，错误data为null
    const fetchData = function (res) {
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
    //取操作类(只需要返回是否成功的，比如提交 删除)云函数，自动检测错误，错误data为null
    const fetchMessage = function (res) {
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

    // https://gitee.com/ddm/randomByWeights
    var randomByWeights = function (boxProbabilitys) {
        if (!Array.isArray(boxProbabilitys)) {
            return -1;
        }
        boxProbabilitys = [0].concat(boxProbabilitys);

        let boxProbabilityMap = [];
        let boxProbabilityWeight = boxProbabilitys.reduce((a, c) => {
            boxProbabilityMap.push(a + c);
            return a + c;
        });
        let randomWeight = Math.random() * boxProbabilityWeight;

        return boxProbabilityMap.findIndex((pb) => pb > randomWeight);
    };

    // 数组洗牌
    let shuffle = function (a) {
        var length = a.length;
        var shuffled = Array(length);

        for (var index = 0, rand; index < length; index++) {
            rand = ~~(Math.random() * (index + 1));
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = a[index];
        }

        return shuffled;
    };

    /*
     * 日期格式化
     * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * dateFormat(date, "yyyy-MM-dd hh:mm:ss.S") ==> 2016-07-02 08:09:04.423
     * dateFormat(date, "yyyy-MM-dd E HH:mm:ss") ==> 2019-03-10 二 20:09:04
     * dateFormat(date, "yyyy-MM-dd EE hh:mm:ss") ==> 2019-03-10 周二 08:09:04
     * dateFormat(date, "yyyy-MM-dd EEE hh:mm:ss") ==> 2019-03-10 星期二 08:09:04
     * dateFormat(date, "yyyy-M-d h:m:s.S") ==> 2016-7-2 8:9:4.18
     */
    const dateFormat = function (timeStamp, fmt) {
        const d = new Date(timeStamp);
        const o = {
            "M+": d.getMonth() + 1, //月份
            "d+": d.getDate(), //日
            "h+": d.getHours() % 12 === 0 ? 12 : d.getHours() % 12, //小时
            "H+": d.getHours(), //小时
            "m+": d.getMinutes(), //分
            "s+": d.getSeconds(), //秒
            "q+": Math.floor((d.getMonth() + 3) / 3), //季度
            S: d.getMilliseconds(), //毫秒
        };
        const week = ["日", "一", "二", "三", "四", "五", "六"];
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (d.getFullYear() + "").substr(4 - RegExp.$1.length)
            );
        }
        if (/(E+)/.test(fmt)) {
            let name = "";
            if (RegExp.$1.length > 2) {
                name = "星期";
            } else if (RegExp.$1.length > 1) {
                name = "周";
            }
            fmt = fmt.replace(RegExp.$1, name + week[d.getDay()]);
        }
        for (const k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1
                        ? o[k]
                        : ("00" + o[k]).substr(("" + o[k]).length)
                );
            }
        }
        return fmt;
    };

    // 开发者工具打印信息
    // env({title:"",content:" "})
    let env = function (t) {
        //#42c02e 绿
        //#1475b2 蓝
        var e = t.title,
            r = t.content,
            n = t.backgroundColor || "#1475b2",
            i = [
                "%c ".concat(e, " %c ").concat(r, " "),
                "padding: 1px; border-radius: 3px 0 0 3px; color: #fff; text-decoration: none; background: ".concat(
                    "#606060",
                    ";"
                ),
                "padding: 1px; border-radius: 0 3px 3px 0; color: #fff; text-decoration: none; background: ".concat(
                    n,
                    ";"
                ),
            ];
        return function () {
            var t;
            console &&
                "function" === typeof console.log &&
                (t = console).log.apply(t, arguments);
        }.apply(void 0, i);
    };
    
    let sysInfo = null; //系统信息缓存
    let icssData = {}; //icss缓存
    let activityId = ""; //活动id

    let apis = {
        cloud,
        f,
        fn,
        env,
        toast,
        toastError,
        dateFormat,
        randomByWeights,
        shuffle,
        setActivityId(id) {
            activityId = id;
        },
        //自定义样式
        async icss(page = "index") {
            return icssData[page]
                ? icssData[page]
                : (icssData[page] = await fn("icss", {}, page));
        },
        //授权
        authorize() {
            return new Promise(function (resolve, reject) {
                my.authorize({
                    // scopes: '*',
                    scopes: "scope.userInfo",
                    success(res) {
                        resolve(res);
                    },
                    fail(e) {
                        reject(e);
                    },
                });
            });
        },
        //用户信息
        getUserInfo() {
            return new Promise(function (resolve, reject) {
                my.getAuthUserInfo({
                    success: (res) => {
                        resolve(res);
                    },
                    fail: (e) => {
                        reject(e);
                    },
                });
            });
        },
        //系统信息
        getSystemInfo() {
            //做了缓存
            return sysInfo ? sysInfo : (sysInfo = my.getSystemInfoSync());
        },
        //收藏商品
        collectItem(id) {
            return new Promise(function (resolve, reject) {
                my.tb.collectGoods({
                    id,
                    success: (res) => {
                        resolve(res);
                    },
                    fail: (e) => {
                        reject(e);
                    },
                });
            });
        },
        //数组版检查收藏商品状态
        checkCollectItems(ids = []) {
            return Promise.all(
                ids.map(
                    (id) =>
                        new Promise(function (resolve, reject) {
                            my.tb.checkGoodsCollectedStatus({
                                id,
                                success: (res) => {
                                    resolve(res);
                                },
                                fail: (e) => {
                                    reject(e);
                                },
                            });
                        })
                )
            );
        },
        //收藏店铺
        favorShop(id) {
            id = parseInt(id || config.shop.sellerId);
            return new Promise(function (resolve, reject) {
                my.tb.favorShop({
                    id,
                    success: (res) => {
                        resolve(res);
                    },
                    fail: (e) => {
                        reject(e);
                    },
                });
            });
        },
        //唤起分享栏
        shareApp() {
            return new Promise(function (resolve, reject) {
                my.showSharePanel({
                    success: (res) => {
                        resolve(res);
                    },
                    fail: (e) => {
                        reject(e);
                    },
                });
            });
        },
        /**
         * 生成app页面地址默认pages/index/index
         * page   {[String]} 回调返回页面，字符串 "pages/index/index" 默认值 pages/index/index
         * params {[Object]} 页面带的参数，对象，在page的onLoad方法query中获取 默认值 {}
         */
        getAppUrl(page, params = {}){
            page = page ? page : 'pages/index/index';

            let base = config.appUrl;

            let query = apis.query(params || {});

            return `${base}&page=${page}?` + encodeURIComponent(`${query}`);
        },
        /**
         * 跳到会员页面
         * page   {[String]} 回调返回页面，字符串 "pages/index/index" 默认值 pages/index/index
         * params {[Object]} 页面带的参数，对象，在page的onLoad方法query中获取 默认值 {}
         */
        async tobeMember(page, params = {}) {

            let memberUrl = `https://market.m.taobao.com/app/sj/shop-membership-center/pages/index?wh_weex=true&sellerId=${config.shop.sellerId}&extraInfo=%7B%22source%22%3A%22isvapp%22%2C%22activityId%22%3A%22miniapp%22%2C%22entrance%22%3A%22hudong%22%7D&callbackUrl=`;

            let backUrl = apis.getAppUrl(page, params);

            apis.jump(`${memberUrl}${encodeURIComponent(backUrl)}`);

        },
        // 页面跳转 url自动外跳
        jump(url) {
            return new Promise(function (resolve, reject) {
                let config = {
                    url,
                    success: (res) => {
                        resolve(res);
                    },
                    fail: (e) => {
                        reject(e);
                    },
                };
                if (/^\w+\:\/\//.test(url)) {
                    my.call("navigateToOutside", config);
                } else {
                    my.navigateTo(config);
                }
            });
        },
        //对象转url参数 {"foo":"bar", id:"213"}  => foo=bar&id=213
        query(params) {
            params = params || {};
            params.id = activityId;
            return Object.keys(params)
                .map((k) => `${k}=${params[k]}`)
                .join("&");
        },
        // url参数转对象
        // params(query){
        //   return Object.fromEntries(query.split("&").map(p=>p.split('=')));
        // }
        //获取云存储URL，数组顺序对应，查不到返回空字符串
        async cloudFile(urls = []) {
            urls = Array.isArray(urls) ? urls : [urls];

            let map = {};
            let resUrls = await cloud.file.getTempFileURL({
                fileId: urls,
            });

            resUrls.map((res) => (map[res.fileId] = res.url));

            return urls.map((url) => map[url] || "");
        },


        //============================= 以下为项目云函数配置 ====================================
        /**
         * 在每个云函数 配好文档地址（带哈希路径的）
         * 可以利用的方法  f fn fetchData fetchMessage
         * 下面是例子：（可以删除）
         */
        
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#iVicW
        // 用户任务完成
        async task(data) {
            // console.log("任务", data)
            data = data || {
                type: "",
                mold: "",
                reason: "",
                subscribe: "",
            };
            //直接返回云函数结构体
            return await fn("user", data, "task");
            //或者 return await f("user.task", data); //注：字符串.区分
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#HQKPt
        // 小程序入口
        async enter() {
            //取data数据
            return fetchData(await f("user.enter", {}));
        },
        
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#sG04c
        // 行为次数统计
        async spmCount(type = "view") {
            let startDatetime = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
            let endDatetime = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
            //取成功状态 
            return fetchMessage(
                await f("spm.spmCount",{ type, startDatetime, endDatetime })
            );
        }


    };

    return apis;
};
