overview
--------
_aonyx is in beta state. There are still more features I wish to add and some refactoring that needs to be done._

aonyx is a very simple, very small dependency manager/injector for node. It does *NOT* provide require-like functionality, instead it is designed to give developers a means of injecting
"services" into functions based on their parameter names. This is not unlike what [AngularJS](http://angularjs.org) provides.

using aonyx
-----------
Using aonyx is simple. You just need to follow a couple easy steps.

First, you need to register your service with aonyx. This is accomplished like so...

    aonyx = require 'aonyx'

    class MyService
        myMethod: (something) ->
            return something

    aonyx.register 'MyService', MyService

Great! Now we have a service registered with the name "myService" (note that aonyx uses camelCase and will transform UpperCamel into lowerCamel). This service simple, just a class with a single
method, but it serves our purpose.

Next, we have to have a function that's going to need that service. Once we have that, we need to tell aonyx to do its injection magic. Lukcily this is easier than it sounds...

    aonyx = require 'aonyx'

    myFunction = (myService) ->
        service = new myService()
        console.log service.myMethod('Hey There')

    # This creates a new injector and then immediately calls it
    aonyx.inject(myFunction)()

Simple, right? There's more you can do with aonyx, though! For instance, aonyx will merge service resolutions with regular arguments. Take this example...

    myFunction = (myService, someParam) ->
        service = new myService()
        console.log service.myMethod(someParam) # Will log "Yolo!"

    aonyx.inject(myFunction, 'Yolo!')()

It doesn't even matter what order your parameters are in, aonyx will just put them all together for you correctly... well, kind of :) Here, let's explain this a bit better...

When aonyx builds the service list it will put null in place for services that are not found. These nulls will be replaced with values from our passed in arguments. In a hypothetical situation,
aonyx may return the following service-injected array, where the second and fourth parameters couldn't be matched with a registered service...

    [ { foo: 'bar' }, null, function() { ... }, null ]

And the arguments passed to our inject method look something like this

    [ true, { some: 'other object' } ]

The final array, which will be passed to our "injectee", would look something like this...

    [ { foo: 'bar' }, true, function() { ... }, { some: 'other object' } ]

installation
------------
Because aonyx is still in the early alpha stages of development it has not yet been pushed to npm. this means that if you wish to use aonyx as it stands right now, you will need to download the source and install the module yourself. luckily, that's as easy as copying the aonyx folder into the node_modules folder of your project.
