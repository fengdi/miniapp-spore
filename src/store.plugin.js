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
      if (typeof data != "object" || !data || !(k in data)) {
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

  //public  data getter获取 _data
  
  //private _defineData 定义的数据

  //private _data  暴露使用的数据

  constructor(namespace='$store', data = {}, options = {}){

    // 验证命名空间合法性
    if(!/^[_\$a-zA-Z][_\$a-zA-Z0-9]*$/.test(namespace)){
      throw new Error(`Store命名空间${namespace}定义不合法，规则与js变量名一致`)
      return;
    }
    this.namespace = namespace;

    // 相同命名空间要报错
    if(!Array.from(storesList).find(store=>store.namespace == namespace)){

      //加入列表方便后续管理
      storesList.add(this);

    }else{
      throw new Error(`Store不能同时使用同一个命名空间:${namespace}`)
    }


    // 融入事件方法 on emit 等
    Object.assign(this, Event(this._events = {}));

    // 融入用户定义的方法
    Object.assign(this, options.actions || {});

    this.options = Object.assign({diff:false}, options);

    // 将data先存入_defineData然后在复制到_data
    this._createDefineData(data);

  }
  
  //设置数据
  setData(update, callback){
    if(type(update) != 'object'){
        return
    }
    //更新数据根据路径进行设置
    Object.entries(update).map(record=>{
        setByPath(this._defineData, record[0], record[1])
    })

    this._data = deepCopy(this._defineData);

    this.emit('setData', [update], this)
    this.update(callback)
  }
  // 异步设置data，返回Promise
  asyncSetData = asyncSetData
  // 修改数组
  $spliceData(update, callback){
    if(type(update) != 'object'){
      return
    }
    Object.entries(update).map(record=>{
      const [key, value] = record;
      let arr = getByPath(this._defineData, key);

      if(Array.isArray(arr)){
        [].splice.apply(arr, value)
      }
    })

    this._data = deepCopy(this._defineData);

    this.emit('$spliceData', [update], this)
    this.update(callback)
  }
  // 清除数据二级以下的计算属性可能会被覆盖
  clear(callback){
    Object.entries(this._defineData).map(record=>{
      const [key, value] = record;
      this._defineData[key] =  null;
    })
    this._data = deepCopy(this._defineData);
    this.emit('clear', [], this)
    this.update(callback)
  }
  _createDefineData(data){
    //内部定义存储的data
    this._defineData = data;
    // 处理计算属性
    this._setComputed();
    //对外暴露的data
    this._data = deepCopy(this._defineData);
  }
  // 不要直接访问 _data _defineData 字段 访问data，此字段应该只读
  get data(){
    return this._data;
  }
  //处理计算属性
  _setComputed(){
    let self = this;
    if(this.options.computed){
      Object.entries(this.options.computed).map(computedCof=>{
        const [path, computedFn] = computedCof;

        if(type(computedFn) == 'function'){
          // 将对应路径下的对象设置getter
          if(!defByPath(this._defineData, path, {
            enumerable: true,
            set() {
              console.warn('计算属性不支持重新赋值')
            },
            get(){
              return computedFn.bind(self._defineData)();
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

      // 页面route加入结果
      res.push(page.route);
      
      if(page._coms){
        page._coms.forEach(com=>{
          if(com.$stores && com.$stores.includes(this)){

            // 组件is加入结果
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
    this._defineData = {};
    if(clear){
      this.clear();
    }
    // 成员方法全部置为报错的空方法
    ['$spliceData','setData','clear',
    'asyncSetData','_setComputed',
    'update','where','destroy'].forEach(fnName=>{
      this[fnName] = ()=>{throw new Error(`Store:[${this.namespace}]已销毁`)}
    })
    this.emit('destroy', [], this)
  }
}

// 同步setData 支持页面/组件/Store
let asyncSetData = function (data) {
    if (isComponent(this) || isPage(this) || isStore(this)) {
        return new Promise((r) => {
            this.setData(data, (data) => {
                r(data);
            });
        });
    }
};

// store存储data与对应页面/组件data下数据对比出差异
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

        // 组件支持asyncSetData方法
        config.methods.asyncSetData = asyncSetData;
      })

      // 组件挂载时数据更新
      spore.on('Component.didMount:before', async function(){
        await Promise.all(this.$stores.map(store=>{
          let data = store.data;
          let update = {
            [store.namespace] : data
          };
          // 组件diff更新
          if(store.options.diff){
            update = storeDiff(data, store.namespace, this)
          }
          return this.asyncSetData(update)
        }));
      })

      // 页面初始化嵌入数据
      spore.on('Page.init', function(config){
        config.data = config.data || {};
        storesList.forEach(store=>{
          config.data[store.namespace] = {...store.data};
        })

        // 页面支持asyncSetData方法
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