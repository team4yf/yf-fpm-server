## yf-fpm-server

### CHANGELOG

点击查看更新日志 [CHANGELOG](CHANGELOG.md)

### ROADMAP

点击查看 [ROADMAP](ROADMAP.md)

### 0.OVERVIEW
> yf-fpm-server是一款轻量级的api服务端，可通过插件集成数据库(mysql,mongodb)的数据操作，灵活扩展自定义业务逻辑

* 源码地址: https://github.com/team4yf/yf-fpm-server.git
* 微内核，源码
* 基于koa2框架
* 支持key + secret安全验证
* 支持接口权限验证
* 支持hook钩子扩展
* 支持接口多版本同时在线

#### 设计概要

##### 　背景
> 团队的产品从单平台，慢慢扩展到多个客户端，且有多个异构系统的数据交互，所以需要一个统一的数据输入输出口。

- Node 作为一个事件驱动的V8服务端语言，非常适合处理高并发，非事务密集型的场景。
- 使用koa2作为http框架，因为它够轻，够简洁，几乎没有学习成本，而且体积小，自然坑也少 [偷笑]。
- 没有使用restful风格，因为业务需要对数据有权限限制，而且业务交集很多，对路由的管理成本就大。
- 采用taobao和jd的开放平台的设计方案，定义统一的入口，通过参数定位业务接口，实现灵活的业务开发。

##### 　定义

　　　　服务只有一个入口 **/api** ; 只接受application/json方式的请求,定义如下

* 传入参数结构

| 参数名 | 类型 | 是否必须 | 参数说明 | 默认值 | 示例 |
|:-------:|:-------:|:-----:|:-----:|:-----:|:-----:|
| method | String | Y | 需要调用的业务函数 | 无 | |
| appkey | String | Y | 应用被分配的密钥 | 无 | |
| timestamp | Number | Y | 应用端的时间戳，用于验证请求的时效性 | 无 | 13位时间戳 |
| v | String | N | 调用的服务端接口的版本号 | 无 | |
| param | Object | N | 业务函数需要用到的参数，以JsonObject的形式传入 | 无 | |
| sign | String | Y | 将接口参数进行升序排列，如 appkey,method,param,timestamp添加一个masterKey=xxx[此处的key来自于注册的key] 组合成appkey=123&masterKey=xxx&param=44444&tmiestamp=140932932932[所有的参数值使用urlencode] 过md5加密，生成一个32位的密钥 | 无 | |

* 输出参数结构

| 参数名 | 类型 | 是否必须 | 参数说明 |
|:-------:|:-------:|:-----:|:-----:|
| errno | Number | Y | 业务函数的错误代码，通常为0，表示正常执行，<0 则表示执行错误，可通过应用说明获取到具体的错误原因。|
| message | String | N | 通常在执行出错的情况下，会输出错误的信息。 |
| timestamp | Number | N | 返回服务端处理完信息之后的时间戳。 |
| data | Object/Array	 | Y |  一般的查询类的业务函数，会在该字段下携带查询结果信息；具体是Object类型还是Array类型则根据不同的业务函数的说明而定。 |
| error | Object | N | 	错误信息的详细内容 |

　　这样的设计不能满足现在的restful范式，但是能满足小规模团队的需求，可提高业务实现的开发效率；

### 1.Install
`
$ npm install yf-fpm-server --save
`

### 2.Code
`
$ vi app.js
`
```javascript
'use strict';
import { Fpm }  from 'yf-fpm-server'
let app = new Fpm()
let biz = app.createBiz('0.0.1')
biz.addSubModules('test', {
  foo: async (args, ctx, before) => {
    return Promise.reject({errno: -3001})
  }
})
app.addBizModules(biz)
app.run()
  .then(() => {
    app.logger.info('ready ...')
  })
```
### 3.Run It
`
$ node app.js
`

### 4.Global Error Define

#### System 系统错误定义

| 异常编号 | 异常代码 | 异常信息 | 排查办法 |
|:-------:|:-------:|:-----:|:-----:|
| -900 | LOST_PARAM | param: [${col}] required! | 检查接口传入的参数 |
| -901 | NO_POST_DATA | post data is empty! | 接口未传入参数 |
| -902 | TIMEZONE_OVER | your time zone not sync the server! | 传入参数中的时间戳与服务器的事件戳相差超过了30分钟 |
| -903 | SIGN_ERROR | param sign error! | 参数签名错误，请检查参数拼接过程是否异常 |
| -904 | PLUGIN_LOAD_ERROR | missing plugin ! plugin: ${ pname } dependent plugin: ${ dname } | 某个插件缺失了另外一个插件的依赖 |
| -905 | PARAM_IS_NOT_JSON | Param is not json! | 参数Param不是一个正确的json格式 |
| -906 | SQL_INJECTION | you have sql keyword! ex:['drop ','delete ','truncate ',';','insert ','update ','set ','use '] | 传入的参数可能有sql注入 |
| -907 | NOT_LATEST | Not the latest version | 不是最新的版本，请及时更新 |
| -908 | NOT_METHOD | Cant find the method! | 调用的业务函数没有定义 |
| -909 | BIZ_MODULE_EXTEND_ERROR | Biz Version ${version} Not Exists! | 扩展业务的接口版本不存在 |
| -910 | TABLE_REQUIRED | table required! | 使用 DB 插件时，需要传入 table 参数 |
| -911 | VERSION_UNDEFINED | version not defined! | 调用的业务函数版本不存在 |
| -912 | AUTH_ERROR | auth error! plz check your appkey ~ ' | 客户端的appkey未授权 |
| -913 | ROOT_ERROR | auth error! plz check roots of your app  ~  | 客户端的appkey权限不够 |
| -914 | UNCAUGHT_ERROR | System uncaughtException | 系统异常 |