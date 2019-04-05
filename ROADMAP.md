## Roadmap Of yf-fpm-server

#### v3.0

- 全局
  - [ ] 使用 `nedb` 保存一些需要持久化的数据，启动时自动加载这些设置
  - [ ] 将 config 中的 apps 部分存储到 nedb 中，支持运行过程中修改这些选项
  - [ ] 自定义异常的处理
  - [ ] pino
  - [x] support https://
  - [ ] 异常通过 throw 传递到最外层，减少 Promise.reject 的调用。
  - [x] 添加 `debug` 模块
  
- 核心
  - [x] 去除Hook, Biz的export, 通过 createHook, createBiz 来创建
  - [x] 修改 auth 为 permision
  - ~添加后台页面~
    - 菜单

- 插件
  - 实现热部署
  - MockServer
  - UnitTest

- 弃用
  - 文件上传的部分
  - `chai` 模块 替换成 Nodejs 自带的 `assert` 模块
  - `Bluebird` Pormise 的部分全部使用 Node 原生的Pormise

#### v2.3

- 插件
  - 升级插件逻辑，使用注入的方式引用其他插件
  - 可快速编辑和更新接口文档的插件
  - 常用插件的实现

- 上传模块将文件保存到七牛

#### v2.2

- 权限验证
- 文件上传
- 钩子机制
- 标准输出

