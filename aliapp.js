// tangoboy

import diff from "./diff.js";
import { throttle, debounce } from "./throttle-debounce";



const systemApp = App;
const systemPage = Page;
const systemComponent = Component;


const type = (t)=>{
    return {}.toString.call(t).slice(8,-1).toLowerCase();
}

let isIDE = false;
let debug = false;

let warn = (...msg)=>{
    if(isIDE && debug){
        console.warn(...msg);
    }
};
let log = (...msg)=>{
    if(isIDE && debug){
        console.log(...msg);
    }
};



//深度 混合/糅杂
const mix = function(receiver, supplier, override, whitelist) {
    if (!supplier || !receiver) return receiver;
    if (override === undefined) override = true;
    var i, p, len;

    if (whitelist && (len = whitelist.length)) {
        for (i = 0; i < len; i++) {
            p = whitelist[i];
            if (p in supplier) {
                _mix(p, receiver, supplier, override);
            }
        }
    } else {
        for (p in supplier) {
            _mix(p, receiver, supplier, override);
        }
    }
    return receiver;

    function _mix(property, receiver, supplier, override) {
        if (override || !(property in receiver)) {
            if(typeof supplier[property] == 'object'){
                for(var k in supplier[property]){
                    _mix(k, receiver[property], supplier[property], override)
                }
            }else{
                receiver[property] = supplier[property];
            }
        }
    }
}

//分离键值更新和路径更新
const assignObject = (a, b)=>{
    let path = {};
    for(let k in b){
        //path 更新 "a.b.c[0].d.e"分离到path
        //a  为纯粹的键值更新
        if(!/\.|\[|\]/g.test(k)){
            a[k] = b[k];
        }else{
            path[k] = b[k];
        }
    }
    // console.log("assignObject", a, path)
    return [a, path];
}

//处理防抖
let initThrottle = (config, isComponent=false ) =>{

    let host = config;
    if(isComponent){
        host = config.methods = config.methods || {};
    }

    config.throttle = config.throttle || {};

    Object.keys(config.throttle).forEach( fnName => {
        if( host[fnName] && type(host[fnName]) == 'function' ){
            let delay = config.throttle[fnName] || 300;
            host[fnName] = throttle(delay, host[fnName]);
        }
    })
}

const setOldData = function(){
    this._oldData = diff.deepCopy(this.data)//JSON.parse(JSON.stringify(this.data));
};
const getOldData = function(){
    return this._oldData;
};

//遍历data树取出计算方法树
function computedFnwalk(data, key){
    let t = type(data);
    if (t === 'object') {
        let r = {};
        Object.keys(data).forEach(key =>{ 
            let d = computedFnwalk(data[key], key);
            if(d){
                r[key] = d
            }
        })
        return Object.keys(r).length ? r : null;
    }
    if (t === 'array') {
        let r = [];
        data.forEach((item, index) =>{
            let d = computedFnwalk(item, index)
            if(d){
                r[index] = d
            }
        })
        return r.length ? r : null;
    }
    if( t === 'function'){
        return data;
    }
}

const update = function (data, callback){

    let type = ('$viewId' in this) ? 'Page' : 'Component';

    data = data || {};
    //newDataArray分为
    //newDataArray[0]  为纯粹的键值更新 比如： "foo" : "bar"
    //newDataArray[1]  路径更新 更新   比如： "a.b.c[0].d.e" : "zoo"
    // 分离出来后 键值更新 去diff对比优化生成 update
    // 之后 update 与 newDataArray[1] 合并路径更新再进行setData
    const newDataArray = assignObject(this.data, data);
    // console.log("newDataArray", newDataArray)
    const update = diff(newDataArray[0], this._getOldData());

    // log(`[update${type}Data]:`, update, newDataArray[1]);
    log(`[update${type}Data]:`, Object.assign(update, newDataArray[1]));
    this._setOldData();
    this.setData(Object.assign(update, newDataArray[1]), (data)=>{
        updateComputed.call(this)
        callback && callback.call(this, data);
    })
}
const merge = function(mergedata, callback){
    mix(this.data, mergedata||{});
    this.update({}, callback);
};
const $splice = function(data, callback){
    this._setOldData();
    this.$spliceData(data, (data)=>{
        updateComputed.call(this)
        callback && callback.call(this, data);
    });
};
const linkData = function(e){
    let self = this;

    if(e && e.currentTarget){
        let key = e.currentTarget.dataset.linkkey;
        let callbackKey = e.currentTarget.dataset.callback;
        let callback = type(self[callbackKey]) == 'function' ? self[callbackKey] : function(){}

        this.update({
            [key] : e.detail.value
        }, ()=>{
            // console.log(this.data)
            callback.bind(self)(e);
        })
    }
};

