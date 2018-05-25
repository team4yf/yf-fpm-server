export default {
    System: {
        LOST_PARAM: col => { 
            return {
                errno: -900,
                code: 'LOST_PARAM',
                message: `param: [${col}] required!`
            }
        },
        NO_POST_DATA: { 
            errno: -901, 
            code: 'NO_POST_DATA', 
            message: 'post data is empty!' 
        },
        TIMEZONE_OVER: { 
            errno: -902, 
            code: 'TIMEZONE_OVER', 
            message: 'your time zone not sync the server!'
        },
        SIGN_ERROR: {
            errno: -903,
            code: 'SIGN_ERROR',
            message: 'param sign error!'
        },
        PLUGIN_LOAD_ERROR: (pname, dname) =>{
            return {
                code: 'PLUGIN_LOAD_ERROR',
                errno: -904,
                message: `missing plugin ! plugin: ${ pname } dependent plugin: ${ dname }`
            }
        },
        PARAM_IS_NOT_JSON: {
            errno: -905,
            code: 'PARAM_IS_NOT_JSON',
            message: 'Param is not json!'
        },
        
        SQL_INJECTION:{
            errno: -906,
            code: 'SQL_INJECTION',
            message: `you have sql keyword! ex:['drop ','delete ','truncate ',';','insert ','update ','set ','use ']`
        },
        NOT_LATEST:{
            errno: -907,
            code: 'NOT_LATEST',
            message: 'Not the latest version'
        },
        NOT_METHOD:{
            errno: -908,
            code: 'NOT_METHOD',
            message: 'Cant find the method!'
        },
        BIZ_VERSION_NOT_FNOUND: (version) =>{
            return {
                code: 'BIZ_MODULE_EXTEND_ERROR',
                errno: -909,
                message: `Biz Version ${version} Not Exists!`
            }
        },
        TABLE_REQUIRED:{
            errno: -910,
            code: 'TABLE_REQUIRED',
            message: 'table required!'
        },
        VERSION_UNDEFINED:{
            errno: -911,
            code: 'VERSION_UNDEFINED',
            message: 'version not defined!'
        },
        //uncaught
        AUTH_ERROR:{
            errno: -912,
            code: 'AUTH_ERROR',
            message: 'auth error! plz check your appkey ~ '
        },
        ROOT_ERROR:{
            errno: -913,
            code: 'ROOT_ERROR',
            message: 'auth error! plz check roots of your app  ~ '
        },

        UNCAUGHT_ERROR:{
            errno: -999,
            code: 'UNCAUGHT_ERROR',
            message: 'uncaughtException!'
        },

    }
}
