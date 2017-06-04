#node-examples

[![npm version](https://badge.fury.io/js/node-examples.svg)](https://badge.fury.io/js/node-examples) [![travis-ci](https://travis-ci.org/justinjmoses/node-examples.svg?branch=master)](https://travis-ci.org/justinjmoses/node-examples)

A simple tool to show and run code snippets in the node REPL. Great for talks and demos - show and run your code right in the REPL. Adds on files as named getters into the REPL context.

![](https://media.giphy.com/media/M3wLDsfYl0z7O/giphy.gif)

###Installation
Run `npm i node-examples`

###Usage

1. Start a node REPL via `node` (or programmatically via `require('repl').start`) (see https://nodejs.org/api/repl.html for more info)

2. Require node-examples `const examples = require('node-examples)`

3. Import the examples `examples({ path: 'examples' })`

4. Your example files are added as getters on the running REPL context. So `example_01_basic` will output and require the file.

![examples](https://cloud.githubusercontent.com/assets/799038/20240505/ede0ef28-a8e7-11e6-9e79-cd2173ff6794.gif)

###Configuration

**Required**
* `path` the absolute or relative path (from the current working directory) to the examples to be loaded

**Optional**
* `prefix` the prefix that shold preceed the getters in the REPL. Default `example_`
* `context` the context to load the examples into as getters. Default is current REPL context (`require('repl').repl.context`) or node `global` if no REPL found.
* `out` the writable stream to output on. Default is `process.stdout`.
* `linenos` whether or not to show linenumbers in the output. Default is `true`
* `clear` whether or not to clear the REPL before showing the output. Default is `true`
* `cache` whether or not to cache the example files rather than reloading fresh each time. Default is `true`

###Run Tests
Run via `npm test`
