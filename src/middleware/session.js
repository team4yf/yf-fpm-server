import _ from 'lodash'

export default async (ctx, next) => {
  let req = ctx.request
  let url = req.url
  if(_.startsWith(url, '/admin')){
    if (url === '/admin' || url === '/admin/login') {
      await next()
      return
    }
    let admin = ctx.session.admin
    //TODO RBAC
    if (!admin) {
      ctx.redirect('/admin/login')
    } else {
      await next()
    }
  }else{
    await next()
  }
}