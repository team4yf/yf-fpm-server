export default async (ctx, next) => {
  console.log(ctx);
  let req = ctx.request;
  let path = req.url;
  //如果调用的是api路由，则进行分析和拦截
  if(path === '/api'){
    //TODO: 验证安全性并进行日志记录
    await next();
    // ctx.fail();
  }else{
    await next();
  }
}
