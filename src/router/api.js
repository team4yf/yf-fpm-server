import Router from 'koa-router'
import core from '../bin/core.js'
import Debug from 'debug';
import _ from 'lodash'
import { v4 as uuid } from 'uuid'

const debug = Debug('yf-fpm-server:api.js')
const Api = Router()

Api.post('/api', async (ctx, next) => {
  const postData = ctx.request.body
  let { v, method, param } = postData
  const fpm = ctx.fpm
  const hash = uuid()
  const startAt = _.now()
  try{
    param = JSON.parse(param)
    // TODO: should check the overflow error!
    fpm._counter = fpm._counter + 1

    debug("[CALL METHOD]: %s @ %s. StartAt: %d", method, v, startAt)
    debug("PostData: %O", postData)
    
    fpm.runAction('CALL_API', fpm, ctx, { method, param, v })
    const p = await core(method, param, v, fpm, ctx)

    // TODO: save the api call detail.
    const endAt = _.now();
    debug('Api Biz result: %O, EntAt: %d, Use Total: %d', p, endAt, endAt - startAt)
    fpm.logger.info({
      type: 'biz',
      status: 'success',
      result: p,
      param,
      startAt: new Date(startAt).toLocaleDateString(),
      endAt: new Date(endAt).toLocaleDateString(),
      hash,
      method,
      v,
      duration: endAt - startAt,
    });
    ctx.success(p)
  }catch(err){
    const endAt = _.now();
    fpm.logger.error({
      status: 'error',
      type: 'biz',
      param,
      startAt: new Date(startAt).toLocaleDateString(),
      endAt: new Date(endAt).toLocaleDateString(),
      hash,
      method,
      v,
      duration: endAt - startAt,
    });
    debug('Api Biz Execute Error: %O', err)
    ctx.fail(err)
  }
})

export default Api
