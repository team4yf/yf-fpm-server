import Router from 'koa-router'
import core from '../bin/core.js'

const Api = Router()

Api.post('/api', async (ctx, next) => {
  let postData = ctx.request.body
  let v = postData.v
  let method = postData.method
  let param = postData.param
  param = JSON.parse(param)
  const fpm = ctx.fpm
  try{
    fpm._counter = fpm._counter + 1
    fpm.logger.debug("[CALL METHOD]:" + method + "@" + v)
    fpm.runAction('CALL_API', fpm, ctx, { method, param, v })
    let p = await core(method, param, v, fpm, ctx)
    ctx.success(p)
  }catch(err){
    ctx.fail(err)
  }
})

export default Api
