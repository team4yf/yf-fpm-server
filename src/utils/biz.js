export default class {
  constructor(v){
    if(!v){
      throw new Error('biz should be set version,ex: 0.0.1 or 1.0 ...');
    }
    this.v = v ;

    this.m = {} ;
  }

  convert(){
    return {
      version: this.v,
      modules: this.m
    }
  }

  addSubModules(mName,subM){
    this.m[mName] = subM ;
  }
}
