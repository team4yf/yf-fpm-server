import { E } from '../utils/exception.js'
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

let getFunction = (method, v, bizModule) => {
    bizModule = bizModule || {}
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

export default async (method, args, v, fpm, ctx) => {
    let handler = getFunction(method, v, fpm._biz_module)
    let hook = fpm._hook
    try{
      let result = {}
      if(_.isFunction(hook.runHook)){
        let beforeResult = await hook.runHook('before_' + method, args, v, ctx)
        result = await handler(args, ctx, beforeResult)
        let afterResult = await hook.runHook('after_' + method, {input: args, result: result.data}, v, ctx)
      }else{
        result = await handler(args, ctx, [])
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
