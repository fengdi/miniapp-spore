const { store } = getApp();

Page({
  data: {},
  add(){
    store.add();
  },
  decrease(){
    store.decrease();
  },
  jump(){
    wx.navigateTo({
      url:"/pages/index2/index2"
    })
  }
})
