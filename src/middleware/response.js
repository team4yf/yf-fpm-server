/*
 * 返回信息中间件
 */
import _ from 'lodash'

const DEFAULT_ROUTERS = '/api,/ping,/webhook'.split(',')

export default async (ctx, next) => {
  let req = ctx.request
  let path = req.url
  if(_.indexOf(DEFAULT_ROUTERS, path) < 0){
    await next()
    return
  }
  let data = {
    errno: 0,
    message: '',
    starttime: _.now()
  }

  ctx.success = (result, msg) => {
    data.message = msg || ''
    if(_.isPlainObject(result)){
      data.data = result.data
    }else{
      data.data = result
    }    
  }

  ctx.fail = (err) => {
    data.message = err.message || 'System Error!'
    data.errno = err.errno == undefined ? -999 : err.errno
    data.code = err.code == undefined ? 'UnDefined' : err.code
    data.error = err
  }
  await next()
  data.timestamp = _.now()
  ctx.body = data
}
