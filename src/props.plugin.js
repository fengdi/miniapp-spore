import diff from "./diff";

export default function(spore, options){

 /**
 * 路径包含匹配
 *
 * @param  {String} referPath	参考路径
 * @param  {String}  pathRule     匹配规则
 * @return {Boolean}  参考路径是否符合在匹配规则下
 */
let isPathContain = (referPath, pathRule = '') => {
  if (pathRule == '*') {
    return true
  }
  let pReg = /[\.\[\]]+/g;
  let bracketsReg = /\]/g;
  let referPathArr = referPath.replace(bracketsReg, '').split(pReg);
  let pathRuleArr = pathRule.replace(bracketsReg, '').split(pReg);

  if (pathRuleArr.length > referPathArr.length) {
    return false;
  }
  for (let index = 0; index < pathRuleArr.length; index++) {
    if (pathRuleArr[index] != referPathArr[index]) {
      return false;
    }
  }
  return true;
};
//是否为空对象
let isEmptyObject = (obj)=>{
  return !Object.keys(obj || {}).length;
};

  return {
    install(){

      spore.lifeCycles.Component.push('didPropsUpdate');

      // 将配置存入方法的$$config$$，在实例化后可取
      spore.on('Component.init', function(config){
        config.methods.$$config$$ = config;
      });
      
      spore.on('Component.didUpdate:before', function(prevProps, prevData){

        let { didPropsUpdate, watchProps } = this.$$config$$;

        // 如果didPropsUpdate和watchProps都没有配置，就不做处理
        if(!didPropsUpdate.origin && (!watchProps || isEmptyObject(watchProps)) ){
          return ;
        }

        let diffProps = diff(this.props, prevProps);


        console.log("diff", diffProps)

         //不相等即diff为空对象时，触发didPropsUpdate 生命周期
        if (!isEmptyObject(diffProps)) {

          
          didPropsUpdate = didPropsUpdate || function(){};
          watchProps = watchProps || {};

          //触发生命周期 didPropsUpdate
          didPropsUpdate.bind(this)(diffProps, prevProps);

          //配置的监听器
          for (const path in watchProps) {
            if (watchProps.hasOwnProperty(path)) {
              const handler = watchProps[path];

              //记录匹配
              let match = {};
              Object.keys(diffProps).map((key) => {
                if (isPathContain(key, path)) { //当diff内的变化key包含配置的路径path（并且开头能对上）
                  match[key] = diffProps[key];
                }
              })
              //匹配上路径监听规则时
              if (!isEmptyObject(match)) {
                handler.bind(this)(match, prevProps)
              }
            }
          }
        }

      })

    }
  }
}