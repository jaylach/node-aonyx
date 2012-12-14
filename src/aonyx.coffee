_ = require 'underscore'

#
#   Fields
#

PARAM_REGEX = /function.*(\((.*)\))/

_services = {}


#
#   Helpers
#

_formatName = (name) ->
  name = name.replace(/\s+/g, '')
  name = "#{name.charAt(0).toLowerCase()}#{name.substr(1)}"

_serviceFor = (name, resolver) ->
  service = null
  formattedName = _formatName(name)

  if not _serviceExists(formattedName) and typeof(resolver) is 'function'
    service = resolver(name)
    return service
  else if not _serviceExists(formattedName)
    return null

  # TODO: Allow services to also support injection
  service = _services[formattedName]

  return service

_mergeArguments = (services, args) ->
  newServices = []
  for v, k in services
    newServices[k] = v
    if not v?
      if args.length > 0
        newServices[k] = args.shift()

  newServices = newServices.concat(args) if args.length > 0
  return newServices

#
#   Functions
#

# Determines if a service with the formatted name already exists
_serviceExists = (name) ->
  name = _formatName name

  name of _services

# Removes a service with the formatted name
_removeService = (name) ->
  name = _formatName name
  if _serviceExists(name)
    _services[name] = null
    delete _services[name]

# Removes all services from aonyx
_emptyServices = ->
  for key of _services
    _services[key] = null
    delete _services[key]

  _services = {}

# Returns the services registered with the formatted name
_getService = (name) ->
  name = _formatName name
  return null if not _serviceExists(name)

  _services[name]

# Registers a service with aonyx
_registerService = (name, service) ->
  formattedName = _formatName name
  if _serviceExists(formattedName)
    throw new Error "A service with the name '#{name}' already exists!"

  if not _.isObject(service) and not _.isFunction(service)
    throw new Error "You can only register an object or a function with aonyx!"

  _services[formattedName] = service

# Simply gets the list of parameter names from the method. These names
# will be used to determine which services should be injected into the function
_getParamList = (method) ->
  methodString = null
  if typeof(method) is 'string'
    methodString = method
  else if typeof(method) is 'function'
    methodString = method.toString()

  params = []
  return params if not methodString?
  return params if not PARAM_REGEX.test(methodString)

  match = PARAM_REGEX.exec methodString
  return params if not match? or match.length is 0

  params = match[2].split(/\s*,\s*/)

# Gets an array of services that should be injected into the function.
# These services are in the proper order (based on the parameter list
# of the function. This DOES NOT execute the function. It will, however
# merge the service list array with any other arguments that are specified.
#
# A note about merging arguments:
# When aonyx builds the service list it will put null in place for services
# that are not found. These nulls will be replaced with values in our args param.
# This means that if our call to _argumentsFor returns the following array
#
#   [ { foo: 'bar' }, null, function() { ... }, null ]
#
# And our args param looks like this
#
#   [ true, { some: 'other object' } ]
#
# The finally array that will be passed to Function.apply will look like this
#
#   [ { foo: 'bar' }, true, function() { ... }, { some: 'other object' } ]
_argumentsFor = (method, args..., resolve=null) ->
  args = args[0] if _.isArray(args[0])
  params = _getParamList(method)
  argList = []

  for key in params
    argList.push _serviceFor(key, resolve)

  argList = _mergeArguments argList, args

  return argList

# This method is responsible for actually injecting the services into
# the specified function. It will figure out the services to inject and
# merge that array with any other arguments specified and then call our
# method with the specified scope.
_injectServices = (method, args...) ->
  injector = ->
    serviceList = _argumentsFor.call injector, method, args, injector.resolve
    method.apply this, serviceList
  injector.resolver = (resolve) ->
    injector.resolve = resolve

  return injector

#
#   Exports
#
Aonyx =
  # Properties
  version: '0.1.0'
  # Private functions, available mainly for tests
  __mergeArguments: _mergeArguments
  # Public Functions
  register: _registerService
  inject: _injectServices
  arguments: _argumentsFor
  params: _getParamList
  has: _serviceExists
  get: _getService
  remove: _removeService
  empty: _emptyServices

module.exports = Aonyx