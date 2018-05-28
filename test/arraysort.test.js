var expect = require('chai').expect;
var _ = require('lodash');
describe('Array Sort', function() {

    it('Sort', function (done) {
        let data = {
            c: { name: 'c', deps: [ 'd'], isBound: false, bind: function(){ console.info('run c') } },
            d: { name: 'd', deps: [ 'e'], isBound: false, bind: function(){ console.info('run d') } },
            b: { name: 'b', deps: [ 'e', 'c'], isBound: false, bind: function(){ console.info('run b') } },
            a: { name: 'a', deps: [ 'b', 'c'], isBound: false, bind: function(){ console.info('run a') } },
            f: { name: 'f', deps: [ 'a' ], isBound: false, bind: function(){ console.info('run f') } },
            e: { name: 'e', deps: [ ], isBound: false, bind: function(){ console.info('run e') } },
        }
        function rundep(d) {
            // console.log(d)
            if(d.isBound)
                return
            const len = _.size(d.deps)
            if(len < 1){
                d.bind()
                d.isBound = true
                return
            }
            
            let isReady = true
            for(let i = 0 ; i < len; i++ ){
                const dep = d.deps[i]
                if(!data[dep].isBound){
                    rundep(data[dep])
                }
            }

            d.bind()
            d.isBound = true
        }
        _.map(data, rundep)
        done()
    });
});