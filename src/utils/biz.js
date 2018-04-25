import _ from 'lodash'
import Exception from './exception.js'

export default class {
  constructor(v, fpm){
    if(!v){
      throw new Exception({
        code: 'Biz-Version-Required',
        errno: -10021,
        message: 'Biz Version Required'
      })
    }
    this.v = v
    this.m = {}
    this.fpm = fpm
  }

  getVersion(){
    return this.v
  }

  convert(){
    return {
      version: this.v,
      modules: this.m,
    }
  }

  addSubModules(mName, subM){
    if(_.isFunction(subM)){
      this.m[mName] = subM(this.fpm)
    }else{
      this.m[mName] = subM
    }
  }
}
