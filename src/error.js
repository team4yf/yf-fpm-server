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
        BIZ_VERSION_REQUIRED: {
            code: 'Biz-Version-Required',
            errno: -914,
            message: 'Biz Version Required'
        },
        HOOK_VERSION_REQUIRED: {
            errno: -915,
            code: 'Hook-Version-Required',
            message: 'hook version cant be undefined'
        },
        HOOK_HANDLER_REQUIRED: {
            errno: -916,
            code: 'Hook-Handler-Required',
            message: 'hook handler cant be undefined'
        },
        ONLY_POST_ALLOWED: {
            errno: -917,
            code: 'ONLY_POST_ALLOWED',
            message: 'only post method allowed~'
        },
        TOPIC_BEEN_PUBLISHED: {
            errno: -918,
            code: 'TOPIC_BEEN_PUBLISHED',
            message: 'topic has been published by other biz'
        },
        UNDEFINED_EXCEPTION: {
            errno: -920,
            code: 'UnDefinedException',
            message: 'UnDefinedException',
        },

        UNCAUGHT_ERROR:{
            errno: -999,
            code: 'UNCAUGHT_ERROR',
            message: 'uncaughtException!'
        },

    }
}
