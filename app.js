import aliapp from "./aliapp";
import apis from "./apis";

export default (config = {}) => {
    let envConfig = (config.envs || {})[config.env] || {};
    delete config.envs;
    config = aliapp.mix(config, envConfig);
    let isIDE = config.isIDE = my.isIDE;

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

    return {
        config,
        util: {
            mix: aliapp.mix,
            deepCopy: aliapp.deepCopy,
            type: aliapp.type,
            log: aliapp.log,
            warn: aliapp.warn,
        },
        ...apifns,
    };
};
