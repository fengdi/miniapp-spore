// tangoboy

import diff from "./diff.js";
import { throttle, debounce } from "./throttle-debounce";


const systemApp = App;
const systemPage = Page;
const systemComponent = Component;


const type = (t)=>{
    return {}.toString.call(t).slice(8,-1).toLowerCase();
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
const update = function (data, callback){

    let type = ('$viewId' in this) ? 'Page' : 'Component';

    data = data || {};
    //newDataArray分为
    //newDataArray[0]  为纯粹的键值更新 比如： "foo" : "bar"
    //newDataArray[1]  路径更新 更新   比如： "a.b.c[0].d.e" : "zoo"
    // 分离出来后 键值更新 去diff对比优化生成 update
    // 之后 update 与 newDataArray[1] 合并路径更新再进行setData
    const newDataArray = assignObject(this.data, data);
    const update = diff(newDataArray[0], this._getOldData());
    console.log(`[update${type}Data]:`, update, newDataArray[1]);
    this._setOldData()
    this.setData(Object.assign(update, newDataArray[1]), callback)
}
const $splice = function(){
    this._setOldData();
    this.$spliceData.apply(this, arguments);
};
const linkData = function(e){
    let self = this;
    
    console.log(e);

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
        console.warn('计算属性不支持重新赋值')
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


const init = ()=>{
    App = function(config){

        systemApp(config);
    };
    Page = function(config){
        
        config.data = Object.assign({}, config.data||{})
        
        //注入函数名称
        config.injections = [["update", "updatePage"]].concat(config.injections || []);
        

        //防抖名单
        initThrottle(config);
        
        const onLoad = config.onLoad||function(){};
        config._setOldData = setOldData;
        config._getOldData = getOldData;

        config.onLoad = function(){
            let self = this;

            if (!self._isReadyComputed) {
                setComputed(this.data, this.data)
                self._isReadyComputed = true
            }
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
        config.$splice = $splice;

        systemPage(config);
    };

    Component = function(config){
        

        const didMount = config.didMount || function(){};

        initThrottle(config, true)

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
            

            if (!self._isReadyComputed) {
                setComputed(this.data, this.data)
                self._isReadyComputed = true
            }
            this._setOldData();
            // console.log(self);

            didMount.apply(self, arguments);
        }

        config.data = Object.assign({}, config.data||{})
        config.methods = Object.assign({}, config.methods||{})

        config.methods._setOldData = setOldData;
        config.methods._getOldData = getOldData;

        config.methods.update = update;
        config.methods.$splice = $splice;

        config.methods.linkData = linkData;

        systemComponent(config);
    };
}




export default {
    init: init,
    deepCopy: diff.deepCopy,
    type: type
}