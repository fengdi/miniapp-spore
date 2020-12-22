
import Event from "./event";
import { lifeCycles } from "./platforms/index";
import { version } from "../package.json";
let spore = Event({});
// let version = `${PACKAGE_VERSION}`;

console.log(lifeCycles)

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
    if (type(instance) == "object") {
        return "$viewId" in instance && "route" in instance;
    } else {
        return false;
    }
};
// 是否为组件
let isComponent = (instance) => {
    if (type(instance) == "object") {
        return (
            "is" in instance &&
            "$page" in instance &&
            "props" in instance
        );
    } else {
        return false;
    }
};
// 是否为App
let isApp = (instance) => {
    if (type(instance) == "object") {
        return instance == getApp();
    } else {
        return false;
    }
};

Object.assign(spore, {
  type,
  isPage,
  isComponent,
  isApp,
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

// 页面组件实例存入 page._coms
spore.on('Component.didMount:before', function(){
  this.$page._coms = this.$page._coms || new Set();
  this.$page._coms.add(this);
})
spore.on('Component.didUnmount:before', function(){
  this.$page._coms = this.$page._coms || new Set();
  this.$page._coms.delete(this);
})
// 已加载
spore.on('Page.onLoad:before', function(){
  setTimeout(() => {
    this._loaded = true;
  }, 10);
})
// 页面返回生命周期
spore.on('Page.onShow:after', function(){
  if(this._loaded){
    this.onBack();
  }
})


// Hooks
let _App = App;
let _Page = Page;
let _Component = Component;

App = function(config){
  listen('App', config);
  return _App(config);
};
App._App = _App;
App.isApp = isApp;

Page = function(config){
  listen('Page', config);
  return _Page(config);
};
Page._Page = _Page;
Page.isPage = isPage;

Component = function(config){
  listen('Component', config);
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