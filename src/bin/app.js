import Koa from 'koa';
import BodyParser from 'koa-bodyparser'
import cors from 'koa2-cors';
import response from '../middleware/response.js';
import clientFilter from '../middleware/clientFilter.js';
import analyse from '../middleware/analyse.js';
import compare from '../middleware/compare.js';
import Hook from '../utils/hook.js';
import Biz from '../utils/biz.js';
import api from '../router/api.js';
import ping from '../router/ping.js';
import upload from '../router/upload.js';
import core from './core'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

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
    let app = new Koa();
    app.use(BodyParser());
    app.use(cors());
    app.use(response);
    // err handler
    app.on('error', (err, ctx) => {
    	console.error('server error', err, ctx);
    });
    this.app = app;

    this._biz_module = {};
    this._hook = {};
    this._action = {};
    //add plugins
    loadPlugin(this)
    this.runAction('INIT', this)
  }

  use(middleware){
    this.app.use(middleware);
  }

  addRouter(routers,methods){
    this.runAction('BEFORE_ROUTER_ADDED')
    this.app.use(routers,methods);
    this.runAction('AFTER_ROUTER_ADDED')
  }

  addBizModules(biz){
    this.runAction('BEFORE_MODULES_ADDED', biz)
    if(biz instanceof Biz){
      let m = biz.convert();
      this._biz_module[m.version] = m.modules;
    }else{
      throw new Error('Biz must be instanceof Biz');
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
    return await core(method, args, v)
  }

  addHook(hook){
    if(hook instanceof Hook){
      this._hook = hook;
    }else{
      throw new Error('Hook must be instanceof Hook');
    }
  }

  getApp(){
    return this.app;
  }

  getConfig(){
    let configPath = path.join(process.cwd(), 'config.json')
    if(fs.existsSync(configPath)){
      return require(configPath)
    }
    return {}
  }

  run(port){
    // middleware
    this.app.use(clientFilter);
    this.app.use(analyse);
    this.app.use(compare);
    this.app.use(api.routes()).use(api.allowedMethods());
    this.app.use(ping.routes()).use(ping.allowedMethods());
    this.app.use(upload.routes()).use(upload.allowedMethods());

    global.__biz_module = this._biz_module;
    global.__hook = this._hook;

    this.runAction('BEFORE_SERVER_START', this)
    this.app.listen(port);
    this.runAction('AFTER_SERVER_START', this)
    console.log(`http server listening on port ${port}`);
  }
}


export{ Fpm , Hook , Biz}
