import Router from 'koa-router';

const ping = Router();

ping.get('/ping', async (ctx, next) => {
  await ctx.success({
    data:{}
  }, 'System online');
})

export default ping;
