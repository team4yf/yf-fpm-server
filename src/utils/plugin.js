import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import Exception, { E } from './exception.js'
//runtime dir
const CWD = process.cwd()

const bindPlugin = (plugin, plugins, fpm) => {
    if(plugin.isBound)
      return
    const pkg = plugin.package
    let deps
    if(_.isFunction(pkg.getDependencies)){
      deps = pkg.getDependencies() || []
    }
    const len = _.size(deps)
    if(len < 1){
      plugin.ref = pkg.bind(fpm)
      plugin.isBound = true
      return plugin
    }
    _.map(deps, dname => {
      if( !_.has( plugins, dname) ){
        throw new Exception(E.System.PLUGIN_LOAD_ERROR(p.name, d.name))
      }
      const dep = plugins[deps[i]]
      if(!dep.isBound){
        bindPlugin(dep, plugins, fpm)
      }
    })
  
    plugin.ref = pkg.bind(fpm)
    plugin.isBound = true
    return plugin
  }
  
  const loadPlugin = (fpm) =>{
    const modulesDir = path.join(CWD, 'node_modules')
    let files = fs.readdirSync(modulesDir)
    files = _.filter(files, (f)=>{
      return _.startsWith(f, 'fpm-plugin-')
    })
    //load package.json
    let plugins = {}
    _.map(files, (f)=>{
      let pkg = require(path.join(modulesDir, f))
      if(_.has(pkg, 'default')){
        pkg = pkg.default
      }
      const packageInfo = require(path.join(modulesDir, f, 'package.json'))    
      plugins[packageInfo.name] = { 
        name: packageInfo.name, 
        version: packageInfo.version, 
        info: packageInfo, 
        npm:`https://www.npmjs.com/package/${packageInfo.name}`, 
        registry: `http://registry.npmjs.org/${packageInfo.name}`,
        'package': pkg,
        isBound: false,
      }
    })
    _.map(plugins, (p, pname) => {
      plugins[pname] = bindPlugin(p, plugins, fpm)
    })
    return plugins
  }

  export { loadPlugin }