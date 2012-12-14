aonyx = require '../lib/aonyx'
require 'should'

describe 'Injector Tests', ->
  beforeEach -> aonyx.empty()

  it 'Should parse parameter list correctly', ->
    test = (one, two) ->
    aonyx.params(test).should.eql ['one', 'two']

  it 'Should get the list of arguments correctly', ->
    test = (myObject) ->

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.arguments(test).should.eql [{ foo: 'bar' }]

  it 'Should replace missing services with a null value in the argument array', ->
    test = (myObject, myOtherObject) ->

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.arguments(test).should.eql [{ foo: 'bar' }, null]

  it 'Should properly merge null services with arguments supplied', ->
    services = [ {}, null, {}, null, {} ]
    args = [ true, 'foo', false, 42 ]
    expected = [ {}, true, {}, 'foo', {}, false, 42 ]
    aonyx.__mergeArguments(services, args).should.eql expected

    args = [ true ]
    expected = [ {}, true, {}, null, {} ]
    aonyx.__mergeArguments(services, args).should.eql expected

  it 'Should resolve unknown service request', ->
    test = (myObject, myOtherObject) ->
    resolve = (service) ->
      return service

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.arguments(test, resolve).should.eql [{ foo: 'bar' }, 'myOtherObject' ]

  it 'Should properly inject our services', ->
    test = (myObject, myFunction) ->
      return obj: myObject, fnc: myFunction()

    expected =
      obj: { foo: 'bar' }
      fnc: 'baz'

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.register 'MyFunction', -> return 'baz'

    aonyx.inject(test)().should.eql expected

  it 'Should properly resolve unknown services from injector function', ->
    test = (myObject, myFunction, myResolvedParam) ->
      return obj: myObject, fnc: myFunction(), mrp: myResolvedParam

    expected =
      obj: { foo: 'bar' }
      fnc: 'baz'
      mrp: 'myResolvedParam'

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.register 'MyFunction', -> return 'baz'

    injector = aonyx.inject(test)
    injector.resolver (param) ->
      return param

    injector().should.eql expected

  it 'Should properly merge our services and arguments (CONTINUOUS ORDER)', ->
    test = (myObject, myFunction, myParam) ->
      return obj: myObject, fnc: myFunction(), prm: myParam

    expected =
      obj: { foo: 'bar' }
      fnc: 'baz'
      prm: 'param'

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.register 'MyFunction', -> return 'baz'

    aonyx.inject(test, 'param')().should.eql expected

  it 'Should properly merge our services and arguments (MIXED ORDER)', ->
    test = (myObject, myParam, myFunction) ->
      return obj: myObject, fnc: myFunction(), prm: myParam

    expected =
      obj: { foo: 'bar' }
      fnc: 'baz'
      prm: 'param'

    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.register 'MyFunction', -> return 'baz'

    aonyx.inject(test, 'param')().should.eql expected