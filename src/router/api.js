import Router from 'koa-router'
import core from '../bin/core.js'
import Debug from 'debug';
import _ from 'lodash'

const debug = Debug('yf-fpm-server:api.js')
const Api = Router()

Api.post('/api', async (ctx, next) => {
  const postData = ctx.request.body
  let { v, method, param } = postData
  const fpm = ctx.fpm
  try{
    param = JSON.parse(param)
    // TODO: should check the overflow error!
    fpm._counter = fpm._counter + 1
    const startAt = _.now();

    debug("[CALL METHOD]: %s @ %s. StartAt: %d", method, v, startAt)
    debug("PostData: %O", postData)
    
    fpm.logger.info('[CALL METHOD]: %s @ %s. StartAt: %d, PostData: %O', method, v, startAt, postData);

    fpm.runAction('CALL_API', fpm, ctx, { method, param, v })
    const p = await core(method, param, v, fpm, ctx)

    // TODO: save the api call detail.
    const endAt = _.now();
    debug('Api Biz result: %O, EntAt: %d, Use Total: %d', p, endAt, endAt - startAt)
    fpm.logger.info('Api Biz result: %O, EntAt: %d, Use Total: %d', p, endAt, endAt - startAt)

    ctx.success(p)
  }catch(err){
    fpm.logger.error('Api Biz Execute Error: %O', err)
    debug('Api Biz Execute Error: %O', err)
    ctx.fail(err)
  }
})

export default Api
