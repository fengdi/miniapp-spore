

// 页面返回生命周期插件
export default function(spore, options){
  return {
    install(){
      // 已加载
      spore.on('Page.onLoad:before', function(){
        setTimeout(() => {
          this._loaded = true;
        }, 10);
      });
      // 页面返回生命周期
      spore.on('Page.onShow:after', function(){
        if(this._loaded && this.onBack){
          this.onBack();
        }
      });
    }
  };
};