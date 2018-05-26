import _ from 'lodash'
import E from '../error'

export { E }
export default class {
  constructor(err){
    let _error = undefined
    if(_.isString(err)){
      _error = {}
      this._error.errno = err
    }else if(_.isObject(err)){
      _error = _.assign(E.System.UNDEFINED_EXCEPTION, err)
    }
    this._error = _error
  }

  getCode(){
    return this._error.code
  }
  getErrno(){
    return this._error.errno
  }
  getMessage(){
    return this._error.message
  }

  setCode(code){
    this._error.code = code
    return this
  }
  setErrno(errno){
    this._error.errno = errno
    return this
  }
  setMessage(message){
    this._error.message = message
    return this
  }

  toString(){
    return JSON.stringify(this._error)
  }

  printStack(){
    console.log(this._error)
  }
}