import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import response from '../middleware/response.js'
import auth from '../middleware/auth.js'
import compare from '../middleware/compare.js'
import Hook from '../utils/hook.js'
import Biz from '../utils/biz.js'
import api from '../router/api.js'
import ping from '../router/ping.js'
import upload from '../router/upload.js'
import core from './core'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

//load local config.json
let configPath = path.join(process.cwd(), 'config.json')
let config = {
  server:{
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
  let modulesDir = path.join(process.cwd(), 'node_modules')
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

  plugins = _.map(plugins, (p) => {
    let m = require(path.join(modulesDir, p.name))
    if(_.has(m, 'default')){
      m = m.default
    }
    if(_.isFunction(m.getDependencies)){
      let deps = m.getDependencies() || []
      _.map(deps, (d) => {
        if(!_.has(plugins, d.name)){
          throw new Error('missing plugin ! plugin: ' + p.name + ' dependent plugin: ' + d.name)
        }
      })
    }

    return m.bind(fpm)
  })
}

class Fpm {
  constructor(){
    let app = new Koa()
    app.use(BodyParser())
    app.use(cors())
    app.use(response)

    this.app = app
    this._biz_module = {}
    this._hook = {}
    this._action = {}
    this._start_time = _.now()
    this._env = config.dev
    //add plugins
    loadPlugin(this)
    this.runAction('INIT', this)

    this.errorHandler = (err, ctx) => {
    	console.error('server error', err, ctx)
    }
  }

  getApp(){
    return this.app
  }

  addBizModules(biz){
    this.runAction('BEFORE_MODULES_ADDED', biz)
    if(biz instanceof Biz){
      let m = biz.convert()
      this._biz_module[m.version] = m.modules
    }else{
      throw new Error('Biz must be instanceof Biz')
    }
    this.runAction('AFTER_MODULES_ADDED', biz)
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

  async execute(method, args, v){
    return await core(method, args, v, this)
  }

  addHook(hook){
    if(hook instanceof Hook){
      this._hook = hook
    }else{
      throw new Error('Hook must be instanceof Hook')
    }
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

  run(){
    let self = this
    this.app.use(async(ctx, next) => {
      //将fpm注入到ctx中,供其他中间件使用
      ctx.fpm = self
      await next()
    })
    this.app.use(auth)
    this.app.use(compare)
    this.app.use(api.routes()).use(api.allowedMethods())
    this.app.use(ping.routes()).use(ping.allowedMethods())
    this.app.use(upload.routes()).use(upload.allowedMethods())

    this.runAction('FPM_MIDDLEWARE', this, this.app)
    this.runAction('FPM_ROUTER', this, this.app)
    this.runAction('BEFORE_SERVER_START', this, this.app)

    this.app.on('error', this.errorHandler)
    this.app.listen(config.server.port)
    this.runAction('AFTER_SERVER_START', this, this.app)
    console.log(`http server listening on port ${config.server.port}`)
  }
}


export{ Fpm , Hook , Biz}
