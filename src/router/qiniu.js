import _ from 'lodash'
import E from '../error.js'
import qiniu from 'qiniu'

let _options = {
  isInit: false,
  bucket: 'yfsoft',
  domain: 'olk3bzfd5.bkt.clouddn.com',
  ACCESS_KEY:'65nep44MNB8Ft1v_L1f7jaSnP8P07buuMMN4kI81',
  SECRET_KEY:'kZxy-i93_B98yg4lNn7XmSujeZh_JWRxQOJX3E_m',
}


const init = (options) => {
  _options = _.assign(_options, _.assign(options, {isInit: true}))
  qiniu.conf.ACCESS_KEY = _options.ACCESS_KEY
  qiniu.conf.SECRET_KEY = _options.SECRET_KEY
}

//构建上传策略函数
const getToken = ( key ) => {
  let putPolicy = new qiniu.rs.PutPolicy(_options.bucket + ":" + key)
  let token = putPolicy.token()
  return token
}

//构造上传函数
const uploadFile = async (key, data) => {
  let uptoken = getToken(key)
  let extra = new qiniu.io.PutExtra()
  extra.mimeType = data.mimetype
  return new Promise( (rs, rj) =>{
    qiniu.io.putFile(uptoken, key, data.path, extra, (err, ret) => {
      if(err){
        rj(err)
      }else{
        if(ret.code){
          rj(ret)
        }else{
          ret.url = 'http://' + _options.domain + '/'+ ret.key
          rs(ret)
        }
      }
    })    
  })
  
}

const sync = async (data)=>{
  
  if(!_options.isInit)
    throw new Error('options not inited')
  //调用uploadFile上传
  let rst = await uploadFile(data.filename + '_' + data.originalname, data)
  return rst
}

export { init, sync } 
