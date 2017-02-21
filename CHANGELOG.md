# 2.1.7 (2017-02-21)

Feature:

- Support Plugin
- update koa2-cors modules

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
