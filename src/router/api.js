import Router from 'koa-router'
import core from '../bin/core.js'

const Api = Router()

Api.post('/api', async (ctx, next) => {
  let postData = ctx.request.body
  let v = postData.v
  let method = postData.method
  let param = postData.param
  param = JSON.parse(param)
  try{
    ctx.fpm.logger.log("[CALL METHOD]:" + method + "@" + v)
    ctx.fpm.runAction('CALL_API', ctx.fpm, ctx, { method, param, v })
    let p = await core(method, param, v, ctx.fpm, ctx)
    ctx.success(p)
  }catch(err){
    ctx.fail(err)
  }
})

export default Api
