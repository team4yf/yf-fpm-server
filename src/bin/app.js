/**
 * FPM-Server 核心文件
 * @author wang.fan
 * @lastModifyAt 2017-07-15 09:18
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
import Exception from '../utils/exception.js'
import { doCommand } from '../utils/process.js'
import { deletedir }  from '../utils/kit.js'

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
  about error
------------------*/
import E from '../error'

/******* Import End *******/

// fpm core package info
const packageInfo = require('../../package.json')

//runtime dir
const CWD = process.cwd()

// project package info
const projectInfo = require(path.join(CWD, 'package.json'))

// local dir
const LOCAL = path.join(__dirname, '../../')

//load local config.json
let configPath = path.join(CWD, 'config.json')
let config = {
  server:{
    hostname: '0.0.0.0',
    domain: 'localhost',
    port: 9999
  },
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
if(fs.existsSync(configPath)){
  config = _.assign(config, require(configPath));
}

const loadPlugin = function(fpm){
  let modulesDir = path.join(CWD, 'node_modules')
  let files = fs.readdirSync(modulesDir)
  files = _.filter(files, (f)=>{
    return _.startsWith(f, 'fpm-plugin-')
  })
  //load package.json
  let plugins = {}
  _.map(files, (f)=>{
    let packageInfo = require(path.join(modulesDir, f, 'package.json'))
    plugins[packageInfo.name] = { name: packageInfo.name, version: packageInfo.version}
  })
  _.map(plugins, (p) => {
    let m = require(path.join(modulesDir, p.name))
    if(_.has(m, 'default')){
      m = m.default
    }
    if(_.isFunction(m.getDependencies)){
      let deps = m.getDependencies() || []
      _.map(deps, (d) => {
        if(!_.has(plugins, d.name)){
          throw new Exception(E.System.PLUGIN_LOAD_ERROR(p.name, d.name))
        }
      })
    }
    p.ref = m.bind(fpm)
  })
  fpm._plugins = _.assign(fpm._plugins, plugins)
}

class Fpm {
  constructor(){
    this.logger = console

    let app = new Koa()
    app.use(BodyParser())
    app.use(cors())
    app.use(response)

    this.app = app
    this._options = {
      'LOCAL': LOCAL,
      'CWD': CWD,
    }
    this.doCommand = doCommand
    this._biz_module = {}
    this._hook = new Hook()
    this._action = {}
    this._start_time = _.now()
    this._counter = 0
    this._prject_info = projectInfo
    this._env = config.dev
    this._version = packageInfo.version
    this._plugins = {}

    //add plugins
    loadPlugin(this)
    this.runAction('INIT', this)
    this.errorHandler = (err, ctx) => {
    	this.logger.error('server error', err, ctx)
    }
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
    return await core(method, args, v, this, ctx)
  }

  addAfterHook(method, hookHandler, v, priority){
    return this._hook.addAfterHook(method, hookHandler, v, priority)
  }

  addBeforeHook(method, hookHandler, v, priority){
    return this._hook.addBeforeHook(method, hookHandler, v, priority)
  }

  getConfig(c){
    if(_.isEmpty(c)){
      return config
    }
    return config[c]
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
    PubSub.publish(topic, data)
  }

  subscribe(topic, callback){
    PubSub.subscribe(topic, callback)
  }

  run(){
    let self = this
    this.app.use(async(ctx, next) => {
      //将fpm注入到ctx中,供其他中间件使用
      ctx.fpm = self
      await next()
    })
    this.app.use(permission)
    this.app.use(compare)

    this.runAction('FPM_MIDDLEWARE', this, this.app)

    this.bindRouter(api)
    this.bindRouter(ping)
    this.bindRouter(webhook)

    this.runAction('ADMIN', this, this.app)
    
    this.runAction('FPM_ROUTER', this, this.app)
    this.runAction('BEFORE_SERVER_START', this, this.app)

    this.app.on('error', this.errorHandler)
    this.app.listen(config.server.port, config.server.hostname)
    this.runAction('AFTER_SERVER_START', this, this.app)
    this.logger.info(`FPM-SERVER is Running On ${config.server.hostname}:${config.server.port}, And Bind At http://${config.server.domain}:${config.server.port}`)
    return Promise.resolve(this)
  }
}


export { Fpm , Hook , Biz}
