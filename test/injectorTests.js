var aonyx = require('../lib/aonyx');
require('should');

// -----
//  TestClass
// -----
var TestClass = function testClass(myObject) {
  this.myObject = myObject;
};

// -----
//  Tests
// -----
describe('Injector Tests', function() {
  beforeEach(function() {
    aonyx.empty();
    aonyx.proto(false);
  });

  it('Should parse parameter list correctly', function() {
    var test = function(one, two) {};
    aonyx.params(test).should.eql(['one', 'two']);
  });

  it('Should get the list of arguments correctly', function() {
    var test = function(myObject) {};

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.args(test).should.eql([{ foo: 'bar' }]);
  });

  it('Should replace missing services with a null value in the argument array', function() {
    var test = function(myObject, myOtherObject) {};

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.args(test).should.eql([{ foo: 'bar' }, null]);
  });

  it('Should properly merge null services with arguments supplied', function() {
    var services = [ {}, null, {}, null, {} ]
    var args = [ true, 'foo', false, 42 ]
    var expected = [ {}, true, {}, 'foo', {}, false, 42 ]
    aonyx.__mergeArguments(services, args).should.eql(expected);

    args = [ true ]
    expected = [ {}, true, {}, null, {} ]
    aonyx.__mergeArguments(services, args).should.eql(expected);
  });

  it('Should resolve unknown service request', function() {
    var test = function(myObject, myOtherObject) {};
    var resolve = function(service) {
      return service
    };

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.args(test, resolve).should.eql([{ foo: 'bar' }, 'myOtherObject' ]);
  });

  it('Should resolve unknown service requests and merge supplied arguments', function() {
    var test = function(myObject, myOtherObject, myLastObject) {};
    var resolve = function(service) {
      var result = null
      if ( service === 'myOtherObject' ) {
        result = service;
      }

      return result
    };

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.args(test, [ 'lastObject' ], resolve).should.eql([{ foo: 'bar' }, 'myOtherObject', 'lastObject' ]);
  });

  it('Should properly inject our services', function() {
    var test = function(myObject, myFunction) {
      return { 
        obj: myObject, 
        fnc: myFunction() 
      };
    };

    var expected = {
      obj: { foo: 'bar' },
      fnc: 'baz'
    }

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.register('MyFunction', function() { return 'baz'; });

    aonyx.inject(test)().should.eql(expected);
  });

  it('Should allow injected class to be new\'d up', function() {
    var test = function(myClass) {
      var instance = aonyx.inject(myClass, true).call(myClass);
      return instance.myObject;
    };

    aonyx.register('MyClass', TestClass);
    aonyx.register('MyObject', { my: 'object' });

    var expected = {
      my: 'object'
    };

    aonyx.inject(test)().should.eql(expected);
  });

  it('Should properly resolve unknown services from injector function', function() {
    var test = function(myObject, myFunction, myResolvedParam) {
      return {
        obj: myObject, 
        fnc: myFunction(), 
        mrp: myResolvedParam
      }
    };

    var expected = {
      obj: { foo: 'bar' },
      fnc: 'baz',
      mrp: 'myResolvedParam'
    };

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.register('MyFunction', function() { return 'baz'; });

    var injector = aonyx.inject(test);
    injector.resolver(function (param) {
      return param
    });

    injector().should.eql(expected);
  });

  it('Should properly merge our services and arguments (CONTINUOUS ORDER)', function() {
    var test = function(myObject, myFunction, myParam) {
      return {
        obj: myObject, 
        fnc: myFunction(), 
        prm: myParam
      }
    };

    var expected = {
      obj: { foo: 'bar' },
      fnc: 'baz',
      prm: 'param'
    };

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.register('MyFunction', function() { return 'baz'; });

    aonyx.inject(test)('param').should.eql(expected);
  });

  it('Should properly merge our services and arguments (MIXED ORDER)', function() {
    var test = function(myObject, myParam, myFunction) {
      return {
        obj: myObject, 
        fnc: myFunction(), 
        prm: myParam
      }
    };

    var expected = {
      obj: { foo: 'bar' },
      fnc: 'baz',
      prm: 'param'
    };

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.register('MyFunction', function() { return 'baz'; });

    aonyx.inject(test)('param').should.eql(expected);
  });

  it('Should have a usable "injector" method added to Function.prototype', function() {
    var test = function(myObject, myParam, myFunction) {
      return {
        obj: myObject, 
        fnc: myFunction(), 
        prm: myParam
      }
    };

    aonyx.proto(true);

    var expected = {
      obj: { foo: 'bar' },
      fnc: 'baz',
      prm: 'param'
    };


    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.register('MyFunction', function() { return 'baz'; });

    var injector = test.injector()
    injector('param').should.eql(expected);
  });

  it('Should have a usable "inject" method added to Function.prototype', function() {
    var test = function(myObject, myParam, myFunction) {
      return {
        obj: myObject, 
        fnc: myFunction(), 
        prm: myParam
      }
    };

    aonyx.proto(true);

    var expected = {
      obj: { foo: 'bar' },
      fnc: 'baz',
      prm: 'param'
    };

    aonyx.register('MyObject', { foo: 'bar' });
    aonyx.register('MyFunction', function() { return 'baz'; });

    test.inject('param').should.eql(expected);
  });
});