import Koa from 'koa';
import KoaBodyParser from 'koa-better-body';
import cors from 'koa-cors';
// koa1中间件转换
import convert from 'koa-convert';

import config from '../config.js';

import response from '../middleware/response.js';

import analyse from '../middleware/analyse.js';

import compare from '../middleware/compare.js';

import Hook from '../utils/hook.js';

import api from '../router/api.js';

export default class {
  constructor(){
    let app = new Koa();
    // middleware
    app.use(convert(KoaBodyParser()));
    app.use(convert(cors()));
    app.use(response);
    app.use(analyse);
    app.use(compare);
    app.use(api.routes()).use(api.allowedMethods());

    // err handler
    app.on('error', (err, ctx) => {
    	console.error('server error', err, ctx);
    });
    this.app = app;

    this.hook = new Hook();

    global.__hook = this.hook;
  }

  setBizModules(modules){
    global.__biz_module = modules;
  }

  addBeforeHook(hookName, fn, priority){
    return this.hook.addBeforeHook(hookName, fn, priority);
  }

  addAfterHook(hookName, fn, priority){
    return this.hook.addAfterHook(hookName, fn, priority);
  }

  getApp(){
    return this.app;
  }

  run(port){
    this.app.listen(port);
    console.log(`http server listening on port ${port}`);
  }
}
