


let cssData = {};
let sid = 0;

// const type = (t)=>{
//     return {}.toString.call(t).slice(8,-1).toLowerCase();
// }
const type = (t)=>{
    return t.constructor.toLowerCase();;
}

let $Math = (function(){
  let m = {};
  //Math https://opendocs.alipay.com/mini/framework/basic-library#math
  ['E','LN10','LN2','LOG2E','LOG10E','PI','SQRT1_2','SQRT2','abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','random','round','sin','sqrt','tan'].forEach(name=>{
    m[name] = Math[name];
  });
  return m;
})();

let $JSON = (function(){
  let m = {};
  //JSON https://opendocs.alipay.com/mini/framework/basic-library#json
  ['stringify','parse'].forEach(name=>{
    m[name] = JSON[name];
  });
  return m;
})();

let $Date = (function(){
  let m = {};
  //Date https://opendocs.alipay.com/mini/framework/basic-library#date
  
  //TODO日期格式化函数
  return m;
})();


let exports = {
  v:"0.1",
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  isNaN,
  isFinite,
  parseFloat,
  parseInt,
  $Math: $Math,
  $JSON: $JSON,
  $Date: $Date,
  test(a){
    // console.log(Math);
    

    return Math.abs(a);
  },

  //只支持完整时间如 2010/12/1 16:11:08，（2020-03-26这种日期可能有8小时时差）
  //自动转格式 yyyy-MM-dd HH:mm:ss
  time(datestr = ''){
    let date = datestr ? getDate(datestr).getTime() : getDate().getTime();
    let time = getDate( date - getDate().getTimezoneOffset()*60*1000 ).toJSON();
    return (time||'').replace(getRegExp('T'),' ').replace(getRegExp('\\..*$'),'');
  },
  type,
  log(...arg){
    console.log(...arg)
  },
  json(d){
      return JSON.stringify(d, null, ' ');
  },
  charLen(str){
      str = str || '';
      let r = getRegExp('[\u0391-\uFFE5]', 'g');
      return str.replace(r,'**').length;
  },
  //自定义样式初始化
  cssInit(icss){
    (icss||'').toString().split(getRegExp('\r\n|\r|\n|$')).map(line=>{
      let s = line.split('=');
      let id = (s[0]||'').trim();
      let value = (s[1]||'').trim();
      if(id && value){
        cssData[id] = value;
      }
    });

    // console.log(JSON.stringify(cssData))
  },
  //取样式
  style(id){
    id = id || sid;
    return `--i:${id};${(cssData[id] || '')}`;
  },
  get cid(){
    return sid;
  },
  sid(){
    sid = parseInt(sid);
    return ++sid;
  },
  //业务函数

  gyro(deg, range=180){
    let re = 0;
    if(isNaN(deg)){
      re = 0;
    }else{
      if($Math.abs(deg)>180){
        if(deg > 0){
          re = 360-deg
        }else{
          re = 360+deg
        }
      }else{
        re = deg;
      }
    }

    let rang = $Math.abs(range);

    if(re > 0){
      return re < rang ? re : rang;
    }else{
      return re > -rang ? re : -rang;
    }

  }

};

export default exports;