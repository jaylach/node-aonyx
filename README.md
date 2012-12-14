overview
--------
_aonyx is in beta state. There are still more features I wish to add and some refactoring that needs to be done._

aonyx is a very simple, very small dependency manager/injector for node. It does *NOT* provide require-like functionality, instead it is designed to give developers a means of injecting
"services" into functions based on their parameter names. This is not unlike what [AngularJS](http://angularjs.org) provides.

using otter
-----------


how it works
------------
While it's fairly straight forward, otter does do some magic for you. Most notably is a minimal "dependency injector". What
this will do is it will "inject" the request, response, and/or next params to your action (depending on what you requested).
Like AngularJS, you "request" an injection by giving your action a named param ($request, $response, or $next). Otter will
also setup automatic required and opitonal route parameters and inject those into your method, as well.

installation
------------
Because otter is still in the early alpha stages of development it has not yet been pushed to npm. this means that if you wish to use otter as it stands right now, you will need to download the source and install the module yourself. luckily, that's as easy as copying the otter folder into the node_modules folder of your project.
