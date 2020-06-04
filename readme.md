# 阿里小程序渐进框架 miniapp-spore #

## 前言 ##

之前，我尝试直接用taro remax rax等开发小程序，其实开发效率和性能都可以达标的。我也更推荐用react开发小程序，之前有项目用remax和rax做过。其实只有两个开发体验上的问题，其一每次保存文件，框架先编译之后小程序开发工具检测文件修改再进行一次编译，两次编译时间比较长，至少达到5秒。另外还有一个问题是，在windows开发遇到编译报错原因是编译的时候小程序开发工具也在同时编译改动文件导致文件无法覆盖和保存。

因此，退一步在原生基础上搞一套框架出来，这套框架是无感知、渐进增强框架，在保留原来写法上新增语法方法和特性，包容原生页面组件生态，在新项目使用框架可以引入之前原生写的组件，同时以前的维护项目可以无缝引入框架。

## 安装 ##

`npm i miniapp-spore -s`

## 初始化 ##

`app.js`文件头部你需要加这两行代码，框架就开始运作了
```javascript
import app from "miniapp-spore";
app.init();
```


## 特性 ##
页面和组件支持data配置计算方法

```javascript
Page({
    data:{
        numA: 5,
        numB: 3,
        count(){    //支持计算方法
            return this.numA + this.numB;
        }
    }
});
//numA numB 值更新，对应count自动计算更新
```
```xml
<view>{{count}}</view>
<!-- 8 -->
```



## 页面配置 ##

### 自动注入 `injections :Array String` ###
将page页面实例中的方法自动注入到组件中

```javascript
Page({
    injections:["pagefn"],
    pagefn(){
        console.log('这是页面的一个方法')
    }
});
```
此时，在组件中就可以直接调用pagefn方法了(只要页面引入了这个组件就有pagefn方法)
```javascript
Component({
  didMount() {
      //可以直接调用pagefn方法
      this.pagefn();
  }
});
```


#### 方法防抖 `throttle :Object` ####
`{方法名:毫秒数}`
配置页面中对应方法转化为防抖方法，相关防抖机制请百度
```javascript
Page({
    throttle:{
        onClick:3000
    },
    onClick(){
        console.log('这个方法已做防抖处理，3秒内最多执行一次，你再怎么疯狂点击没有用的😂')
    }
});
```



## 页面实例 pageInstance ##

页面实例指的是在页面方法内的this实例。


### `pageInstance.update(data, callback)` ###
更新data数据。
首先，方法性能优化版的原生setData，作为原生setData的替代方案。其次提供了两种使用方式，用更容易理解的方式更新数据。

方式一，直接修改data，最后update：
```javascript
this.data.language = 'zh_cn'
this.data.userName = '黑化肥发灰'
this.data.userList[0].name = '张三疯'
this.update() //不要忘记执行update方法
```
方式二，原生方式：
```javascript
this.update({
    foo: 1,
    style: {
        color:'red'
    }
})
```

性能自动优化：
```javascript
Component({
  data: {
      arr: [0, 1],
      a:{
          b:'b',
          c:'c',
          d:{
              e:'e',
              f:'f'
          }
      }
  },
  didMount() {
      this.data.a.d.f = 'boom';
      this.update({
          arr:[0, 1, 2],
      });

    // 在update方法内部优化后调用setData相当于 
    // this.setData({
    //     'a.d.f': "boom", 
    //     'arr[2]': 2   //这里只做了最小化更新，而不是这个数组进行更新
    // })
  }
});
```
性能优化的原理
```
 ---------------       -------------------        -----------------------
| this.update  |  →  |     json diff     |   →  | setData()-setData()...|  →  渲染
 ---------------       -------------------        -----------------------
```


注意：一旦你准备在一个页面或者组件中使用update方法，请不要使用setData $spliceData方法 !!!

### `pageInstance.$splice(data, callback)` ###

在项目中，因为使用了update，所以不能使用\$spliceData，这里的替代方法用法一致，用法参考\$spliceData方法

### `pageInstance.linkData(e)` ###
简易双向绑定，主要用于表单，用户触发事件自动更新data数据。

```javascript
Page({
    data:{
        input:'foo'
    }
});
```
```xml
<view>
  <view>你输入的是：{{input}}</view>
  <input onBlur="linkData" onInput="linkData" data-linkkey="input" value="{{input}}">
</view>
```
注意：不要主动去调用此方法，仅用于模板内事件绑定。


## 组件配置 ##

### 方法防抖 `throttle :Object` ###
配置组件中对应方法转化为防抖方法，相关防抖机制请百度

### 生命周期 `didPropsChange(prevProps, diff)`  ###
父组件/页面传入的props更新后触发，用于监听props改变，prevProps为变化前的props，diff为变化差异

注：仅监听prop变化，setData update等方法更新data不会触发此生命周期

## 组件实例 `componentInstance` (在组件方法内的this) ##


### `componentInstance.update(data, callback)` ###
更新组件的data数据，用法参考页面的update

### `componentInstance.$splice(data, callback)` ###
用法参考页面的$splice

### `componentInstance.updatePage(data, callback)` ###
在组件内更新页面data数据，相当于页面update别名方法参考页面update

### `componentInstance.linkData(e)` ###

用法参考页面的linkData


## 模板JS工具函数 tpl-utils.sjs ##
使用方法，在axml模板中将其文件引入：
```xml
<!-- 引入工具函数 -->
<import-sjs name="util" from="miniapp-spore/tpl-utils.sjs"></import-sjs>

<!-- 之后你就可以调用utils内部方法 -->
{{util.json(foo)}}

```
具体有哪些函数，看源码吧🙂

## views视图历史组件 ##

位置在 `miniapp-spore/views` 里面有文档

## link链接跳转组件 ##

位置在 `miniapp-spore/link` 里面有文档，用法类似html的a标记。
