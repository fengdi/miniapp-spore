const { store } = getApp();


Page({
  add5(){
    // 直接修改数据
    store.setData({
      count: store.data.count + 5
    });
  },
  back(){
    wx.navigateBack();
  }
});
