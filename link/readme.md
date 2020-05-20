# 链接组件 #


##用法##


```xml

<!-- 跳转url （淘宝域） -->
<link href="https://detail.m.tmall.com/item.htm?id=616507387464"></link>

<!-- 跳转页面 相当于my.navigateTo-->
<link href="../rank/rank?all=1"></link>

<!-- 在当前页面打开新页面 相当于my.redirectTo -->
<link href="/pages/index/index" redirect="{{true}}"></link>

<!-- 支持 class、插槽 -->
<link class="btn tobemember" href="{{memberUrl}}">
    <view class="image">
        <image src="..."/>
    </view>
</link>


<!-- 页面返回 固定写法 相当于my.navigateBack -->
<link href=":back"></link>


<!-- onClick事件 -->
<link href="/pages/index/index" onClick="clickLink"></link>
<!-- 如果事件clickLink方法返回false，不进行处理href跳转操作 -->

```
