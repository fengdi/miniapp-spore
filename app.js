import aliapp from "./aliapp";
import apis from "./apis.out";

export default (config = {}) => {
    let envConfig = (config.envs || {})[config.env] || {};
    delete config.envs;
    config = aliapp.mix(config, envConfig);
    let isIDE = (config.isIDE = my.isIDE);

    aliapp.init(config);
    let apifns = apis(config);
    let sys = apifns.getSystemInfo();

    if (isIDE) {
        apifns.env({
            title: "API环境",
            content: config.env,
            backgroundColor: config.env == "online" ? "#42c02e" : "#1475b2",
        });
        apifns.env({
            title: "设备",
            content: `${sys.model} ${sys.platform} ${sys.version}`,
        });
        apifns.env({
            title: "窗口尺寸",
            content: `750x${(750 / sys.windowWidth) * sys.windowHeight}`,
        });
    }

    let spore = {
        config,
        util: {
            mix: aliapp.mix,
            deepCopy: aliapp.deepCopy,
            type: aliapp.type,
            log: aliapp.log,
            warn: aliapp.warn,
            diff: aliapp.diff
        },
    };
    Object.assign(spore, apifns);

    spore.addAPI = function (module) {
        if (aliapp.type(module) != "function") {
            aliapp.warn("addAPI需要传入方法");
        } else {
            let re = module(spore);
            if (aliapp.type(re) == "object") {
                //覆盖检查
                let keys = Object.keys(spore);
                let reKeys = Object.keys(re);
                let conflictkeys = reKeys.filter(function (k) {
                    return keys.indexOf(k) !== -1;
                });
                if (conflictkeys.length) {
                    console.warn(
                        "apis存在有覆盖情况：" + conflictkeys.join(",")
                    );
                }
                return aliapp.mix(spore, re);
            } else {
                aliapp.warn("addAPI传入方法需要返回对象");
            }
        }
        return spore;
    };

    return spore;
};
