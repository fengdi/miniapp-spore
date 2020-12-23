import spore from "miniapp-spore";

// 定义全局状态存储
let store = new spore.Store("$store", {count: 1024}, {
  computed:{
    isOdd(){
      return !!(this.count % 2)
    }
  },
  actions:{
    add(){
      this.setData({count: this.data.count+1})
    },
    decrease(){
      this.setData({count: this.data.count-1})
    },
  },
  diff: true
});

App({
  store
})