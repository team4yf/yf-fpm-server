import Router from 'koa-router'
import core from '../bin/core.js'
import Debug from 'debug';

const debug = Debug('yf-fpm-server:api.js')
const Api = Router()

Api.post('/api', async (ctx, next) => {
  let postData = ctx.request.body
  let v = postData.v
  let method = postData.method
  let param = postData.param
  const fpm = ctx.fpm
  try{
    param = JSON.parse(param)
    fpm._counter = fpm._counter + 1
    debug("[CALL METHOD]: %s @ %s", method, v)
    debug("PostData: %O", postData)
    fpm.runAction('CALL_API', fpm, ctx, { method, param, v })
    let p = await core(method, param, v, fpm, ctx)
    ctx.success(p)
  }catch(err){
    ctx.fail(err)
  }
})

export default Api
