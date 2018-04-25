'use strict';
import { Fpm, Hook,Biz }  from '../src/bin/app'
let app = new Fpm()
let biz = new Biz('0.0.1')
biz.addSubModules('test', {
  foo: async function(args){
    return Promise.reject({errno: -3001})
  }
})
app.addBizModules(biz)

app.extendModule('demo', {
  foo: async function(args){
    return Promise.reject({errno: -4001})
  }
})
app.run()