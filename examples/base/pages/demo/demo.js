const { store } = getApp();

Page({
  data: {},
  onLoad() {

  },

  subtract(){
    store.setData({
      count: store.data.count - 1
    }, ()=>{
      console.log('count减少成功')
    })
  },


  back(){
    my.navigateBack();
  }
});
