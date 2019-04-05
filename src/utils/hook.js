import _ from 'lodash'
import Exception, { E } from './exception.js'

export default class {
  constructor(){
    this._hooks = {}
  }

  addHook(hookName, hookHandler, v, priority){
    priority = priority || 100
    if(!v){
      throw new Exception(E.System.HOOK_VERSION_REQUIRED)
    }
    if(!_.isFunction(hookHandler)){
      throw new Exception(E.System.HOOK_HANDLER_REQUIRED)
    }
    let versionArray = []
    if(_.isArray(v)){
      //版本号数组
      versionArray = v
    }else if(_.isString(v)){
      versionArray.push(v)
    }
    _.map(versionArray, v => {
      let _list = this._hooks[hookName + '@' + v] || []
      _list.push({priority: priority,handler: hookHandler})
      _list = _.sortBy(_list, 'priority')
      this._hooks[hookName + '@' + v] = _list
    })
    return true
  }

  addAfterHook(hookName, hookHandler, v, priority){
    return this.addHook('after_' + hookName, hookHandler, v, priority)
  }

  addBeforeHook(hookName, hookHandler, v, priority){
    return this.addHook('before_' + hookName, hookHandler, v, priority)
  }

  async runHook(hookName, input, v, ctx){
    const _list = this._hooks[hookName + '@' + v] || []
    if(_.isEmpty(_list)){
      return []
    }
    const len = _list.length
    const results = []
    try{
      for(let i = 0; i < len; i++){
        let h = _list[i]
        let result = await h.handler(input, ctx)
        results[i] = result
      }
      return results
    }catch(err){
      return Promise.reject(err)
    }
  }
}
