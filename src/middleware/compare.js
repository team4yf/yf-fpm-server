'use strict'
import _ from 'lodash'
import { E } from '../utils/exception.js'
import { md5 } from '../utils/kit'

const ARG_ARRAY = 'method,appkey,timestamp,sign'.split(',')

let compare = (ctx) => {
  let postData = ctx.request.body
  let dev = ctx.fpm.getConfig('dev') || 'DEV'
  let apps = ctx.fpm.getClients()
  let checkResult = checkArgs(postData, dev, apps)
  if(checkResult.errno !== true ){
    return checkResult
  }
  //需要请求的函数名
  let method = postData.method
  //客户端的应用密钥
  let appkey = postData.appkey
  //接口版本
  let v = postData.v || ctx.fpm.getConfig('defaultVersion')
  //时间戳
  let timestamp = postData.timestamp

  timestamp = parseInt(timestamp)

  if('DEV' != dev){
    //两个时间内的时间戳不能相差过大,默认30分钟
    let delta = _.now() - timestamp

    if(Math.abs(delta/100/60) > 30){
        return E.System.TIMEZONE_OVER
    }
  }

  let param = postData.param

  if(_.isString(param)){
      try{
          param = JSON.parse(param)
      }catch(e){
          //传入的param不是JSON格式
          return E.System.PARAM_IS_NOT_JSON
      }
  }
  return true
}


let checkArgs = (args, dev, apps) => {
    if(!args){
        return E.System.NO_POST_DATA
    }
    for(let i in ARG_ARRAY){
        let a = ARG_ARRAY[i]
        if(!_.has(args, a)){
            return E.System.LOST_PARAM( a )
        }
    }
    //开发模式忽略验证
    if('DEV' === dev){
      return true
    }
    //验证数据的完整性
    if(sign(args, apps)){
      return true
    }
    return E.System.SIGN_ERROR
}

/**
 * 将传入的参数做一个签名的验证，确认其身份和数据的完整性
 * @param args
 */
let sign = (args, apps) => {
    let sign = args.sign
    delete args.sign

    if(apps){
        args.masterKey = apps[args.appkey].secretkey
    }else{
        args.masterKey = '123'
    }

    let ks = _.keys(args)
    ks = ks.sort()
    let strArgs = _.map(ks, k => {
        let val = args[k]
        if(_.isObject(val)){
            val = JSON.stringify(val)
        }
        return k + '=' + encodeURIComponent(val)
    })
    let content = strArgs.join('&')
    let d = md5(content)
    return d == sign
}

export default async (ctx, next) => {
  let req = ctx.request
  let path = req.url
  if(path === '/api'){
    let judgeResult = compare(ctx)
    if(judgeResult === true){
      await next()
    }else{
      ctx.fail(judgeResult)
    }
  }else{
    await next()
  }
}
