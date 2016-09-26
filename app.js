import yfServer from './bin/app.js';

global.__env = 'DEV';
let app = new yfServer();
app.setBizModules({
	'0.0.1': {
		test: function(args){
			console.log(args);
			return new Promise( (resolve, reject) => {
				reject({errno: -100001});
			})
		}
	}
});
const httpPort = 9999;
app.run(httpPort);
