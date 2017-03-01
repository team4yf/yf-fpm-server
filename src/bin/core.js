import E from '../error.js'
import _ from 'lodash'
function noMethodHandler(){
  return new Promise( (resolve, reject) => {
    reject(E.System.NOT_METHOD)
  })
}

function versionUndefinedHandler(){
  return new Promise( (resolve, reject) => {
    reject(E.System.VERSION_UNDEFINED)
  })
}

let getFunction = (method, v) => {
    let bizModule = global.__biz_module || {}
    console.log("[CALL METHOD]:" + method + "@" + v)
    if(!_.has(bizModule,v)){
        return versionUndefinedHandler
    }
    let path = method.split('.')
    let obj = bizModule[v]
    let handler = noMethodHandler
    let hasFunction = true

    for(let i in path){
      if(!_.has(obj, path[i])){
        //未定位到任何的函数
        hasFunction = false
        break
      }
      obj = obj[path[i]]
    }
    if(hasFunction){
        handler = obj
    }
    return handler
}

export default async (method, args, v) => {
    let handler = getFunction(method, v)
    let hook = global.__hook
    try{
      let result = {}
      if(_.isFunction(hook.runHook)){
        let beforeResult = await hook.runHook('before_' + method, args, v)
        result = await handler(args)
        let afterResult = await hook.runHook('after_' + method, {input: args, result: result.data}, v)
      }else{
        result = await handler(args)
      }
      return new Promise( (resolve, reject) => {
        resolve(result)
      })
    }catch(err){
      if(err.errno > 0){
          err.errno = 0 - err.errno
      }
      return new Promise( (resolve, reject) => {
        reject(err)
      })
    }
}
