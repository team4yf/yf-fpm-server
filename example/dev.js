'use strict';
import { Fpm, Hook,Biz }  from '../src/bin/app'
let app = new Fpm()
let biz = new Biz('0.0.1')
biz.addSubModules('test', {
  foo: async function(args, ctx, before){
    console.log(before)
    return Promise.reject({errno: -3001})
  }
})
app.addBizModules(biz)

app.extendModule('demo', {
  foo: async function(args){
    return Promise.resolve(1)
  }
})
app.addBeforeHook("test.foo", (input, ctx) =>{
  return ctx.ip
}, '0.0.1', 10000)
app.registerAction('CALL_API', (params) => {
  // console.log(arguments)
  const fpm = params[0]
  const ctx = params[1]
  const args = params[2]

  fpm.logger.log("CALL_API Action", ctx.ip, args)
})
app.run()