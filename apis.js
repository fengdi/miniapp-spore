import cloud from "@tbmp/mp-cloud-sdk";
// import { isArray } from 'util';

export default (config) => {
    // console.log("config", config);

    cloud.init({
        // env: 'test'
        env: config.env, //'online'
    });

    const fn = cloud.function.invoke.bind(cloud.function);

    let sysInfo = null; //系统信息缓存
    let icssData = {}; //icss缓存

    //云函数简化版
    const f = (name, data) => {
        return fn.apply(cloud.function, name.split(".").splice(1, 0, data));
    };
    // await f(`${云函数.函数名}`, 数据)
    // f("winonaLachineCms.appletEntrance", data)

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

    let activityId = "";

    return {
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
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#HQKPt
        // 小程序入口
        async enter() {
            return fetchData(await fn("user", {}, "enter"));
        },
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
            return await fn("user", data, "task");
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#nmfdK
        // 填写城市
        async city(city = "") {
            return await fn("user", { city }, "city");
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#zmkMg
        // 开始游戏,会扣一次游戏次数
        async playing() {
            return await fn("user", {}, "playing");
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#jrBVb
        // 游戏提醒,会扣一次游戏提醒次数
        async remind() {
            return await fn("user", {}, "remind");
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#Fk6rt
        // 结算游戏分数
        async score(score = 0, level = "level1") {
            return await fn("user", { score, level }, "score");
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#1au1e
        // 我的奖品
        async prize() {
            return fetchData(await fn("user", {}, "prize"));
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#eQs7h
        // 提交领奖信息
        async info(info, type = "score") {
            // info.wangwang
            // info.tel
            // info.addr
            // type  score | rank
            return fetchData(await fn("user", { info, type }, "info"));
        },
        async chance() {
            return await fn("user", {}, "user");
        },
        async rank() {
            return fetchData(await fn("user", {}, "rank"));
        },
        async reason() {
            return fetchData(await fn("user", {}, "reason"));
        },
        async numScore() {
            return fetchData(await fn("user", {}, "numScore"));
        },
        async numUser() {
            let startDatetime = "2020-03-10 00:00:00";
            let endDatetime = "2030-12-25 00:00:00";
            return await fn(
                "spm",
                { type: "view", startDatetime, endDatetime },
                "disUser"
            );
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#sG04c
        // 行为次数统计
        async spmCount(type = "view") {
            let startDatetime = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
            let endDatetime = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");

            return fetchMessage(
                await fn(
                    "spm",
                    { type, startDatetime, endDatetime },
                    "spmCount"
                )
            );
        },
        // https://www.yuque.com/ggikb6/lggvwh/zumgyf#AQryx
        // 人数统计
        // async disUser(type="view"){
        //     let startDatetime = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
        //     let endDatetime = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");

        //     return fetchMessage(await fn("spm", {type, startDatetime, endDatetime}, "disUser"));
        // },

        //自定义样式
        async icss(page = "index") {
            return icssData[page]
                ? icssData[page]
                : (icssData[page] = await fn("icss", {}, page));
        },

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
        favorShop(id) {
            id = parseInt(id);
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
        // {"foo":"bar", id:"213"}  => foo=bar&id=213
        query(params) {
            params = params || {};
            params.id = activityId;
            return Object.keys(params)
                .map((k) => `${k}=${params[k]}`)
                .join("&");
        },

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
        // params(query){
        //   return Object.fromEntries(query.split("&").map(p=>p.split('=')));
        // }
    };
};
