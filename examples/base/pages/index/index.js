const { store } = getApp();

Page({
  onLoad(query) {
    
  },

  add(){

    store.setData({
      count: store.data.count + 1
    }, ()=>{
      console.log('count添加成功')
    })
  },

  jump(){
    my.navigateTo({
      url: '/pages/demo/demo'
    });
  }
});
