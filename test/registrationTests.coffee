aonyx = require '../lib/aonyx'
require 'should'

class TestClass
  constructor: (@myObject) ->
    console.log @myObject

describe 'Registration Tests', ->
  beforeEach -> aonyx.empty()

  it 'Should register an object as a service', ->
    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.has('MyObject').should.equal yes
    aonyx.get('MyObject').should.eql { foo: 'bar' }

  it 'Should register a function as a service', ->
    fnc = ->

    aonyx.register 'MyFunction', fnc
    aonyx.has('MyFunction').should.equal yes
    aonyx.get('MyFunction').toString().should.equal fnc.toString()

  it 'Should register a class as a service', ->
    aonyx.register 'MyClass', TestClass
    aonyx.has('MyClass').should.equal yes

  it 'Should remove a registered service', ->
    aonyx.register 'MyObject', { foo: 'bar' }
    aonyx.has('MyObject').should.equal yes
    aonyx.remove('MyObject')
    aonyx.has('MyObject').should.equal no

  it 'Should not register a service with identical name', ->
    aonyx.register('MyThrow', {})
    (->
      aonyx.register('MyThrow', {})
    ).should.throw "A service with the name 'MyThrow' already exists!"

  it 'Should not register a service without an object or function', ->
    (->
      aonyx.register('MyThrow')
    ).should.throw "You can only register an object or a function with aonyx!"