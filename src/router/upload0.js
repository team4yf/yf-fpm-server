import Router from 'koa-router';
import fs from 'fs';
import E from '../error.js';
import qiniu from "qiniu";

const C = {
  qiniu: {
    bucket:'yfdocument',
    ACCESS_KEY:'65nep44MNB8Ft1v_L1f7jaSnP8P07buuMMN4kI81',
    SECRET_KEY:'kZxy-i93_B98yg4lNn7XmSujeZh_JWRxQOJX3E_m'
  }
}

qiniu.conf.ACCESS_KEY = C.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = C.qiniu.SECRET_KEY;

const upload = Router();

function copy(src, dst) {
  fs.writeFileSync(dst, fs.readFileSync(src));
}

//构建上传策略函数
function uptoken( key) {
  let putPolicy = new qiniu.rs.PutPolicy(C.qiniu.bucket+":"+key);
  return putPolicy.token();
}

//构造上传函数
function uploadFile(uptoken, key, localFile) {
  let extra = new qiniu.io.PutExtra();
  return new Promise( (resolve, reject) => {
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        resolve({
            hash:ret.hash,
            key:key
        });
      }else{
        // 上传失败， 处理返回代码
        var e = E.System.QINIU_SYNC_ERROR;
        e.error = err;
        reject(e);
      }
    });
  });
}

function syncQiniu(filename,filepath){
    //生成上传 Token
    let token = uptoken( filename);
    //调用uploadFile上传
    return uploadFile(token, filename, filepath);
}


upload.post('/upload', async (ctx, next) => {
  const f = ctx.body.files.file;
  const t = f.type;
  const n = f.name;
  const s = f.size;
  if(t!='application/zip' && t!= 'application/x-zip-compressed' && t!='application/octet-stream'){
      ctx.fail(E.System.FILE_TYPE_REJECT);
      return;
  }
  if(s > 100 * 1024 * 1024){
      ctx.fail(E.System.FILE_TOO_LARGE);
      return;
  }
  //copy(f.path,'uploads/'+f.name);
  try{
    let data = await syncQiniu(n, f.path)
    ctx.success({errno:0,data:data});
  }catch(err){
    ctx.fail(err);
  }
});

export default upload;
