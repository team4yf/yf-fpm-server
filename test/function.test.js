var fpmc = require("fpmc-jssdk").default;
fpmc.init({ mode: 'DEV', appkey:'123123', masterKey:'123123', endpoint: 'http://localhost:9999/api' });

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