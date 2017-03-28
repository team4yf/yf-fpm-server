import Router from 'koa-router'
import multer from 'koa-multer'
import fs from 'fs'
import E from '../error.js'

function fileFilter (req, file, cb) {
  // console.log(file)
  cb(null, 1)
}
const upload = multer({ dest: 'uploads/' , fileFilter: fileFilter});
const router = Router()

let copy = (src, dst) => {
  return new Promise( (resolve, reject) => {
    try{
      let data = fs.readFileSync(src)
      let result = fs.writeFileSync(dst, data)
      resolve(result)
    }catch(err){
      reject(err)
    }
  })
}

router.post('/upload', upload.single('file'), async (ctx, next) => {
  // TODO: add fpm upload hook
  await ctx.success({data: ctx.req.file})
  await next()
})

router.get('/upload/:id', async (ctx, next) => {
  ctx.body = fs.readFileSync('uploads/.gitkeep')
  // await ctx.response.attachment(['uploads/.getkeep'])
})

export default router
