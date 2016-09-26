module.exports = {
    server:{
        port: 8080
    },
    defaultVersion:'0.0.1',
    dev: 'DEV',
    log4js: {
        appenders: [
            { type: 'console' },{
                type: 'file',
                filename: 'logs/access.log',
                maxLogSize: 1024 * 1024 * 100, //100Mb一个文件
                backups:10,
                category: 'normal'
            }
        ],
        replaceConsole: true,
        levels:{
            dateFileLog: 'debug',
            console: 'errno'
        }
    }
};
