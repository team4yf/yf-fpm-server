'use strict';
import _ from 'lodash';
import kit from '../utils/kit.js';
import E from '../error';
import crypto from 'crypto';
import cache from 'memory-cache';

function compare(postData){
    var checkResult = checkArgs(postData);
    if(checkResult.errno !== true ){
        return checkResult;
    };
    //需要请求的函数名
    var method = postData.method;
    //客户端的应用密钥
    var appkey = postData.appkey;
    //接口版本
    var v = postData.v || '0.0.1';
    //时间戳
    var timestamp = postData.timestamp;

    timestamp = parseInt(timestamp);

    if('DEV' != global.__env){
        //两个时间内的时间戳不能相差过大,默认30分钟
        var delta = _.now() - timestamp;

        if(Math.abs(delta/100/60) > 30){
            return E.System.TIMEZONE_OVER;
        }
    }

    var param = postData.param;

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


function checkArgs(args){
    if(!args){
        return E.System.NO_POST_DATA;
    }
    var argArray = 'method,appkey,timestamp,sign'.split(',');
    var len = argArray.length;
    for(let i = 0; i < len; i++){
        var a = argArray[i];
        if(!args.hasOwnProperty(a)){
            return E.System.LOST_PARAM( a );
        }
    }
    // if(!sign(args)){
    //验证数据的完整性
    if(!sign(args) && 'DEV' != global.__env){
        return E.System.SIGN_ERROR;
    }
    return true;
}

/**
 * 将传入的参数做一个签名的验证，确认其身份和数据的完整性
 * @param args
 */
function sign (args){
    var md5 = crypto.createHash('md5');
    var sign = args.sign;
    delete args.sign;
    var apps = cache.get('apps');
    if(apps){
        args.masterKey = apps[args.appkey].secretkey;
    }else{
        args.masterKey = '123';
    }
    var ks = [];
    for(var k in args){
        ks.push(k);
    }
    ks = ks.sort();
    var strArgs = [];
    ks.forEach(function(item){
        var val = args[item];
        if(_.isObject(val)){
            val = JSON.stringify(val);
        }
        strArgs.push(item+'='+encodeURIComponent(val));
    });
    var content = strArgs.join('&');
    md5.update(content);
    var d = md5.digest('hex');
    return d == sign;
}

export default async (ctx, next) => {
  let req = ctx.request;
  let path = req.url;
  if(path === '/api'){
    let judgeResult = compare(ctx.body);
    if(judgeResult === true){
      await next();
    }else{
      ctx.fail(judgeResult);
    }
  }else{
    await next();
  }
}
