{print} = require 'util'
{spawn, exec} = require 'child_process'

test = (callback) ->
  options = ['--compilers coffee:coffee-script', '-R spec', '--slow 20']
  mocha = spawn 'mocha.cmd', options, cwd: 'node_modules/.bin'

  mocha.stdout.on 'data', (data) -> console.log data.toString()
  mocha.stderr.on 'data', (data) -> console.log data.toString()
  mocha.on 'exit', (status) -> callback?() if status is 0

build = (watch, callback) ->
  if typeof watch is 'function'
    callback = watch
    watch = false
  options = ['-c', '-o', 'lib', 'src']
  options.unshift '-w' if watch

  coffee = spawn 'coffee.cmd', options
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

task 'build', 'Compile CoffeeScript source files', ->
  build()

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  build true

task 'test', 'Run aonyx tests', ->
  test()
