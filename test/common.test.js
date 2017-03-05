var expect = require('chai').expect;
var _ = require('lodash');
describe('Common Test', function() {

  describe('#Method Reg Test()', function () {
    it('Match a method with order.*', function (done) {
        var root = '^' + 'order.*' + '$';
        var method1 = 'order.add.dd';
        var method2 = 'order.move';
        var method3 = 'app.move';
        var method4 = 'app.hh';
        var method5 = 'app.dd';
        var method6 = 'app.ff';
        var reg = new RegExp(root);
        expect(reg.test(method1)).to.equal(true);
        expect(reg.test(method2)).to.equal(true);
        expect(reg.test(method3)).to.equal(false);
        expect(reg.test(method4)).to.equal(false);
        expect(reg.test(method5)).to.equal(false);
        expect(reg.test(method6)).to.equal(false);
        done()
    });

    it('Match a method with app.*', function (done) {
        var root = '^' + 'app.*' + '$';
        var method1 = 'order.add.dd';
        var method2 = 'order.move';
        var method3 = 'app.move';
        var method4 = 'app.hh';
        var method5 = 'app.dd';
        var method6 = 'app.ff';
        var reg = new RegExp(root);
        expect(reg.test(method1)).to.equal(false);
        expect(reg.test(method2)).to.equal(false);
        expect(reg.test(method3)).to.equal(true);
        expect(reg.test(method4)).to.equal(true);
        expect(reg.test(method5)).to.equal(true);
        expect(reg.test(method6)).to.equal(true);
        done()
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
        expect(reg.test(method1)).to.equal(true);
        expect(reg.test(method2)).to.equal(true);
        expect(reg.test(method3)).to.equal(true);
        expect(reg.test(method4)).to.equal(true);
        expect(reg.test(method5)).to.equal(true);
        expect(reg.test(method6)).to.equal(true);
        done()
    });
  });
});