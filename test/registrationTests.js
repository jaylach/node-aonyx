var aonyx = require('../lib/aonyx');
require('should');

// -----
//  TestClass
// -----
var TestClass = function testClass(myObject) {
  console.log(myObject);
};

// -----
//  Tests
// -----
describe('Registration Tests', function() {
  beforeEach(function() {
    aonyx.empty();
    aonyx.proto(false);
  });

  it('Should register an object as a service', function() {
    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.has('MyObject').should.equal(true);
    aonyx.get('MyObject').should.eql({ foo: 'bar' });
  });

  it('Should register a function as a service', function() {
    var fn = function() { };

    aonyx.register('MyFunction', fn);
    aonyx.has('MyFunction').should.equal(true);
    aonyx.get('MyFunction').toString().should.equal(fn.toString());
  });

  it('Should register a class as a service', function() {
    aonyx.register('MyClass', TestClass);
    aonyx.has('MyClass').should.equal(true);
  });

  it('Should remove a registered service', function() {
    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.has('MyObject').should.equal(true);
    aonyx.remove('MyObject');
    aonyx.has('MyObject').should.equal(false);
  });

  it('Should not register a service with identical name', function() {
    aonyx.register('MyThrow', {});
    (function() {
      aonyx.register('MyThrow', {})
    }).should.throw('A service with the name "MyThrow" already exists!');
  });

  it('Should not register a service without an object or function', function() {
    (function() {
      aonyx.register('MyThrow')
    }).should.throw('You can only register an object or a function with aonyx!');
  });
});