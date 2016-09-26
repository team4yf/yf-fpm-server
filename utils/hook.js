import _ from 'lodash';
import E from '../error.js';

export default class {
  constructor(){
    this._hooks = {};
  }

  addHook(hookName, hookHandler, priority){
    priority = priority || 100;
    if(!_.isFunction(hookHandler)){
        return false;
    }
    let _list = this._hooks[hookName] || [];
    _list.push({priority: priority,handler: hookHandler});
    _list = _.sortBy(_list,'priority');
    this._hooks[hookName] = _list;
    return true;
  }

  addAfterHook(hookName, hookHandler, priority){
    return this.addHook('after_' + hookName, hookHandler, priority);
  }

  addBeforeHook(hookName, hookHandler, priority){
    return this.addHook('before_' + hookName, hookHandler, priority);
  }

  async runHook(hookName, input){
    let _list = this._hooks[hookName] || [];
    if(_.isEmpty(_list)){
        return new Promise( (resolve, reject) => {
          resolve({});
        });
    }
    let len = _list.length;
    let results = [];
    try{
      for(let i = 0; i < len; i++){
        let h = _list[i];
        let result = await h.handler(input);
        results[i] = result;
      }
      return new Promise( (resolve, reject) => {
        resolve(results);
      });
    }catch(err){
      return new Promise( (resolve, reject) => {
        reject(err);
      });
    }

  }

}
