var should = require("chai").should;
var fpmc = require("yf-fpm-client-js").default;
fpmc.init({ mode: 'DEV', appkey:'123123', masterKey:'123123', domain: 'http://localhost:9999' });

describe('Function', function(){
  it('test', function(done){
    var func = new fpmc.Func('test.foo');
    func.invoke({})
      .then(function(d){
        console.log(d)
        done();
      }).catch(function(err){
        done(err);
      });
  
  })

  it('test ExtendModule', function(done){
    var func = new fpmc.Func('demo.foo');
    func.invoke({})
      .then(function(d){
        console.log(d)
        done();
      }).catch(function(err){
        done(err);
      });
  
  })
})