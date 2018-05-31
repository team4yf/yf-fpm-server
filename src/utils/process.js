import Process from 'child_process'
import fs from 'fs'

const os = process.platform
//TODO: win32
const options = {
    encoding: 'utf8',
    timeout: 0,
    maxBuffer: 200 * 1024,
    killSignal: 'SIGTERM',
    setsid: false,
    cwd: null,
    env: null
};

const doCommand = async ( command ) => {
  // 捕获标准输出并将其打印到控制台
  return new Promise((resolve, reject) => {
    Process.exec(command, options, (e, stdout, stderr) => {
      if(e){
        reject( {data: stderr })
      }else{
        resolve( {data: stdout })
      }
    })
  })
}

const execShell = async ( shellPath, params ) => {
  if(!fs.existsSync(shellPath)){
    return Promise.reject({ message: `shell script file not found ${shellPath}`})
  }
  return new Promise((resolve, reject) => {
    Process.execFile(shellPath, params || [], options, (e, stdout, stderr) => {
      if(e){
        reject( {data: stderr })
      }else{
        resolve( {data: stdout })
      }
    })
  })
}
export { doCommand, execShell }