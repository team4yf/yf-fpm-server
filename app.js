import yfServer from './bin/app.js';

import Hook from './utils/hook.js';
import Biz from './utils/biz.js';

global.__env = 'DEV';
let app = new yfServer();

let biz = new Biz('0.0.1');

biz.addSubModules('test',{
	foo:function(args){
		console.log('output from app.js');
		console.log(args);
		return new Promise( (resolve, reject) => {
			reject({errno: -3001});
		})
	}
})

app.addBizModules(biz);

let hook = new Hook();
hook.addBeforeHook('test', (args) => {
	return new Promise( (resolve, reject) => {
		console.log('run before hook from app.js');
		console.log(args);
		resolve('ok');
	});

},['0.0.1','0.0.2']);

app.addHook(hook);

const httpPort = 9999;
app.run(httpPort);
