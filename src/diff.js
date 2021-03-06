const ARRAYTYPE = '[object Array]'
const OBJECTTYPE = '[object Object]'
const FUNCTIONTYPE = '[object Function]'

//thanks:
//https://github.com/yisar/fard/blob/master/packages/fard/index.js
//https://github.com/linjc/dd-store/blob/master/src/create.js
//https://github.com/Tencent/westore/blob/master/packages/westore/utils/diff.js

function type(obj) {
    return Object.prototype.toString.call(obj)
}

function deepCopy(data) {
  const typeStr = type(data)
  if (typeStr === OBJECTTYPE) {
    const obj = {}
    Object.keys(data).forEach(key => obj[key] = deepCopy(data[key]))
    return obj
  }
  if (typeStr === ARRAYTYPE) {
    const arr = []
    data.forEach((item, index) => arr[index] = deepCopy(item))
    return arr
  }
  return data
}

export default function diff(current, pre) {
    const result = {}
    if(type(current) == OBJECTTYPE){
        current = deepCopy(current);
    }
    syncKeys(current, pre)
    _diff(current, pre, '', result)
    return result
}

diff.deepCopy = deepCopy;

function syncKeys(current, pre) {
    if (current === pre) return
    const rootCurrentType = type(current)
    const rootPreType = type(pre)
    if (rootCurrentType == OBJECTTYPE && rootPreType == OBJECTTYPE) {
        //if(Object.keys(current).length >= Object.keys(pre).length){
            for (let key in pre) {
                const currentValue = current[key]
                if (currentValue === undefined) {
                    current[key] = null
                } else {
                    syncKeys(currentValue, pre[key])
                }
            }
        //}
    } else if (rootCurrentType == ARRAYTYPE && rootPreType == ARRAYTYPE) {
        if (current.length >= pre.length) {
            pre.forEach((item, index) => {
                syncKeys(current[index], item)
            })
        }
    }
}

function _diff(current, pre, path, result) {
    if (current === pre) return
    const rootCurrentType = type(current)
    const rootPreType = type(pre)
    if (rootCurrentType == OBJECTTYPE) {
        if (rootPreType != OBJECTTYPE || Object.keys(current).length < Object.keys(pre).length) {
            setResult(result, path, current)
        } else {
            for (let key in current) {
                const currentValue = current[key]
                const preValue = pre[key]
                const currentType = type(currentValue)
                const preType = type(preValue)
                if (currentType != ARRAYTYPE && currentType != OBJECTTYPE) {
                    if (currentValue != pre[key]) {
                        setResult(result, (path == '' ? '' : path + ".") + key, currentValue)
                    }
                } else if (currentType == ARRAYTYPE) {
                    if (preType != ARRAYTYPE) {
                        setResult(result, (path == '' ? '' : path + ".") + key, currentValue)
                    } else {
                        if (currentValue.length < preValue.length) {
                            setResult(result, (path == '' ? '' : path + ".") + key, currentValue)
                        } else {
                            currentValue.forEach((item, index) => {
                                _diff(item, preValue[index], (path == '' ? '' : path + ".") + key + '[' + index + ']', result)
                            })
                        }
                    }
                } else if (currentType == OBJECTTYPE) {
                    if (preType != OBJECTTYPE || Object.keys(currentValue).length < Object.keys(preValue).length) {
                        setResult(result, (path == '' ? '' : path + ".") + key, currentValue)
                    } else {
                        for (let subKey in currentValue) {
                            _diff(currentValue[subKey], preValue[subKey], (path == '' ? '' : path + ".") + key + '.' + subKey, result)
                        }
                    }
                }
            }
        }
    } else if (rootCurrentType == ARRAYTYPE) {
        if (rootPreType != ARRAYTYPE) {
            setResult(result, path, current)
        } else {
            if (current.length < pre.length) {
                setResult(result, path, current)
            } else {
                current.forEach((item, index) => {
                    _diff(item, pre[index], path + '[' + index + ']', result)
                })
            }
        }
    } else {
        setResult(result, path, current)
    }
}

function setResult(result, k, v) {
    if (type(v) != FUNCTIONTYPE) {
        result[k] = v
    }
}

