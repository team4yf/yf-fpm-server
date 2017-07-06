var Fpm = require('../').Fpm;
var Biz = require('../').Biz;

var app = new Fpm();
var biz = new Biz('0.0.1');
biz.addSubModules('test', {
	foo: async function(args){
		return new Promise( (resolve, reject) => {
			reject({errno: -3001});
		});
	}
})
app.addBizModules(biz);
app.run();
