/*
 * 返回信息中间件
 */
import _ from 'lodash'
import { E } from '../utils/exception.js'

const DEFAULT_ROUTERS = '/api,/ping,/webhook,/notify'.split(',')

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
      if(_.has(result, data)){
        data.data = result.data
        return
      }
    }
    data.data = result
  }

  ctx.fail = (err) => {
    data.message = err.message || E.System.UNDEFINED_EXCEPTION.message
    data.errno = err.errno == undefined ? E.System.UNDEFINED_EXCEPTION.errno : err.errno
    data.code = err.code == undefined ? E.System.UNDEFINED_EXCEPTION.code : err.code
    data.error = err
  }
  await next()
  data.timestamp = _.now()
  ctx.body = data
}
