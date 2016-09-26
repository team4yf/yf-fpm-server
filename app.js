import Koa from 'koa';
import KoaBodyParser from 'koa-better-body';
import cors from 'koa-cors';
// koa1中间件转换
import convert from 'koa-convert';

import config from './config.js';

import response from './middleware/response.js';

import analyse from './middleware/analyse.js';

import compare from './middleware/compare.js';


import api from './router/api.js';

global.__env = 'DEV';

const app = new Koa();

// middleware
//验证api请求的合法性
// var compare = require('../utils/compare.js')(config);
// server.use(compare);
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

const httpPort = 9999;
app.listen(httpPort);

console.log(`http server listening on port ${httpPort}`);
