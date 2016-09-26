import Router from 'koa-router';
import core from '../bin/core.js';

const Api = Router();

Api.post('/api', async(ctx, next) => {
  let postData = ctx.body;
  let v = postData.v;
  let method = postData.method;
  let param = postData.param;
  try{
    let p = await core(method,param,v);
    await ctx.success(p);
  }catch(err){
    await ctx.fail(err);
  }
})

export default Api;
