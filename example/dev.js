'use strict';
import Fpm from '../src/bin/app'
let app = new Fpm()
let biz = app.createBiz('0.0.1')
biz.addSubModules('test', {
  foo: async function(args, ctx, before){
    // console.log(before)
    app.execShell('D:/Workspace/Nodejs/yf-fpm-server/test/test.bat', ['bobo'])
      .then(data => {
        console.error(data)
      })
      .catch(e => {
        console.error(e)
      })
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

  //fpm.logger.log("CALL_API Action", ctx.ip, args)
})

app.registerAction('FPM_MIDDLEWARE', (params) => {
  const fpm = params[0]
  const koa = params[1]
  koa.use(async(ctx, next) => {
    fpm.logger.log('log from middleware', ctx.ip)
    // get ipv4 from it
    //"^"
    const reg = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/
    if(reg.test(ctx.ip)){
      let ipv4 = reg.exec(ctx.ip)[0]
      if(ipv4 !== '127.0.0.1'){
        ctx.fail({errno:-997, code:'IP_NOT_ALLOWED', message:'IP NOT ALLOWED ~ '})
        return
      }
      console.log(ipv4)
    }
    // console.log(reg.exec(ctx.ip))
    await next()
  })
})
app.run()
  .then(fpm => {
    fpm.logger.info('ready ...')
  })