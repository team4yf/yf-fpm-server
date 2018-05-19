# 2.3.0 (2018-05-19)

Remove:
- gulp
- jquery
- materialize-css
- log
- moment

# 2.2.25 (2018-05-14)

Remove: 
- views/
- public/ 
- admin.js

TODO:
- implement a fpm-plugin-admin

# 2.2.24 (2018-05-13)

ADD:
- Add Action Before Api Invoke
`ctx.fpm.runAction('CALL_API', ctx.fpm, ctx, { method, param, v })`
- Attach An Argument `ctx` At Function `core(method, args, v, fpm, ctx)`
- Attach An Argument `ctx` At Each Handler `handler(args, ctx, [])`
  - The Last Argument should be replaced by the output of before_*_hook, It always be an Array
- Attach An Argument `ctx` At `hook.runHook('before_' + method, args, v, ctx)`


# 2.2.24 (2018-04-28)

TODO:
- Add Ip Filter In File `permission.js`ss

# 2.2.24 (2018-04-25)

Remove

- The `BEFORE_MODULES_ADDED` & `AFTER_MODULES_ADDED` Action Hook Points May Invoke Multi Times; `fpm.addBizModules(biz:Biz)` can be called many times

- In The Middleware `response.js`;  Support More Type Of Result Not Only `Object`
  ```javascript
  ctx.success = (result, msg) => {
    data.message = msg || ''
    if(_.isPlainObject(result)){
      if(_.has(result, data)){
        data.data = result.data
        return
      }
    }    
    data.data = result   
  }
  ```

Add

- `extendModule(name:String!, module:Object/Function!, version:String?)` for plugin in `DEV` mode
- `getPlugins()` show all loaded plugins
- `isPluginInstalled(name:String!)`

Remove 

- example\runner.js 

# 2.2.21 (2017-07-15)

Add

- Fpm
  - Admin
    - login

# 2.2.5 (2017-07-01)

Add

- Fpm
  - `createRouter`
  - `bindRouter(router)`

# 2.2.4 (2017-04-08)

Remove

- upload router
- upload dir
- remove `qiniu` dep

Plugin

- qiniu upload plugin
- memory upload plugin

# 2.2.3 (2017-04-05)

Feature

- Support file middleware `qiniu`

# 2.2.3 (2017-03-29)

Feature

- Support upload use `koa-multer`


# 2.2.2 (2017-03-28)

Feature

- upload 

# 2.2.2 (2017-03-05)

Feature

- Support Pub/Sub

# 2.2.1 (2017-03-05)

Remove

- concat analyse.js to auth.js

Change

- Use `Reg.test()` To Validate The App Root

# 2.2.0 (2017-03-02)

Feature

- plugin inject config to FPM.config

```javascript
extendConfig(c){
  config = _.assign(config, c || {})
}
```

Remove

- util.job,util.logger

Files Change

- Add example dir with app.js 

# 2.1.8 (2017-03-01)

- check config.json when FPM.INIT()

BreakChange:

- cancel config middleware

# 2.1.7 (2017-02-21)

Feature:

- Support Plugin
- update koa2-cors modules

- Add getConfig() from config.json static config file

- add more hook points
[ INIT, BEFORE_ROUTER_ADDED, AFTER_ROUTER_ADDED, BEFORE_MODULES_ADDED, AFTER_MODULES_ADDED, BEFORE_SERVER_START, AFTER_SERVER_START]

- add execute method for fpm class

# 2.1.6 (2017-02-05)

Feature:

- support post json data
- update Koa Modules

# 2.1.5 (2017-02-05)


FixBugs:

- server error TypeError: args.hasOwnProperty is not a function

```bash
server error TypeError: args.hasOwnProperty is not a function
    at checkArgs (F:/FPM/yf-fpm-server/src/middleware/compare.js:55:16)
    at compare (F:/FPM/yf-fpm-server/src/middleware/compare.js:9:21)
    at _callee$ (F:/FPM/yf-fpm-server/src/middleware/compare.js:107:23)
    at tryCatch (F:\FPM\yf-fpm-server\node_modules\.0.10.1@regenerator-runtime\runtime.js:64:40)
    at GeneratorFunctionPrototype.invoke [as _invoke] (F:\FPM\yf-fpm-server\node_modules\.0.10.1@regenerator-runtime\runtime.js:355:22)
```

Bug: /src/middleware/compare.js:55:16

before:

```javascript
if(!args.hasOwnProperty(a))
```

after:

```javascript
if(!_.has(args, a))
```
