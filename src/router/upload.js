import Router from 'koa-router';
import fs from 'fs';
import E from '../error.js';

const upload = Router();

let copy = (src, dst) => {
  return new Promise( (resolve, reject) => {
    try{
      let data = fs.readFileSync(src);
      let result = fs.writeFileSync(dst, data);
      resolve(result);
    }catch(err){
      reject(err);
    }
  });
};

upload.post('/upload', async (ctx, next) => {
  const f = ctx.body.files.file;
  const t = f.type;
  const n = f.name;
  const s = f.size;
  if(t!='application/zip' && t!= 'application/x-zip-compressed' && t!='application/octet-stream' && t!='application/json'){
      ctx.fail(E.System.FILE_TYPE_REJECT);
      return;
  }
  if(s > 100 * 1024 * 1024){
      ctx.fail(E.System.FILE_TOO_LARGE);
      return;
  }
  try{
    let data = await copy(f.path,'uploads/'+f.name);
    ctx.success({errno:0,data:data});
  }catch(err){
    ctx.fail(err);
  }
});

upload.get('/upload/:id', async (ctx, next) => {
  console.log('1');
  ctx.body = fs.readFileSync('uploads/.gitkeep');
  // await ctx.response.attachment(['uploads/.getkeep']);
});

export default upload;
