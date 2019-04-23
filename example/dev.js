'use strict';
import { Fpm } from '../src/bin/app'
const path = require('path')
let app = new Fpm({ disableBodyParser: ['/notify']})
let biz = app.createBiz('0.0.1')
biz.addSubModules('test', {
  foo: async function(args, ctx, before){
    // console.log(before)
    app.doCommand('python3 /Users/yfsoft/Product/yf-fpm-server/test/backup.py')
    // app.execShell(path.join(__dirname, '../test/test.sh'), ['bobo'], { stdio: [0, 1, 2] })
      .then(data => {
        console.error(data)
      })
      .catch(e => {
        console.error(e)
      })
    return 1;
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

app.registerAction('BEFORE_SERVER_START', async () => {
  return new Promise( (resolve, reject) => {
    setTimeout(() => {
      console.log(100)
      resolve(1)
    }, 500)
  })
  
}, 100)
app.registerAction('BEFORE_SERVER_START', () => {
  console.log(10)
}, 10)
app.registerAction('BEFORE_SERVER_START', () => {
  console.log(200)
}, 200)
/*
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
})//*/

app.run()
  .then(fpm => {
    fpm.logger.info('ready ...')
  })