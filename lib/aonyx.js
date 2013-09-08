var assert = require('assert-plus');
var esprima = require('esprima');
var _ = require('underscore');

// Constants
var AONYX_VERSION = '0.2.0';

// Aonyx()
var Aonyx = function() {
  this._services = [];
}; //- Aonyx()

// _formatServiceName()
Aonyx.prototype._formatServiceName = function _formatServiceName(name) {
  name = name.replace(/\s+/g, '');
  return name.charAt(0).toLowerCase() + name.substr(1);
}; //- _formatServiceName()

// _serviceFor()
Aonyx.prototype._serviceFor = function _serviceFor(name, resolver) {
  var formattedName = this._formatServiceName(name);

  if ( this.has(formattedName) === false && _.isFunction(resolver) ) {
    return resolver(name);
  } else if ( this.has(formattedName) === false ) {
    return null;
  }

  var service = this.get(name);
  if ( _.isFunction(service) ) {
    service = this.inject(service, true)();
  }

  return service;
}; //- _serviceFor()

// has()
Aonyx.prototype.has = function has(name) {
  name = this._formatServiceName(name);
  return this._services[name] != null;
}; //- has()

// args()
Aonyx.prototype.args = function args(method, args, resolve) {
  if (resolve == null) {
    resolve = null;
  }

  if ( _.isFunction(args) ) {
    resolve = args;
    args = [];
  };

  if ( args == null ) {
    args = [];
  }

  var params = this.params(method);
  var argList = [];

  var len;
  for ( var j = 0, len = params.length; j < len; j++ ) {
    var key = params[j];
    argList.push(this._serviceFor(key, resolve));
  }

  argList = this._mergeArguments(argList, args);
  return argList;
}; //- args();

// _mergeArguments()
Aonyx.prototype._mergeArguments = function _mergeArguments(serviceList, args) {
  var newServices = [];

  var len;
  for ( var k = 0, len = serviceList.length; k < len; k++ ) {
    var v = serviceList[k];
    newServices[k] = v;

    if ( v == null ) {
      if ( args.length > 0 ) {
        newServices[k] = args.shift();
      }
    }
  }

  if ( args.length > 0 ) {
    newServices = newServices.concat(args);
  }

  return newServices;
}; //- _mergeArguments() 

// get()
Aonyx.prototype.get = function get(name) {
  name = this._formatServiceName(name);
  return this._services[name];
}; //- get()

// empty()
Aonyx.prototype.empty = function empty() {
  for ( var key in this._services ) {
    this._services[key] = null;
    delete this._services[key];
  }

  this._services = {};
}; //- empty()

// remove()
Aonyx.prototype.remove = function remove(name) {
  name = this._formatServiceName(name);

  if ( this.has(name) ) {
    this._services[name] = null;
    delete this._services[name];
  }
}; //- remove()

// proto()
Aonyx.prototype.proto = function proto(value) {
  var self = this;

  if ( !value ) {
    Function.prototype["injector"] = null;
    delete Function.prototype["injector"];

    Function.prototype["inject"] = null;
    delete Function.prototype["inject"];
  } 
  else {
    Function.prototype["injector"] = function() {
      return self.inject(this);
    };

    Function.prototype["inject"] = function() {
      return self.inject(this).apply(this, arguments);
    };
  }
}; //- proto()

// register()
Aonyx.prototype.register = function register(name, service, namespace) {
  assert.string(name, 'name');
  assert.ok(_.isObject(service) || _.isFunction(service), 'You can only register an object or a function with aonyx!');

  var formattedName = this._formatServiceName(name);
  if ( this.has(formattedName) ) {
    throw new Error('A service with the name "' + name + '" already exists!');
  }

  this._services[formattedName] = service;
}; //- register()

// params()
Aonyx.prototype.params = function params(func) {
  assert.func(func, 'func');

  var funcString = 'var $$aonyx__func = ' + func.toString();
  var tree = esprima.parse(funcString);
  var params = tree.body[0].declarations[0].init.params;

  var paramNames = _.pluck(params, 'name');
  return paramNames;
}; //- params();

// inject()
Aonyx.prototype.inject = function inject(func, shouldNew) {
  var self = this;

  if ( shouldNew == null ) {
    shouldNew = false;
  }

  var injector = function injector() {
    var args = _.toArray(arguments);
    var serviceList = self.args.call(self, func, args, injector.resolve);

    if ( !shouldNew ) {
      return func.apply(this, serviceList);
    }

    var newFunc = function newFunc() {
      var M = function M() {
        return self.inject(func, false).call(this);
      };
      M.prototype = func.prototype;
      return new M();
    };

    return newFunc();
  };

  injector.resolver = function resolver(resolve) {
    injector.resolve = resolve;
  };

  return injector;
}; //- inject()

// Exports
module.exports = new Aonyx();

module.exports.create = function() {
  return new Aonyx();
};

module.exports.version = AONYX_VERSION;