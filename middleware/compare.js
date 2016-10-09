'use strict';
import _ from 'lodash';
import E from '../error';
import crypto from 'crypto';

let compare = (ctx) => {
  let postData = ctx.body;
  let dev = ctx.getConfig('dev');
  let checkResult = checkArgs(postData, dev);
  if(checkResult.errno !== true ){
    return checkResult;
  };
  //需要请求的函数名
  let method = postData.method;
  //客户端的应用密钥
  let appkey = postData.appkey;
  //接口版本
  let v = postData.v || ctx.getConfig('defaultVersion');
  //时间戳
  let timestamp = postData.timestamp;

  timestamp = parseInt(timestamp);

  if('DEV' != dev){
    //两个时间内的时间戳不能相差过大,默认30分钟
    let delta = _.now() - timestamp;

    if(Math.abs(delta/100/60) > 30){
        return E.System.TIMEZONE_OVER;
    }
  }

  let param = postData.param;

  if(_.isString(param)){
      try{
          param = JSON.parse(param);
      }catch(e){
          //传入的param不是JSON格式
          return E.System.PARAM_IS_NOT_JSON;
      }
  }
  return true;
}


let checkArgs = (args, dev) => {
    if(!args){
        return E.System.NO_POST_DATA;
    }
    let argArray = 'method,appkey,timestamp,sign'.split(',');
    let len = argArray.length;
    for(let i = 0; i < len; i++){
      let a = argArray[i];
      if(!args.hasOwnProperty(a)){
          return E.System.LOST_PARAM( a );
      }
    }
    //开发模式忽略验证
    if('DEV' === dev){
      return true;
    }
    //验证数据的完整性
    if(sign(args)){
      return true;
    }
    return E.System.SIGN_ERROR;
}

/**
 * 将传入的参数做一个签名的验证，确认其身份和数据的完整性
 * @param args
 */
let sign = (args) => {
    let md5 = crypto.createHash('md5');
    let sign = args.sign;
    delete args.sign;
    let apps = cache.get('apps');
    if(apps){
        args.masterKey = apps[args.appkey].secretkey;
    }else{
        args.masterKey = '123';
    }
    let ks = [];
    for(var k in args){
        ks.push(k);
    }
    ks = ks.sort();
    let strArgs = [];
    ks.forEach(function(item){
        let val = args[item];
        if(_.isObject(val)){
            val = JSON.stringify(val);
        }
        strArgs.push(item + '=' + encodeURIComponent(val));
    });
    let content = strArgs.join('&');
    md5.update(content);
    let d = md5.digest('hex');
    return d == sign;
}

export default async (ctx, next) => {
  let req = ctx.request;
  let path = req.url;
  if(path === '/api'){
    let judgeResult = compare(ctx);
    if(judgeResult === true){
      await next();
    }else{
      ctx.fail(judgeResult);
    }
  }else{
    await next();
  }
}
