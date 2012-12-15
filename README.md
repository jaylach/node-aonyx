overview
--------
_aonyx is in beta state. There are still more features I wish to add and some refactoring that needs to be done._

aonyx is a very simple, very small dependency manager/injector for node. It does *NOT* provide require-like functionality, instead it is designed to give developers a means of injecting
"services" into functions based on their parameter names. This is not unlike what [AngularJS](http://angularjs.org) provides.

installation
------------
    npm install aonyx

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

    aonyx.inject(myFunction)('Yolo!')

It doesn't even matter what order your parameters are in, aonyx will just put them all together for you correctly... well, kind of :) There is more information about how aonyx merges service injections and argument lists.

Now, what happens if you want to be able to resolve a service at resolution time? When might this be handy? Let's say you want to be able to inject the current http response object into a method.
You can't just register a service that returns the response object as the response is different for each request. Ideally you'd be able to resolve a request for service at the time it's requested,
right when you have the response object handy. Luckily for us, aonyx provides a way to do this. Take the following example...

    # In some file, somewhere...
    module.exports =
        myRouteHandler: ($response) ->
            $response.send 'Hello there!'

    # In our server.coffee file...
    aonyx = require 'aonyx'
    routeHandler = require 'some/file/somewhere'

    app.get '/my/route', (request, response, next) ->
        injector = aonyx.inject(routeHandler.myRouteHandler)
        injector.resolver (service) ->
            # NOTE: In order for service and argument merging to work, you must return
            # null from your resolver if you can't resolve the requested service.
            return null if service isnt '$response'
            return response
        injector()

What's happening here is we are first creating our injector for our route handler method. We are then defining a resolver method which will be called when aonyx finds a parameter
for which it can't resolve. In our resolver method we're saying "If you're asking for a $response service, take this response object.. if not, return null". You need to always return
null from your resolver if you can't resolve the requested service. This makes it so aonyx can continue to properly merge our service resolutions with our arguments.

Simple, yeah?

##### A note about merging service injections and arguments
When aonyx builds the service list that will be injected into a function, it will put null in place for services that are not found. These nulls will be replaced with values from
our passed in arguments. In a hypothetical situation, aonyx may return the following service-injected array, where the second and fourth parameters couldn't be matched with a registered service...

    [ { foo: 'bar' }, null, function() { ... }, null ]

And the arguments passed to our inject method look something like this

    [ true, { some: 'other object' } ]

The final array, which will be passed to our "injectee", would look something like this...

    # Notice the nulls were replaced by the values of the arguments supplied to aonyx.
    [ { foo: 'bar' }, true, function() { ... }, { some: 'other object' } ]

faqs
----

*Why aonyx? Doesn't node already provide a dependency management system (require)?*
> It sure does, and it's awesome. It does what it does really really well. With that said, aonyx was really designed for a different purpose. Aonyx's strength really comes from
being able to provide module developers a way to give their users the ability to specificy exactly what they need at a given point, rather than giving them everything and then leaving
it up to the consuming code to figure out what it wants and doesn't want.


*Well, couldn't I just provide all the "services" as callback arguments?*
> You sure could. In fact, that's the way most modules work. However while working on another project of mine, (otter)[https://github.com/jaylach/node-otter], I found I had a need
to allow my module users the ability request which services they wanted rather than just giving them everything as an argument list. There were a lot of different services callbacks
could want and methods with long parameter lists are kind of ugly. So, aonyx was born.

*Can I use aonyx in my non-module application?*
> Sure but it's probably not needed. In most cases you'll find that the tools node gives you out of the box do everything you need, and more.

license
-------
©2012 Jason LaChapelle and available under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom
the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
