var assert = require('assert-plus');
var esprima = require('esprima');
var _ = require('underscore');

// Constants
var AONYX_VERSION = '0.2.0';

// Fields
var services = {};

// formatServiceName()
var formatServiceName = function formatName(name) {
  name = name.replace(/\s+/g, '');
  return name.charAt(0).toLowerCase() + name.substr(1);
}; //- formatServiceName()

// serviceExists()
var serviceExists = function serviceExists(name) {
  name = formatServiceName(name);
  return services[name] != null;
}; //- serviceExists()

// serviceFor()
var serviceFor = function serviceFor(name, resolver) {
  var formattedName = formatServiceName(name);

  if ( serviceExists(formattedName) === false && _.isFunction(resolver) ) {
    return resolver(name);
  } else if ( serviceExists(formattedName) === false ) {
    return null;
  }

  return services[formattedName];
}; //- serviceFor()

// argumentsFor()
var argumentsFor = function argumentsFor(method, args, resolve) {
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

  var params = getParamList(method);
  var argList = [];

  var len;
  for ( var j = 0, len = params.length; j < len; j++ ) {
    var key = params[j];
    argList.push(serviceFor(key, resolve));
  }

  argList = mergeArguments(argList, args);
  return argList;
}; //- argumentsFor();

// mergeArguments()
var mergeArguments = function mergeArguments(serviceList, args) {
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
}; //- mergeArguments() 

// getService()
var getService = function getService(name) {
  name = formatServiceName(name);
  return services[name];
}; //- getService()

// emptyServices()
var emptyServices = function emptyServices() {
  for ( var key in services ) {
    services[key] = null;
    delete services[key];
  }

  services = {};
}; //- emptyServices()

// removeService()
var removeService = function removeService(name) {
  name = formatServiceName(name);

  if ( serviceExists(name) ) {
    services[name] = null;
    delete services[name];
  }
}; //- removeService()

// setPrototype()
var setPrototype = function setPrototype(value) {
  if ( !value ) {
    Function.prototype["injector"] = null;
    delete Function.prototype["injector"];

    Function.prototype["inject"] = null;
    delete Function.prototype["inject"];
  } 
  else {
    Function.prototype["injector"] = function() {
      return injectServices(this);
    };

    Function.prototype["inject"] = function() {
      return injectServices(this).apply(this, arguments);
    };
  }
}; //- setPrototype()

// registerService()
var registerService = function registerService(name, service) {
  assert.string(name, 'name');
  assert.ok(_.isObject(service) || _.isFunction(service), 'You can only register an object or a function with aonyx!');

  var formattedName = formatServiceName(name);
  if ( serviceExists(formattedName) ) {
    throw new Error('A service with the name "' + name + '" already exists!');
  }

  services[formattedName] = service;
}; //- registerService()

// getParamList()
var getParamList = function getParamList(func) {
  assert.func(func, 'func');

  var funcString = 'var $$aonyx__func = ' + func.toString();
  var tree = esprima.parse(funcString);
  var params = tree.body[0].declarations[0].init.params;

  var paramNames = _.pluck(params, 'name');
  return paramNames;
}; //- getParamList();

// injectServices()
var injectServices = function injectServices(func, shouldNew) {
  if ( shouldNew == null ) {
    shouldNew = false;
  }

  var injector = function injector() {
    var args = _.toArray(arguments);
    var serviceList = argumentsFor.call(injector, func, args, injector.resolve);

    if ( !shouldNew ) {
      return func.apply(this, serviceList);
    }

    var newFunc = function newFunc() {
      var M = function M() {
        return injectServices(func, false).call(this);
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
}; //- injectServices()

// Exports
module.exports = {
  // Public
  register: registerService,
  inject: injectServices,
  params: getParamList,
  args: argumentsFor,
  get: getService,
  has: serviceExists,
  remove: removeService,
  empty: emptyServices,
  proto: setPrototype,
  version: AONYX_VERSION,
  // Private
  __mergeArguments: mergeArguments
};