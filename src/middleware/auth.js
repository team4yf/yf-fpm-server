/**
 限定客户端的 app 请求的过滤器
*/
import E from '../error'
import _ from 'lodash'

export default async (ctx, next) => {
  let req = ctx.request
  let path = req.url
  //如果调用的是api路由，则进行分析和拦截
  if(path === '/api'){
    //验证安全性
    let postData = ctx.request.body
    if(! _.has(ctx.fpm.getClients(), postData.appkey)){
      ctx.fail(E.System.AUTH_ERROR)
      return
    }
  }
  await next()
}
