import Router from 'koa-router';

const Api = Router();

Api.post('/api', async(ctx, next) => {

  // var v = req.v;
  // var method = req.method;
  // var param = req.param;
  // var timestamp = req.timestamp;
  // var p = reflecter.invoke(method,param,v);

  await ctx.success({data:'ok'});
	// await ctx.fail({errno:-901,message:'aaa'});
})

export default Api;
