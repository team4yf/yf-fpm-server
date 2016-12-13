import { Fpm, Hook,Biz }  from './bin/app.js';

//加载配置信息的中间件，默认通过编码中的代码信息加载
import configuration from './middleware/defaultConfig.js';


global.__env = 'DEV';
let app = new Fpm();

app.use(configuration);

//*
let biz = new Biz('0.0.1');

biz.addSubModules('test',{
	foo:async function(args){
		return new Promise( (resolve, reject) => {
			reject({errno: -3001});
		});
	}
})

app.addBizModules(biz);

const httpPort = 9999;
app.run(httpPort);
