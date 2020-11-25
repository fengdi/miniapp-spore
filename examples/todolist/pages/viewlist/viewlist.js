const { store, actions } = getApp();

Page({
  data: {},
  onLoad() {},


  remove(e){
    const {currentTarget:{dataset:{index}}} = e;
    actions.remove(index)
  },

  switchStatus(e){
    const {currentTarget:{dataset:{index}}} = e;
    actions.switchStatus(index)
  },

  
});
