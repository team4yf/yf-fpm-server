const assert = require('assert');
var _ = require('lodash');
describe('Common Test', () => {

  describe('#Method Reg Test()',  () => {
    it('Match a method with order.*', async () => {
        var root = '^' + 'order.*' + '$';
        var method1 = 'order.add.dd';
        var method2 = 'order.move';
        var method3 = 'app.move';
        var method4 = 'app.hh';
        var method5 = 'app.dd';
        var method6 = 'app.ff';
        var reg = new RegExp(root);
        assert(reg.test(method1))
        assert(reg.test(method2))

        assert(!reg.test(method3))
        assert(!reg.test(method4))
        assert(!reg.test(method5))
        assert(!reg.test(method6))
    });

    it('Match a method with app.*', async () => {
        var root = '^' + 'app.*' + '$';
        var method1 = 'order.add.dd';
        var method2 = 'order.move';
        var method3 = 'app.move';
        var method4 = 'app.hh';
        var method5 = 'app.dd';
        var method6 = 'app.ff';
        var reg = new RegExp(root);
        assert(!reg.test(method1))
        assert(!reg.test(method2))

        assert(reg.test(method3))
        assert(reg.test(method4))
        assert(reg.test(method5))
        assert(reg.test(method6))
    });

    it('Match a method with (app|order).*', function (done) {
        var root = '^' + '(app|order).*' + '$';
        var method1 = 'order.add.dd';
        var method2 = 'order.move';
        var method3 = 'app.move';
        var method4 = 'app.hh';
        var method5 = 'app.dd';
        var method6 = 'app.ff';
        var reg = new RegExp(root);
        assert(reg.test(method1))
        assert(reg.test(method2))

        assert(reg.test(method3))
        assert(reg.test(method4))
        assert(reg.test(method5))
        assert(reg.test(method6))
    });
  });
});