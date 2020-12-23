
import Event from "./event";
import { lifeCycles, isMy, isWx } from "./platforms/index";
import { version } from "../package.json";
let spore = Event({});
// let version = `${PACKAGE_VERSION}`;

console.log("lifeCycles", lifeCycles)

//polyfill
if (!Object.entries){
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

// 类型检测
const type = (t) => {
    return {}.toString.call(t).slice(8, -1).toLowerCase();
};

// 获取当前页面（注意某些情况可能为null）
let getPage = ()=> {
    let curPages = getCurrentPages();
    return curPages[curPages.length - 1];
}
// 是否为页面
let isPage = (instance) => {
  return instance && type(instance) == "object" && '__type__' in instance && instance.__type__ == 'Page';
};
// 是否为组件
let isComponent = (instance) => {
  return instance && type(instance) == "object" && '__type__' in instance && instance.__type__ == 'Component';
};
// 是否为App
let isApp = (instance) => {
  return instance == getApp();
};

Object.assign(spore, {
  type,
  isPage,
  isComponent,
  isApp,
  isMy,
  isWx,
  getPage,
  Event
})



// 事件监听
let listen = function(type, config){
  spore.emit(`${type}.init`, [config])
  lifeCycles[type].forEach(function(lifeCycle){
    let origin = config[lifeCycle];
    let fn = origin || function(){};

    // lifeCycle AOP
    config[lifeCycle] = async function(){
      await spore.asyncEmit(`${type}.${lifeCycle}:before`, arguments, this)
      await fn.apply(this, arguments);
      await spore.asyncEmit(`${type}.${lifeCycle}:after`, arguments, this)
    }
    // 原定义的生命周期方法存入到现有生命周期的origin上方便获取
    config[lifeCycle].origin = origin;
  })
  spore.emit(`${type}.inited`, [config])
};




// Hooks
let _App = App;
let _Page = Page;
let _Component = Component;

App = function(config){
  listen('App', config);
  config.__type__ = 'App';
  return _App(config);
};
App._App = _App;
App.isApp = isApp;

Page = function(config){
  listen('Page', config);
  config.__type__ = 'Page';
  return _Page(config);
};
Page._Page = _Page;
Page.isPage = isPage;

Component = function(config){
  listen('Component', config);
  config.__type__ = 'Component';
  return _Component(config);
};
Component._Component = _Component;
Component.isComponent = isComponent;



// 插件install
let plugins = new Set();

spore.use = function(plugin, options){
  plugin.options = options;
  plugins.add(plugin)
  const { install } = plugin.bind(spore)(spore, options)
  install()
};
spore.plugins = plugins;
spore.lifeCycles = lifeCycles;


console && console.info(`miniapp-spore: v${version}`)

export default spore;