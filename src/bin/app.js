/**
 * FPM-Server 核心文件
 * @author wang.fan
 * @lastModifyAt 2017-07-15 09:18
 */


/**
  The startup workflow:
  - 1) load the static params: package.json, EVN, CWD, LOCAL, config.json/config.*.json accroding by the ENV.NODE_ENV
  - 2) create a koa2 instance, loadPlugins, execute the INIT hook.
  - 3) bind default routers: api/ping/webhook
  - 4) run some hooks
  - 5) listen the requests
 */

/*-----------------
  about koa2
------------------*/
import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import PubSub from 'pubsub-js'
import Router from 'koa-router'
import path from 'path'
import fs from 'fs'
import https from 'https'
import enforceHttps from 'koa-sslify'
import _ from 'lodash'

/*-----------------
  about middleware
------------------*/
import response from '../middleware/response.js'
import permission from '../middleware/permission.js'
import compare from '../middleware/compare.js'

/*-----------------
  about util
------------------*/
import Hook from '../utils/hook.js'
import Biz from '../utils/biz.js'
import { doCommand, execShell } from '../utils/process.js'
import { loadPlugin } from '../utils/plugin.js'

/*-----------------
  about router
------------------*/
import api from '../router/api.js'
import ping from '../router/ping.js'
import webhook from '../router/webhook.js'

/*-----------------
  about invoker
------------------*/
import core from './core'

/*-----------------
  about error and exception
------------------*/
import Exception, { E } from '../utils/exception.js'

/******* Import End *******/

// fpm core package info
const packageInfo = require('../../package.json')

//runtime dir
const CWD = process.cwd()

// load the process.ENV
const ENV = process.env;

// project package info
const projectInfo = require(path.join(CWD, 'package.json'))

// local dir
const LOCAL = path.join(__dirname, '../../')

//load local config.json
const configPath = path.join(CWD, 'config.json')
let config = {
  server:{
    hostname: '0.0.0.0',
    domain: 'localhost',
    port: 9999
  },
  // ssl: {
  //   key: 'ssl/server.key',
  //   cert: 'ssl/server.crt',
  //   port: 9443,
  // },
  defaultVersion: '0.0.1',
  dev: 'DEV',
  apps: {
    '123123': {
      appkey: '123123',
      approot: '*',
      secretkey: '123123',
    }
  }
}

// load the default global config
if(fs.existsSync(configPath)){
  config = _.assign(config, require(configPath));
}

// get the node runtime
const RUN_MODE = ENV.NODE_ENV || 'dev';

// load the config.dev.json / config.prod.json / config.*.json
const RUNTIME_CONFIG = path.join(CWD, `config.${RUN_MODE.toLowerCase()}.json`);

// extend the config object
if(fs.existsSync(RUNTIME_CONFIG)){
  config = _.assign(config, require(RUNTIME_CONFIG));
}


class Fpm {
  constructor( options ){
    this.logger = console

    let app = new Koa()
    this.app = app
    this._options = _.assign({
      'LOCAL': LOCAL,
      'CWD': CWD,
    }, options);

    this.doCommand = doCommand
    this.execShell = execShell
    this._biz_module = {}
    this._hook = new Hook()
    this._action = {}
    this._start_time = _.now()
    this._counter = 0
    this._prject_info = projectInfo
    this._env = config.dev
    this._version = packageInfo.version
    //add plugins
    this._plugins = loadPlugin(this) || {}
    this._publish_topics = []
    this._webhook_events = []
    this.runAction('INIT', this)
    this.errorHandler = (err, ctx) => {
    	this.logger.error('server error', err, ctx)
    }
    this.app.use(async(ctx, next) => {
      delete ctx.disableBodyParser;
      if(ctx.request.method !== 'POST'){
        // ignore all request exclude the POST
        await next();
        return;
      }
      const disableBodyParser = this.get('disableBodyParser');
      if(disableBodyParser){
        let urls;
        if(_.isArray(disableBodyParser)){
          urls = disableBodyParser;
        }else if(_.isString(disableBodyParser)){
          urls = disableBodyParser.split(',');
        }
        const urlPath = ctx.request.url ;
        _.map(urls, url => {
          if(_.endsWith(urlPath, url)){
            ctx.disableBodyParser = true;
          }
        })
      }
      await next()
    })
    this.app.use(BodyParser())
    this.app.use(cors())
    this.app.use(response)
  }

  set(k, v){
    this._options[k] = v
  }

  get(k, udv){
    return (this._options[k] === undefined)? udv :this._options[k]
  }

  getApp(){
    return this.app
  }

  getVersion(){
    return this._version
  }

  getPlugins(){
    return this._plugins
  }

