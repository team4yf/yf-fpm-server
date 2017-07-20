import fs from 'fs'
import path from 'path'

let parseQueryString = (url) => {
  let obj = {}
  , keyvalue = []
  , key = ''
  , value = ''
  , paraString = url.split('&');
  for(let i in paraString) {
      keyvalue = paraString[i].split('=');
      key = keyvalue[0];
      value = keyvalue[1];
      value = decodeURIComponent(value);
      obj[key] = value;
  }
  return obj;
}

const deletedir = (dir) => {
  if(!fs.existsSync(path)) {
    return
  }
  let files = []
  files = fs.readdirSync(path)
  files.forEach((file, index) => {
    let curPath = path.join(path, file)
    if(fs.statSync(curPath).isDirectory()) { // recurse  
      deletedir(curPath)
    } else { // delete file  
      fs.unlinkSync(curPath)
    }
  })
  fs.rmdirSync(path)
}

export { parseQueryString, deletedir }
