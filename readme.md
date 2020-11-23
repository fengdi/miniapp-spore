# 阿里小程序渐进框架 miniapp-spore #

## 前言 ##

经过前面版本迭代和项目积累进行了重构，增加全局存储对象，精简去除不常用的特性，仍然坚持无感知、渐进增强和易用性。


![](https://img.shields.io/npm/v/miniapp-spore?style=flat-square)
![](https://img.shields.io/github/license/fengdi/miniapp-spore.svg?style=flat-square)
![](https://img.badgesize.io/https:/unpkg.com/miniapp-spore?style=flat-square)

## 特性 ##


- 全局存储对象
- 极简化API，轻松上手
- 页面onBack生命周期 （页面跳转后返回时触发）
- 组件didPropsUpdate生命周期 （组件props更新时触发）
- 组件props监听器
- 生命周期事件系统

## 安装 ##

`npm i miniapp-spore -s`

## 使用入门 ##

### 使用包 ###

`app.js` 文件引入包 miniapp-spore，引入此包即可生效。


```javascript
import spore from "miniapp-spore";
```


### 全局存储 new Store (namespace, data, [options]) ###

实例化的Store对象，小程序每个页面可以共用此store数据，注意如果有多个Store对象应该保持namespace的唯一性，根据命名空间，数据初始化和更新都会自动同步到对应页面的`data[namespace]`下。

```javascript
//在app.js下
import { Store } from "miniapp-spore";

new Store('$global', { count: 1024 })

```

此时，**所有页面**的axml模板都可共用此`$global`数据
```xml
<view>{{$global.count}}</view>
<!-- 1024 -->
```

### 全局数据更改 Store.prototype.setData(update, [callback]) ###

更改数据与原生框架中页面/组件的setData使用保持一致。更改后会自动触发所有页面数据更新。

```javascript
import { Store } from "miniapp-spore";

let store = new Store('$global', { count: 1024 })

//将全局数据count加1
store.setData({
	count: store.data.count + 1
})


// 与原生页面和组件的setData一致：

// 1. 直接修改store.data无效，无法改变页面/组件的状态，还会造成数据不一致。

// 2. 请尽量避免一次设置过多的数据。

// 3. setData接受一个对象作为参数。对象的键名key可以非常灵活，以数据路径的形式给出，如 array[2].message、a.b.c.d，并且不需要在store.data中预先定义。

// 4. setData第二个参数为更新后触发的回调，在视图更新后可以拿到最新的data数据。
```

除此之外，更新数组可以同样可以使用 `Store.prototype.$spliceData(update, [callback])` 方法
```javascript
//在 obj.arr 下的这个数组下标1后插入 'a','b','c'
store.$spliceData({
  'obj.arr': [1, 0, 'a','b','c']
})
```

另外，提供了Promise版setData方法 `Store.prototype.asyncSetData(update)`
```javascript
await store.asyncSetData({
  count: store.data.count + 1
})
//...等待设置生效后处理逻辑
```

同样的，这里不要去修改页面的data.$global.count，这样修改不会更新store的数据，也同时违背数据修改的一致性（只在同一个接口修改数据），因此应该只在store实例的方法中修改数据。


### 在页面修改全局数据 ###

通常，将store放到app上，方便页面/组件获取到store对象


app.js
```javascript
import { Store } from "miniapp-spore";

let store = new Store('$global', { count: 1024 })

App({
	store
})
```

pages/index/index.js

```javascript
let store = getApp().store;

//方便拿到store
Page({
	onLoad(){
		store.setData({
			count: store.data.count - 1
		}, ()=>{
			console.log('数据已更新')
		})
	}
})
```

### 组件使用全局数据 ###

在组件中，由于担心性能问题，这里的机制是进行手动配置绑定存储，需要在组件中定义 stores 字段，数组类型。
将存储对象的实例放入即可自动绑定此对象，没配置的不会自动生效。

components/test/test.js

```javascript
let store = getApp().store;

Component({
  // 新增可定义此stores字段
  stores: [
    store,
	//... 支持多个store实例
  ],

  data: {},
  props: {},
  didMount() {
  
  },
});

```

配置了stores后就可以在**此组件**axml模板中使用此数据。

components/test/test.axml
```xml
<view>{{$global.count}}</view>
<!-- 1024 -->
```

### 计算属性 ###
```javascript
//创建一个全局存储对象 isOdd属性是依赖count的，count变化会自动影响isOdd更新
let store = new Store("$global", { count: 1024 }, {
  computed:{
    isOdd(){
      return this.count % 2;
    },
  }
});

```

```xml
<view>{{$global.count}} 是否为奇数：{{$global.isOdd}}</view>

<!-- 1024 是否为奇数：0 -->
```

### 数据强制更新 ###
如果在某些生命周期中实例化Store后，可能没有更新页面/组件
这时可以调用`Store.prototype.update([callback])`进行强制更新。

```javascript
store.update((data)=>{
  //强制更新完成
});
```


### 性能更新方案 ###

默认情况，当store更新时，会将store的data完整的setData到页面/组件。对于应用场景中store更新setData频率比较频繁或组件比较多时，此方案占优，但数据量过大可能失效无法更新。

另外一种方案，当store更新时，将store的data与页面/组件进行diff比对获得差异，对差异的部分数据对页面/组件进行更新。对于场景中，更新频率小，组件比较少，数据量大但不担心更新延迟的情况适用。

如果需要使用第二种方案。在配置中开启diff即可

```javascript
//创建一个全局存储对象 使用diff更新
let store = new Store("$store", { count: 1024 }, {
  diff: true
});

```


### 生命周期事件系统 ###

对于App生命周期有：`onLaunch`,`onShow`,`onHide`,`onError`,`onShareAppMessage`

对于Page生命周期有：`onLoad`,`onShow`,`onBack`, `onReady`, `onHide`, `onUnload`, 
  `onTitleClick`, `onPullDownRefresh`, `onReachBottom`, `onShareAppMessage`,
  `onOptionMenuClick`, `onPullIntercept`, `onTabItemTap`, `onPageScroll`
（ 其中onBack是框架模拟的 ）

对于Component生命周期有：`onInit`, `deriveDataFromProps`, `didMount`, `didUpdate`, `didUnmount`, `didPropsUpdate` （ 可能部分生命周期可能和Component2模式有关，其中didPropsUpdate是框架模拟的后面有使用说明 ）

*（如果生命周期有遗漏欢迎提issue、pr）*

对于以上生命周期，在此框架内可以通过事件监听到对应生命周期。通过:before、:after来区分周期触发前还是触发后处理逻辑。

参考示例：

```javascript
import { Store, on } from "miniapp-spore";
//监听事件

// 格式 on(`{类型}.{生命周期}:{前后}`, handler)

// 监听页面onLoad生命周期触发前
on("Page.onLoad:before", function(){
  // this 指 页面实例
  console.log('页面加载前')
});

// 支持同步方法
on("Component.didMount:before", async function(){
  // await 调用接口
  // 用async需要注意特别是before，会影响到生命周期的触发时间，当前async方法执行完成后才会触发Component.didMount
});


```

生命周期事件使用过程中需要注意，由于是先监听后触发，所以这些事件监听通常不应该放到任何一个生命周期内，或者在触发前的生命周期中监听。


### 组件属性变化生命周期 ###

小程序没有一个专门检测属性变化的机制。因此框架内提供了didPropsUpdate生命周期，仅在props变化时才会触发此生命周期。

通常我们在使用组件对组件传入属性时，属性的变化判断可能会用到didUpdate生命周期，对于简单值变化可以判断是否相等即可，但对于复杂对象结构就麻烦了。

```xml
<hello foo="{{foo}}"/>
```
```javascript
Component({
  didUpdate(prevProps, prevData) {
    if(prevProps.foo != this.props.foo){
      // foo 更新了，如果foo是对象类型，这种判断就不对了
    }
  },
});
```

所以，此框架提供了新的生命周期，处理props变化的情况
当传入的属性foo.xxx变化时，触发didPropsUpdate
```javascript
Component({
  didPropsUpdate(diff, prevProps) {
    if('foo.xxx' in diff){
      //diff为props变化前后的差异，如果键存在代表对应键的值变化
    }
  },
});
```

### 组件属性变化观察器 ###

通过didPropsUpdate可以处理props变化，你还可以通过定义观察器来监听具体某个路径下的值变化。

```javascript
Component({
  watchProps: {
    'foo.a.b': (diff, prevProps)=>{
      //foo.a.b变化时
    },
    'foo.cc': (diff, prevProps)=>{
      //foo.cc变化时
    }
  },
});
```

### 页面/组件 asyncSetData ###

在页面或组件中，也可以直接使用asyncSetData方法代替当前页面/组件的setData。用法和Store的asyncSetData相同。



## 插件机制 ##

使用插件通过use方法加载插件，可以自己开发插件在项目中灵活添加功能。

```javascript
import { Store, use } from "miniapp-spore";

import reduxPlugin from "./redux.plugin.js";

use(reduxPlugin);
```

插件的结构如下：


```javascript
//redux.plugin.js
export default function(spore, options){

  //闭包内 定义方法等逻辑

  return {
    install(){
      //安装入口

      //可以灵活使用生命周期事件系统处理相关逻辑
    }
  }
}
```