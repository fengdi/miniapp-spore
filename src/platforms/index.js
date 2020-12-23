import aliLC from  "./aliLifeCycles";
import wxLC  from "./wxLifeCycles";

export const isWx = (typeof wx === 'object') && (typeof wx.getSystemInfoSync === 'function');
export const isMy = (typeof my === 'object') && (typeof my.getSystemInfoSync === 'function');

// 生命周期
let autolifeCycles;
if(isWx){
  autolifeCycles = wxLC
}else if(isMy){
  autolifeCycles = aliLC
}

export const aliLifeCycles = aliLC;
export const wxLifeCycles = wxLC;
export const lifeCycles = autolifeCycles;
