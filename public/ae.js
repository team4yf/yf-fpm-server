"use strict";
/**
 * version:2.0.0
 * author:yfsoftcom
 * date:2016-07-17
 */
(function() {
    var E = {
        Object:{
            CREATE_ERROR:{errno:-1,code:'CREATE_ERROR',message:'create function should be called by a new object'},
            SAVE_ERROR:{errno:-2,code:'SAVE_ERROR',message:'save function should be called behind get or create'},
            REMOVE_ERROR:{errno:-3,code:'REMOVE_ERROR',message:'remove function should be called behind get or create'},
            OBJECT_ID_NOT_FIND:{errno:-4,code:'OBJECT_ID_NOT_FIND',message:'Object does not find by id or more rows'},
        },
        Hook:{
          BEFORE_HOOK_REJECT:{errno:-301,code:'BEFORE_HOOK_REJECT',message:'before hook reject'},
          AFTER_HOOK_REJECT:{errno:-302,code:'AFTER_HOOK_REJECT',message:'after hook reject'},
          UNCATCH_HOOK_REJECT:{errno:-303,code:'UNCATCH_HOOK_REJECT',message:'uncatch exception:'}
        }
    };

    function signParams (args){
        var ks = [];
        for(var k in args){
            ks.push(k);
        }
        ks = ks.sort();
        var strArgs = [];
        ks.forEach(function(item){
            var val = args[item];
            if(_.isObject(val)){
                val = JSON.stringify(val);
            }
            strArgs.push(item+'='+encodeURIComponent(val));
        });
        var content = strArgs.join('&');
        var d = md5(content);
        return d;

    }
    angular.module('ngApi', []).factory('$ae', ['$q','$http', function ($q,$http) {
        var _options = {
            mode:'DEV',
            appkey:'',
            masterKey:'',
            v:'0.0.1',
            endpoint:'http://localhost:8080/api'
        };
        var endpoint = _options.endpoint;

        var _beforeHook,_afterHook;

        var _exec = function(action,args){
          var deferred = $q.defer();
          //执行前置钩子
          if(_beforeHook !== undefined){
            if(_.isFunction(_beforeHook)){
              try{
                //被钩子拦截
                if(! _beforeHook({action:action,args:args})){
                  deferred.reject(E.Hook.BEFORE_HOOK_REJECT);
                  return deferred.promise;
                }
              }catch(e){
                //钩子执行错误，执行拦截
                var error = _.clone(E.Hook.UNCATCH_HOOK_REJECT);
                error.message = error.message + (e);
                deferred.reject(error);
                return deferred.promise;
              }
            }
          }

          delete args.scope;
          //这里如果 action 传入的是object 带有版本号，则需要进行转换
          var v = _options.v;
          if(_.isObject(action)){
            v = action.v || v;
            action = action.action;
          }else if(_.isString(action)){
            var pos = action.indexOf('@');
            if(pos > 1){
              v = action.substr(pos + 1);
              action = action.substr(0,pos);
            }
          }
          var arr = {
            method: action,
            appkey: _options.appkey,
            masterKey: _options.masterKey,
            timestamp: _.now(),
            param: JSON.stringify(args),
            v: v
          };
          var sign = signParams(arr);
          arr.sign = sign;
          delete arr.masterKey;

          function afterCallback(result){
            if(_afterHook !== undefined){
              if(_.isFunction(_afterHook)){
                try{
                  _afterHook({action:action,args:args,result:result});
                }catch(e){
                  _afterHook({action:action,args:args,result:result,error:e});
                }
              }
            }
          }
          $http({
            url: endpoint,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8'
            },
            data: arr
          })
            .then(function(rsp){
                return rsp.data;
            })
            .then(function(data){
              if(data.errno === 0){
                  deferred.resolve(data.data);
              }else{
                  deferred.reject(data);
              }
              afterCallback(data);
            })
            .catch(function(err){
                deferred.reject(err);
                afterCallback(err);
            });

          return deferred.promise;
        };

        var _Object = function(t,d){
            if(!_.isString(t)){
                throw new Error('Object Class should be String');
            }
            this._t = t;
            this._d = d||{};
            this.objectId = this._d.id||undefined;
        };

        _Object.prototype.toJson = function(){
            return this._d;
        };

        _Object.prototype.print = function(){
            console.log("id="+this.objectId);
            console.log("createAt="+this._d.createAt);
            console.log("updateAt="+this._d.updateAt);
            console.log("data="+JSON.stringify(this._d));
        };

        _Object.prototype.set = function(k,v){
            //直接传递了对象
            if(_.isObject(k)){
                this._d = _.extend(this._d,k);
            }else{
                this._d[k] = v;
            }
            return this;
        };

        /**
         * 获取参数
         * @param k 键值
         * @returns {*}
         */
        _Object.prototype.get = function(k){
            if(k){
                return this._d[k];
            }
            return this._d;
        };

        _Object.prototype.getById = function(id){
            var def = $q.defer();
            this.objectId = id;
            var THIS = this;
            var arg = {table:this._t,id:id};
            _exec('api.get',arg).then(function(data){
                THIS._d = data;
                def.resolve(THIS);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Object.prototype.save = function(d){
            var def = $q.defer();
            //WARING:没有objectid的不允许进行保存
            if(this.objectId === undefined){
                def.reject(E.Object.SAVE_ERROR);
                return def.promise;
            }
            if(d){
                this._d = d;
            }
            this._d.updateAt = new Date().getTime();
            var THIS = this;
            var arg = {table:this._t,condition:' id = '+this.objectId,row:this._d};
            _exec('api.update',arg).then(function(){
                def.resolve(THIS);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Object.prototype.remove = function(){
            var def = $q.defer();
            //WARING:没有objectid的不允许进行删除
            if(this.objectId === undefined){
                def.reject(E.Object.REMOVE_ERROR);
                return def.promise;
            }
            var arg = {table:this._t,id:this.objectId};
            _exec('api.remove',arg).then(function(){
                def.resolve(1);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Object.prototype.create = function(d){
            var def = $q.defer();
            //WARING:有objectid的不允许进行重复的创建
            if(this.objectId !== undefined){
                def.reject(E.Object.CREATE_ERROR);
                return def.promise;
            }
            if(d){
                this._d = d;
            }
            //生成创建时间
            this._d.updateAt = this._d.createAt = new Date().getTime();
            var THIS = this;
            var arg = {table:this._t,row:this._d};
            _exec('api.create',arg).then(function(data){
                THIS.objectId = data.insertId;
                THIS._d.id = THIS.objectId;
                def.resolve(THIS);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };



        //################Query###################

        var _Query = function(t){
            if(!_.isString(t)){
                throw new Error('Class should be String');
            }
            this._t = t;         //table
            this._s = 'id-';    //sort
            this._l = 100;       //limit
            this._k = 0;        //skip
            this._c = ' 1=1 ';  //condition
            this._f = '*';      //fields
        };

        _Query.prototype.sort = function(s){
            this._s = s;
            return this;
        };

        _Query.prototype.page = function(p,l){
            this._l = l||100;
            this._k = (p-1) * this._l;
            return this;
        };

        _Query.prototype.condition = function(c){
            this._c = c;
            return this;
        };

        _Query.prototype.and = function(a){
            this._c = this._c +' and ' + a;
            return this;
        }

        _Query.prototype.or = function(o){
            this._c = this._c +' or ' + o;
            return this;
        }

        //设定查询的字段
        _Query.prototype.select = function(f){
            //主动包含ID，createAt,updateAt
            if(_.isString(f)){
                f = f.split(',');
            }
            if(!_.contains(f,'id')){
                f.push('id');
            }
            if(!_.contains(f,'createAt')){
                f.push('createAt');
            }
            if(!_.contains(f,'updateAt')){
                f.push('updateAt');
            }
            f = f.join(',');
            this._f = f;
            return this;
        };

        _Query.prototype.count = function(){
            var def = $q.defer();
            var arg = {table:this._t,condition:this._c};
            _exec('api.count',arg).then(function(data){
                def.resolve(data);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Query.prototype.findAndCount = function(){
            var def = $q.defer();
            var THIS = this;
            var arg = {table:this._t,condition:this._c,sort:this._s,limit:this._l,skip:this._k,fields:this._f};
            _exec('api.findAndCount',arg).then(function(data){
                //将数据转换成列表
                //TODO:check是否没有数据
                var list = [];
                if(!_.isEmpty(data)){
                    _.each(data.rows,function(item){
                        var o = new _Object(THIS._t,item);
                        list.push(o);
                    })
                }
                data.rows = list;
                def.resolve(data);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Query.prototype.first = function(){
            var def = $q.defer();
            var THIS = this;
            var arg = {table:this._t,condition:this._c,sort:this._s,limit:this._l,skip:this._k,fields:this._f};
            _exec('api.first',arg).then(function(data){
                var o;
                //未搜索到数据的判断
                if(_.isArray(data)){
                    if(data.length === 0){
                        //nodata
                        o = new _Object(THIS._t);
                        def.resolve(o);
                    }
                }else if(_.isObject(data)){
                    //找到了数据
                    o = new _Object(THIS._t,data);
                    def.resolve(o);
                }

            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Query.prototype.find = function(){
            var def = $q.defer();
            var THIS = this;
            var arg = {table:this._t,condition:this._c,sort:this._s,limit:this._l,skip:this._k,fields:this._f};
            _exec('api.find',arg).then(function(data){
                //将数据转换成列表
                var list = [];
                if(!_.isEmpty(data)){
                    _.each(data,function(item){
                        var o = new _Object(THIS._t,item);
                        list.push(o);
                    })
                }
                def.resolve(list);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        _Query.prototype.clear = function(){
            var def = $q.defer();
            var arg = {table:this._t,condition:this._c};
            _exec('api.clear',arg).then(function(data){
                def.resolve(data);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        var _Function = function(f){
            this._f = f;
        };

        _Function.prototype.invoke = function(args){
            var def = $q.defer();
            _exec(this._f,args).then(function(data){
                def.resolve(data);
            }).catch(function(err){
                def.reject(err);
            });
            return def.promise;
        };

        return {
            init: function (options) {
                options = options || {};
                for(var k in options){
                    _options[k] = options[k];
                }
                endpoint = _options.endpoint;
            },
            beforeHook: function(cb){
              _beforeHook = cb;
            },
            afterHook: function(cb){
              _afterHook = cb;
            },
            Object:_Object,

            Query:_Query,

            Function:_Function


        };
    }]);

})();
