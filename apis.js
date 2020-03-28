
import cloud from '@tbmp/mp-cloud-sdk';
// import { isArray } from 'util';

cloud.init({
  // env: 'test' 
  env: 'online' 
});


const fn = cloud.function.invoke.bind(cloud.function);

// const fn2 = (name, data)=>{
//   return fn.apply(cloud.function, name.split(".").splice(1,0,data))
// }
// fn2("winonaLachineCms.appletEntrance", data)

const toast = function(str){
    my.showToast({
        content:str
    })
};
const toastError = function(str){
    my.showToast({
        content:str||"",
        type:"exception"
    })
};

const fetchData = function(res){
    try{
        if(res){
            if(!res.success){
                toastError(res.message);
            }else{
                return res.data;
            }
        }else{
            toastError('请求服务器失败')
        }
    }catch(e){
        toastError(e.toString())
    }
    return null;
};
const fetchMessage = function(res){
    try{
        if(res){
            if(!res.success){
                toastError(res.message);
            }else{
                return res.message;
            }
        }else{
            toastError('请求服务器失败')
        }
    }catch(e){
        toastError(e.toString())
    }
    return null;
};


/*
* 日期格式化
* 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
* 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
* dateFormat(date, "yyyy-MM-dd hh:mm:ss.S") ==> 2016-07-02 08:09:04.423
* dateFormat(date, "yyyy-MM-dd E HH:mm:ss") ==> 2019-03-10 二 20:09:04
* dateFormat(date, "yyyy-MM-dd EE hh:mm:ss") ==> 2019-03-10 周二 08:09:04
* dateFormat(date, "yyyy-MM-dd EEE hh:mm:ss") ==> 2019-03-10 星期二 08:09:04
* dateFormat(date, "yyyy-M-d h:m:s.S") ==> 2016-7-2 8:9:4.18
*/
const dateFormat = function (timeStamp, fmt) {
  const d = new Date(timeStamp)
  const o = {
    "M+": d.getMonth() + 1, //月份
    "d+": d.getDate(), //日
    "h+": d.getHours() % 12 === 0 ? 12 : d.getHours() % 12, //小时
    "H+": d.getHours(), //小时
    "m+": d.getMinutes(), //分
    "s+": d.getSeconds(), //秒
    "q+": Math.floor((d.getMonth() + 3) / 3), //季度
    "S": d.getMilliseconds() //毫秒
  }
  const week = ['日', '一', '二', '三', '四', '五', '六']
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  if (/(E+)/.test(fmt)) {
    let name = ''
    if (RegExp.$1.length > 2) {
      name = '星期'
    } else if (RegExp.$1.length > 1) {
      name = '周'
    }
    fmt = fmt.replace(RegExp.$1, name + week[d.getDay()])
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    }
  }
  return fmt
}


let activityId = "";

export default {
    cloud,
    fn,
    toast,
    toastError,
    dateFormat,
    setActivityId(id){
      activityId = id;
    },
    // https://www.yuque.com/ggikb6/lggvwh/hg0rfl#sWBHI
    // 小程序入口
    async appletEntrance(data){
        data = data || {};
        data.activityId = activityId;
        return fetchData(await fn("winonaLachineCms", data, "appletEntrance"));
    },
    // https://www.yuque.com/ggikb6/lggvwh/hg0rfl#IwUT8
    // 数据统计
    async countData(type){
        let data = {
            type,
            activityId,
            attachData:{
                time: dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss")
            }
        };
        return fetchMessage(await fn("winonaLachineCms", data, "countData"));
    },
    // 获取UI配置数据
    async selectActivityConfig(data){
      data = data || {};
      data.activityId = activityId;
      return fetchData(await fn("appletcms", data, "selectActivityConfig"));
    },


    authorize(){
        return new Promise(function(resolve, reject){
            my.authorize({
                // scopes: '*',
                scopes: 'scope.userInfo',
                success(res){
                    resolve(res)
                },
                fail(e){
                    reject(e);
                }
            });
        });
    },
    getUserInfo(){
      return new Promise(function(resolve, reject){
        my.getAuthUserInfo({
          success: (res) => {
            resolve(res)
          },
          fail:(e)=>{
            reject(e)
          }
        });
      });
    },
    getSystemInfo(){
      return my.getSystemInfoSync();
    },
    // 页面跳转 url自动外跳
    jump(url){
      return new Promise(function(resolve, reject){
        let config = {
          url,
          success:(res)=>{
            resolve(res)  
          },
          fail:(e)=>{
            reject(e)          
          }
        };
        if(/^\w+\:\/\//.test(url)){
          my.call("navigateToOutside", config);
        }else{
          my.navigateTo(config) 
        }
      });
    },
    // {"foo":"bar", id:"213"}  => foo=bar&id=213
    query(params){
      params = params || {};
      params.id = activityId;
      return Object.keys(params).map(k=>`${k}=${params[k]}`).join("&")
    },

    //获取云存储URL，数组顺序对应，查不到返回空字符串
    async cloudFile(urls = []){
      urls = Array.isArray(urls) ? urls : [urls];

      let map = {};
      let resUrls = await cloud.file.getTempFileURL({  
        fileId: urls
      });
      
      resUrls.map(res=>map[res.fileId] = res.url);

      return urls.map(url=>map[url]||'')
    }
    // params(query){
    //   return Object.fromEntries(query.split("&").map(p=>p.split('=')));
    // }
}