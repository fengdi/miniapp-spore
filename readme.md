# 阿里小程序渐进框架 miniapp-spore #

## 前言 ##

经过前面版本迭代和项目积累进行了重构，增加全局存储对象，精简去除不常用的特性，仍然坚持无感知、渐进增强和易用性。


![](https://img.shields.io/npm/v/miniapp-spore?style=flat-square)
![](https://img.shields.io/github/license/fengdi/miniapp-spore.svg?style=flat-square)
![](https://img.badgesize.io/https:/unpkg.com/miniapp-spore?style=flat-square)

## 特性 ##


- 全局存储对象
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

实例化的Store对象，小程序每个页面可以共用此store数据，注意如果有多个Store对象应该保持namespace的唯一性，根据命名空间，数据初始化和更新都会自动同步到对应页面的data[namespace]下。

```javascript
import { Store } from "miniapp-spore";

let store = new Store('$global', { count: 1024 })

```

**所有的页面**axml模板可以共用此数据
```xml
<view>{{$global.count}}</view>
<!-- 1024 -->
```

### 全局数据更改 ###

更改数据与原生框架setData使用保持一致。更改后会自动触发（当前）页面数据更新，这里不要去修改页面的data.$global.count，这样修改不会更新store的数据，也同时违背数据修改的一致性（只在同一个接口修改数据），因此应该只能用store.setData修改数据。

```javascript
import { Store } from "miniapp-spore";

let store = new Store('$global', { count: 1024 })

//将全局数据count加1
store.setData({
	count: store.data.count + 1
})

```


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

在组件中，需要注意由于担心性能问题，是手动绑定存储，需要在组件中使用 stores 字段，数组类型。
将存储对象的实例放入即可自动绑定此对象，没配置的不会自动生效。

coms/test/test.js

```javascript
let store = getApp().store;

Component({
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

配置了stores后就可以在**当前组件**axml模板可以使用此数据

coms/test/test.axml
```xml
<view>{{$global.count}}</view>
<!-- 1024 -->
```

### 计算方法 ###
```javascript
//创建一个全局存储对象
let store = new Store("$store", { count: 1024 }, {
  computed:{
    isOdd(){
      return this.count%2;
    },
  }
});

```

```xml
<view>{{$global.count}} 是否为奇数：{{$global.isOdd}}</view>

<!-- 1024 是否为奇数：0 -->
```