  getPluginRef(pname){
    if(!_.startsWith(pname, 'fpm-plugin-')){
      pname = 'fpm-plugin-' + pname
    }
    if(_.has(this._plugins, pname)){
      return this._plugins[pname].ref
    }
    return undefined
  }

  isPluginInstalled(name){
    return _.has(this._plugins, name)
  }

  createRouter(){
    return Router()
  }

  createBiz(version){
    return new Biz(version)
  }

  bindRouter(router){
    this.app.use(router.routes())
      .use(router.allowedMethods())
  }

  extendModule(name, module, version){
    if(_.isFunction(module)){
      module = module(this)
    }
    if(!version){
      // extend for every version
      _.map(this._biz_module, (bizModule) => {
        bizModule[name] = module
      })
    }else{
      // extend for Special Version
      if(!_.has(this.getBizVersions(), version)){
        throw new Exception(E.System.BIZ_VERSION_NOT_FNOUND(version))
      }
      this._biz_module[version][name] = module
    }
  }

  getBizVersions(){
    return _.keys(this._biz_module)
  }
  addBizModules(biz){
    if(biz instanceof Biz){
      let m = biz.convert()
      this._biz_module[m.version] = m.modules
    }else{
      throw new Exception({
        code: 'Biz-Load-Error',
        errno: -10011,
        message: 'Biz must be instanceof Biz'
      })
    }
  }

  registerAction(actionName, action){
    let actionList
    if(_.has(this._action, actionName)){
      actionList = this._action[actionName]
    }else {
      actionList = []
    }
    actionList.push(action)
    this._action[actionName] = actionList
  }

  runAction(actionName){
    if(_.has(this._action, actionName)){
      let actionList = this._action[actionName]
      let argument = _.drop(arguments)
      _.map(actionList, action=>{
        action(argument)
      })
    }
  }

  async execute(method, args, v, ctx){
    return await core(method, args, v || config.defaultVersion , this, ctx)
  }

  addAfterHook(method, hookHandler, v, priority){
    return this._hook.addAfterHook(method, hookHandler, v || config.defaultVersion, priority)
  }

  addBeforeHook(method, hookHandler, v, priority){
    return this._hook.addBeforeHook(method, hookHandler, v || config.defaultVersion, priority)
  }

  getConfig(c, defaultValue){
    if(_.isEmpty(c)){
      return config
    }
    return config[c] || (defaultValue || {})
  }

  getEnv(key, defaultValue){
    if(_.isEmpty(key)){
      return ENV;
    }
    return ENV[key] || defaultValue;
  }

  extendConfig(c){
    config = _.assign(config, c || {})
  }

  getClients(){
    let apps = this.getConfig('apps')
    return apps || {}
  }

  bindErrorHandler(handler){
    this.errorHandler = handler
  }

  publish(topic, data){
    if(!_.includes(this._publish_topics, topic)){
      this._publish_topics.push(topic)
    }
    PubSub.publish(topic, data)
  }

  subscribe(topic, callback){
    PubSub.subscribe(topic, callback)
  }

  run(){
    let self = this
    this.app.use(async(ctx, next) => {
      // add fpm ref to context, for other middleware to use.
      ctx.fpm = self
      await next()
    })
    this.app.use(permission)
    this.app.use(compare)

    // TODO: i dont know what it's for ????
    if(config.ssl){
      this.app.use(enforceHttps({
        port: config.ssl.port,
      }));
    }

    this.runAction('FPM_MIDDLEWARE', this, this.app)

    this.bindRouter(api)
    this.bindRouter(ping)
    this.bindRouter(webhook)

    this.runAction('ADMIN', this, this.app)

    this.runAction('FPM_ROUTER', this, this.app)
    this.runAction('BEFORE_SERVER_START', this, this.app)

    this.app.on('error', this.errorHandler)

    this.app.listen(config.server.port, config.server.hostname || '0.0.0.0')
    if(config.ssl){
      const options = {
        key: fs.readFileSync(path.join(CWD, `${config.ssl.key}`)),
        cert: fs.readFileSync(path.join(CWD, `${config.ssl.cert}`)),
      }
      https.createServer(options, this.app.callback()).listen(config.ssl.port);
    }

    this.runAction('AFTER_SERVER_START', this, this.app)
    this.logger.info(`FPM-SERVER is running on ${config.server.hostname || '0.0.0.0'}:${config.server.port}`);
    if(config.server.domain){
      this.logger.info(`Bind at HTTP Server: http://${config.server.domain}`);
    }
    if(config.ssl){
      this.logger.info(`Bind at HTTPS Server: https://${config.server.domain || config.server.hostname}:${config.ssl.port}`);
    }
    

    return Promise.resolve(this)
  }
}

export { Fpm , Hook , Biz}
export default Fpm
