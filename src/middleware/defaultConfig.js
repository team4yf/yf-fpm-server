'use strict';
/**
获取系统配置信息的中间件
*/
import _ from 'lodash';

export default async (ctx, next) =>{

  const _defaultConfig = {
    server:{
      port: 8080
    },
    defaultVersion:'0.0.1',
    dev: 'DEV',
    log4js: {
      appenders: [
        { type: 'console' },{
          type: 'file',
          filename: 'logs/access.log',
          maxLogSize: 1024 * 1024 * 100, //100Mb一个文件
          backups:10,
          category: 'normal'
        }
      ],
      replaceConsole: true,
      levels:{
        dateFileLog: 'debug',
        console: 'errno'
      }
    }
  };
  //默认直接返回一个内存中的配置
  //TODO：此处需要重写
  ctx.getConfig = (k) => {
    if(k){
      return _defaultConfig[k];
    }else{
      return _defaultConfig;
    }
  }

  await next();
}
