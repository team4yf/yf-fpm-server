import _ from 'lodash'
export default class {
  constructor(v, fpm){
    if(!v){
      throw new Error('biz should be set version,ex: 0.0.1 or 1.0 ...')
    }
    this.v = v
    this.m = {}
    this.fpm = fpm
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
