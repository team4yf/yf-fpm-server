import Router from 'koa-router'

const admin = Router()

admin.get('/admin', async (ctx, next) => {
  await ctx.render('admin/login', {
    version: ctx.fpm.getVersion()
  })
})

admin.get('/admin/login', async (ctx, next) => {
  await ctx.render('admin/login', {
    version: ctx.fpm.getVersion()
  })
})

admin.get('/admin/main', async (ctx, next) => {
  await ctx.render('admin/main', {
    version: ctx.fpm.getVersion(),
  })
})

admin.post('/admin/login', async (ctx, next) => {
  //check pass
  let loginInfo = ctx.request.body
  if (loginInfo.name === 'admin' && loginInfo.pass === '741235896') {
    ctx.session.admin = loginInfo
    ctx.body = { code: 0 }
    // TODO: check premission
  } else {
    ctx.body = { code: -99, error: 'User Or Pass Error ' }
  }
})

export default admin