function setComputed(storeData, value, obj, key) {
  const typeString = type(value)
  if (typeString === 'function') {
    Object.defineProperty(obj, key, {
      enumerable: true,
      get: function () {
        return value.call(storeData)
      },
      set: function () {
        // console.warn('计算属性不支持重新赋值')
      }
    })
  } else if (typeString === 'object') {
    Object.keys(value).forEach(subKey => {
      setComputed(storeData, value[subKey], value, subKey)
    })
  } else if (typeString === 'array') {
    value.forEach((item, index) => {
      setComputed(storeData, item, value, index)
    })
  }
}

//更新计算方法，每次setData更新了一次，因为setData后data中的getter会被过滤掉
function updateComputed() {
    let computeds = this._computeds;
    mix(this.data, this._computeds);
    setComputed(this.data, this.data);
}


const init = (option)=>{

    isIDE = option.isIDE;
    debug = 'debug'in option? option.debug : true;

    App = function(config){

        systemApp(config);
    };
    Page = function(config){
        
        config.data = Object.assign({}, config.data||{})
        
        //注入函数名称
        config.injections = [["update", "updatePage"]].concat(config.injections || []);
        
        
        const onLoad = config.onLoad||function(){};
        config._setOldData = setOldData;
        config._getOldData = getOldData;

        config.onLoad = function(){
            let self = this;

            self._computeds = computedFnwalk(this.data);

            updateComputed.call(this);
            
            self._setOldData()
            // const setData = self.setData;
            // self.setData = function(){
            //     // console.log("setData:", arguments[0])
            //     self._setOldData()
            //     setData.apply(self, arguments)
            // };

            onLoad.apply(self, arguments);
        }

        config.linkData = linkData;

        config.update = update;
        config.merge = merge;
        config.$splice = $splice;

        //防抖名单
        initThrottle(config);

        systemPage(config);
    };

    Component = function(config){
        

        const didMount = config.didMount || function(){};

        

        config.didMount = function(){
            let self = this;
            
            let $page = this.$page;
            let injections = $page.injections;
            injections.forEach(name=>{
                let fromKey;
                let toKey;
                if(type(name)=='string'){
                    fromKey = toKey = name;
                }else if(type(name)=='array'){
                    fromKey = name[0];
                    toKey   = name[1];
                }
                if($page[fromKey]){
                    self[toKey] = $page[fromKey].bind($page);
                }else{
                    console.warn(`$page.${fromKey} is undefined.`)
                }
            });
            
            self._computeds = computedFnwalk(this.data);

            updateComputed.call(this);

            this._setOldData();
            // console.log(self);

            didMount.apply(self, arguments);
        }

        config.data = Object.assign({}, config.data||{})
        config.methods = Object.assign({}, config.methods||{})

        config.methods._setOldData = setOldData;
        config.methods._getOldData = getOldData;

        config.methods.update = update;
        config.methods.merge = merge;
        config.methods.$splice = $splice;

        config.methods.linkData = linkData;

        // didPropsChange 生命周期
        let didUpdate = config.didUpdate;
        config.didUpdate = function(prevProps, prevData){
            didUpdate && didUpdate.call(this, prevProps, prevData);
            if(config.didPropsChange){
                let d;
                if(d = diff(this.props, prevProps)){
                    config.didPropsChange.call(this, prevProps, d)
                }
            }
        }

        //防抖名单
        initThrottle(config, true)

        systemComponent(config);
    };
}




export default {
    mix,
    init,
    diff,
    deepCopy: diff.deepCopy,
    type,
    log,
    warn
}