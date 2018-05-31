/**
 进行api请求的权限过滤
*/
import { E } from '../utils/exception.js'
import _ from 'lodash'

export default async (ctx, next) => {
  let req = ctx.request
  let path = req.url
  //如果调用的是api路由，则进行分析和拦截
  if(path === '/api'){
    if( req.method !== 'POST'){
      ctx.fail(E.System.ONLY_POST_ALLOWED)
      return
    }
    //验证安全性
    let postData = ctx.request.body
    let apps = await ctx.fpm.getClients()
    if(! _.has(apps, postData.appkey)){
      ctx.fail(E.System.AUTH_ERROR)
      return
    }
    // 验证应用授权信息
    let appItem = apps[postData.appkey]
    if(appItem.approot){
      let approot = appItem.approot
      if(approot === '*'){
        // 使用了通配权限
        await next()
        return
      }
      let method = postData.method
      // 使用正则表达式来匹配信息
      let root = '^' + approot + '$'
      // 涵盖权限
      if(new RegExp(root).test(method)){
        await next()
        return
      }
    }
    // 限定访问
    ctx.fail(E.System.ROOT_ERROR)
    return
  }
  await next()
}
