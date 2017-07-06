'use strict';
import { Fpm, Hook,Biz }  from '../src/bin/app'
let app = new Fpm()
let biz = new Biz('0.0.1')
biz.addSubModules('test', {
  foo: async function(args){
    return new Promise( (resolve, reject) => {
      reject({errno: -3001});
	})
  }
})
app.addBizModules(biz)
app.run()