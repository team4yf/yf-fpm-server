import Router from 'koa-router'

const webhook = Router()

/**
 * upstream: 来源, weixin,fir.im...
 * type: notify, message, hook
 * data: 数据
 */
webhook.post('/webhook/:upstream/:type/:data', (ctx, next) => {
  let upstream = ctx.params.upstream
  let type = ctx.params.type
  let data = ctx.params.data
  let message = ctx.request.body
  message.url_data = data
  ctx.fpm.logger.log(`Webhook publish: ${upstream} / ${type}; Message is :`, message)
  ctx.fpm.publish(upstream + '/' + type, message)
  ctx.body = {
    message: 'ok'
  }
})

export default webhook
