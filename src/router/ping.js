import Router from 'koa-router'

const ping = Router()

ping.get('/ping', (ctx, next) => {
  ctx.success({
    data:{}
  }, 'System online')
})

export default ping
