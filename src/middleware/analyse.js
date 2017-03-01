import E from '../error'
import _ from 'lodash'

export default async (ctx, next) => {
  let req = ctx.request
  let path = req.url
  //如果调用的是api路由，则进行分析和拦截
  if(path === '/api'){
    //验证安全性并进行日志记录
    let postData = ctx.request.body
    // 从缓存中获取已经授权的应用列表
    let apps = await ctx.fpm.getClients()
    // 验证应用授权信息
    let appItem = apps[postData.appkey]
    if(appItem.approot){
      let approot = appItem.approot
      if(approot === '*'){
        // 使用了通配权限
        await next()
      }else{
        let method = postData.method
        let scope = method.split('.')[0]
        let roots = approot.split(',')
        // 涵盖权限
        if(_.indexOf(roots, scope) > -1){
          await next()
        }else{
          ctx.fail(E.System.ROOT_ERROR)
        }
      }

    }else{
      ctx.fail(E.System.ROOT_ERROR)
    }

  }else{
    await next()
  }
}
