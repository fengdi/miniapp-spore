const { store, actions } = getApp();


Page({

  data:{
    input: '',
  },

  changeInput(e){
    this.setData({
      input: e.detail.value
    })
  },

  add(){
    if(!this.data.input){
      my.showToast({
        content: '请输入任务内容'
      });
      return;
    }
    
    actions.add({
      title: this.data.input,
      status: 1
    })

    this.setData({
      input: ''
    })
  },

  remove(e){
    const {currentTarget:{dataset:{index}}} = e;
    actions.remove(index)
  },

  switchStatus(e){
    const {currentTarget:{dataset:{index}}} = e;
    actions.switchStatus(index)
  },


  // 跳转到viewlist查看数据
  view(){
    my.navigateTo({
      url: '/pages/viewlist/viewlist'
    });
  }

});
