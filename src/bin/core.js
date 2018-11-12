import { E } from '../utils/exception.js'
import _ from 'lodash'
const noMethodHandler = () =>{
  return Promise.reject(E.System.NOT_METHOD);
}

const versionUndefinedHandler = () => {
  return Promise.reject(E.System.VERSION_UNDEFINED);
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
      // the after hook ignore the result.
      await hook.runHook('after_' + method, {input: args, result: result.data}, v, ctx)
    }else{
      result = await handler(args, ctx, [])
    }
    return Promise.resolve(result)
  }catch(err){
    if(err.errno > 0){
        err.errno = 0 - err.errno
    }
    return Promise.reject(err)
  }
}
