
# 历史视图 #


## 说明 ##

切换视图页面，可以历史回退。



## 代码示例 ##



index.axml
```xml
<view class="app">
  <views onRef="viewref" default="{{default}}" onChange="change">
      <view slot="index">
        这是首页 内容
        
      </view>
      <view slot="game">
        这是游戏 内容
      </view>
      <!-- <test slot-scope="props" view="{{props.view}}" slot="my-com">
        这个页面是用的组件，并切传入当前页的信息到组件
        组件内可以通过props.view取到当前 页的 path state
      </test> -->
  </views>

  <!-- 
    
    ref 来自onRef 参考index.js
    
    //显示 首页
    ref.push({
      path:"index",
      state:{}
    })

    //显示 游戏
    ref.push({
      path:"game",
      state:{}
    })

    //返回上一个历史视图
    ref.back()
   -->
  <button size="default" type="primary" onTap="changeView">跳转</button>
  <button size="default" type="primary" onTap="backView">返回</button>
</view>

```


index.js
```javascript
Page({
  data:{
    //默认页面
    default:{
      path:"index",
      state:{}
    }
  },
  
  viewref(ref){//关键：将实例存入views
    this.views = ref 
  },

  //返回到前一个视图
  backView(){
    this.views.back();
    console.log('返回')
  },

  //改变视图
  changeView(){
    console.log('跳转')
    this.views.push({
      path:'game',
      state:{
        foo:"gasadk"
      }
    });
  },
  //历史记录改变 触发事件
  change(c){
    console.log("历史改变::",c);
  }
});

```

index.json
```json
{
  "usingComponents": {
    "views":"/npm/views/views"
    }
}

```