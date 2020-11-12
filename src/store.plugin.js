import diff from "./diff";




export default function(spore, options){


// 深度复制
const deepCopy = diff.deepCopy;

const { Event, type, isComponent, isPage } = spore;

// 去除右侧方括号]
const trimRightBracket = k=>k.replace(/\]$/g,'');



// 路径设对象值
const setByPath = function (data, path, value) {
    let p = Array.isArray(path) ? path : path.split(/\.|\[/);
    if (path && p.length > 1) {
        let k = trimRightBracket(p.shift());
        data = data[k] || (data[k] = p[0] !== trimRightBracket(p[0]) ? [] : {});
        return setByPath(data, p, value);
    } else {
        data[trimRightBracket(p[0])] = value;
        return data;
    }
};
// 路径取对象值
const getByPath = function (data, path) {
  let p = Array.isArray(path) ? path : path.split(/\.|\[/);
  if (path && p.length) {
      let k = trimRightBracket(p.shift());
      if (typeof data != "object" || !(k in data)) {
          return;
      }
      return getByPath(data[k], p);
  } else {
      return data;
  }
};
// 路径定义对象值
const defByPath = function (data, path, define={}) {
    let p = Array.isArray(path) ? path : path.split(/\.|\[/);
    let key, obj;

    if(p.length>1){
        key = p.splice(-1)[0];
        obj = getByPath(data, p);
    }else{
        key = p[0]
        obj = data;
    }
    key = trimRightBracket(key);

    if(typeof obj == 'object'){
        return Object.defineProperty(obj, key, define);
    }
};


// 全局存储对象列表
const storesList = new Set();

// 存储对象
class Store{
  constructor(namespace='$store', data = {}, options = {}){
    //内部存储的state
    this._defData = data;

    Object.assign(this, Event(this._events = {}));

    this.options = Object.assign({diff:false}, options);
    this.namespace = namespace;

    this._setComputed();

    //对外暴露的data
    this._data = deepCopy(this._defData);


    // 相同命名空间要报错
    if(!Array.from(storesList).find(store=>store.namespace == namespace)){

      //加入列表方便后续管理
      storesList.add(this);

    }else{
      throw new Error(`不能同时使用同一个命名空间:${namespace}`)
    }
  }
  // 不要直接访问 _data _defData 字段
  get data(){
    return this._data;
  }
  //设置数据
  setData(update, callback){
    if(type(update) != 'object'){
        return
    }

    Object.entries(update).map(record=>{
        setByPath(this._defData, record[0], record[1])
    })

    this._data = deepCopy(this._defData);

    this.emit('setData', [update], this)
    this.update(callback)
  }
  asyncSetData = asyncSetData
  // 修改数组
  $spliceData(update, callback){
    if(type(update) != 'object'){
      return
    }
    Object.entries(update).map(record=>{
      const [key, value] = record;
      let arr = getByPath(this._defData, key);

      if(Array.isArray(arr)){
        [].splice.apply(arr, value)
      }
    })

    this._data = deepCopy(this._defData);

    this.emit('$spliceData', [update], this)
    this.update(callback)
  }
  // 清除数据二级以下的计算属性可能会被覆盖
  clear(callback){
    Object.entries(this._defData).map(record=>{
      const [key, value] = record;
      this._defData[key] =  null;
    })
    this._data = deepCopy(this._defData);
    this.emit('clear', [], this)
    this.update(callback)
  }

  //处理计算属性
  _setComputed(){
    let self = this;
    if(this.options.computed){
      Object.entries(this.options.computed).map(computedCof=>{
        const [path, computedFn] = computedCof;

        if(type(computedFn) == 'function'){
          if(!defByPath(this._defData, path, {
            enumerable: true,
            set() {
              console.warn('计算属性不支持重新赋值')
            },
            get(){
              return computedFn.bind(self._defData)();
            }
          })){
            console.warn(`存储【${this.namespace}】无法定义计算属性${path}，因为在此路径下不是对象类型，无法定义属性。`)
          };
        }
      })
    }
  }
  
  //更新、强制更新
  update(callback = ()=>{}){
    let page = spore.getPage();
    let data = this.data;
    if(page){ 

      let update = {
        [this.namespace] : data
      };

      // 页面diff更新
      if(this.options.diff){
        update = storeDiff(data, this.namespace, page)
      }
      // 页面更新
      let updatePromises = [ asyncSetData.bind(page)(update) ]

      if(page._coms){
        page._coms.forEach(com=>{
          if(com.$stores && com.$stores.includes(this)){

            // 组件diff更新
            if(this.options.diff){
              update = storeDiff(data, this.namespace, com)
            }
            // 组件更新
            updatePromises.push( asyncSetData.bind(com)(update) )
          }
        })
      }

      return Promise.all(updatePromises).then(()=>{ callback(data); return data;});
    }
    return Promise.resolve(data);
  }
  //返回哪些页面/组件在使用
  where(){
    let page = spore.getPage();
    let res = [];
    if(page){
      res.push(page.route);
      if(page._coms){
        page._coms.forEach(com=>{
          if(com.$stores && com.$stores.includes(this)){
            res.push(com.is);
          }
        });
      }
    }
    return res;
  }
  // 销毁
  destroy(clear){
    storesList.delete(this);
    this._data = {};
    this._defData = {};
    if(clear){
      this.clear();
    }
    ['$spliceData','setData','clear',
    'asyncSetData','_setComputed',
    'update','where','destroy'].forEach(fnName=>{
      this[fnName] = ()=>{throw new Error(`Store:[${this.namespace}]已销毁`)}
    })
    this.emit('destroy', [], this)
  }
}

// 同步setData
let asyncSetData = function (data) {
    if (isComponent(this) || isPage(this) || isStore(this)) {
        return new Promise((r) => {
            this.setData(data, (data) => {
                r(data);
            });
        });
    }
};

// store存储与对应页面/组件data下数据对比出差异
let storeDiff = function (data, namespace, instance){
  
  let diffUpdates = diff(data, instance.data[namespace]);
  
  let namespaceDiffUpdates = {};

  Object.entries(diffUpdates).forEach(diffUpdate=>{
    namespaceDiffUpdates[`${namespace}.${diffUpdate[0]}`] = diffUpdate[1];
  })

  return namespaceDiffUpdates;
}

// 是否为Store类的实例
let isStore = (instance) =>{
  if(instance && instance instanceof Store){
    return true
  }
  return false;
}



  return {

    install(){

      
      Store.isStore = isStore;

      // 页面返回时数据更新
      spore.on('Page.onBack:before', function(){
        storesList.forEach(store=>{
          store.update()
        })
      })
      // 页面加载时数据更新
      spore.on('Page.onLoad:before', function(){
        storesList.forEach(store=>{
          store.update()
        })
      })


      // 组件初始化嵌入数据
      spore.on('Component.init', function(config){
        config.data = config.data || {};
        config.stores = config.stores || [];
        config.methods = config.methods || {};
        config.methods.$stores = config.stores; //$stores需要在组件方法内定义才能取到值
        config.methods.$stores.forEach(store=>{
          config.data[store.namespace] = {...store.data};
        })


        config.methods.asyncSetData = asyncSetData;
      })

      // 页面初始化嵌入数据
      spore.on('Page.init', function(config){
        config.data = config.data || {};
        storesList.forEach(store=>{
          config.data[store.namespace] = {...store.data};
        })


        config.asyncSetData = asyncSetData;
      })


      Object.assign(spore, {
        Store,
        asyncSetData,
        isStore
      })


    }

  }
}