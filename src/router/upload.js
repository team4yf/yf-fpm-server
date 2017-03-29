import _ from 'lodash'
import Router from 'koa-router'
import multer from 'koa-multer'
import fs from 'fs'
import E from '../error.js'

const router = Router()

//将上传的信息保存在内存中
var datas = {}

// 上传的文件类型限制
const ALLOW_MIMETYPES = ['application/octet-stream', 'application/zip', 'application/x-zip-compressed']

const fileFilter = (req, file, cb) =>{
  if(_.indexOf(ALLOW_MIMETYPES, file.mimetype)> -1){
    cb(null, 1)
  }else{
    cb(E.Upload.TYPE_NOT_ALLOWD)
  }
}

const upload = multer({ dest: 'uploads/' , fileFilter: fileFilter, limits: { fileSize: 2 * 1024 * 1024 }})

// 上传表单以file为文件的字段
const defaultHandler = upload.single('file')

// 捕获异常
const handler = async (ctx, next) => {
  try{
    await defaultHandler(ctx, next)
  }catch(e){
    ctx.error = e
  }
  if(ctx.error){
    ctx.fail(ctx.error)
  }else{
    let data = ctx.req.file
    datas[data.filename] = data
    ctx.success({data: {hash: data.filename, url: '/download/' + data.filename}})
  }
}

// 上传文件的路由
router.post('/upload', handler)

// 下载文件的路由
router.get('/download/:id', async (ctx, next) => {
  let data = datas[ctx.params.id]
  ctx.type = data.mimetype
  ctx.attachment(data.originalname)
  ctx.body = await fs.createReadStream(data.path)
  await next()
})

export default router
