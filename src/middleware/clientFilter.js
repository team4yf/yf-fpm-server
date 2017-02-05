/**
 限定客户端的 app 请求的过滤器
*/
import E from '../error';
import _ from 'lodash';


const apps = {'123123': {
  appkey: '123123',
  approot: '*'
}};

export default async (ctx, next) => {

  ctx.filter4Client = true;
  ctx.getAppsFromCache = () => {
    return new Promise( (resolve,reject) => {
      resolve(apps);
    });
  };
  let req = ctx.request;
  let path = req.url;
  //如果调用的是api路由，则进行分析和拦截
  if(path === '/api'){
    //验证安全性
    let postData = ctx.request.body;
    if(! _.has(apps, postData.appkey)){
      ctx.fail(E.System.AUTH_ERROR);
      return;
    };
  }

  await next();
}
