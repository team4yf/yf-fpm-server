import Router from 'koa-router'
import _ from 'lodash'
import Debug from 'debug';

const debug = Debug('yf-fpm-server:webhook.js')
const webhook = Router()

/**
 * upstream: 来源, weixin,fir.im...
 * type: notify, message, hook
 * data: 数据
 * curl -H "Content-Type:application/json" -X POST --data '{"id":10}' http://localhost:9999/webhook/test/foo/bar
 */
webhook.post('/webhook/:upstream/:type/:data', (ctx, next) => {
  const { upstream, type, data } = ctx.params
  const topic = `#webhook/${upstream}/${type}`
  const message = ctx.request.body
  const events = ctx.fpm._webhook_events
  message.url_data = data
  debug('Webhook publish => Request: %O, Topic: %s, Message: %O', ctx.request, topic, message);
  ctx.fpm.publish(topic, message)
  events.unshift({topic, message, at: _.now()})
  if(events.length > 100){
    events.pop()
  }
  ctx.body = {
    message: 'ok'
  }
})

export default webhook
