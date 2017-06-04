/* eslint-disable no-undef */

const Writable = require('stream').Writable
const repl = require('repl')
const npath = require('path')
const fs = require('fs')
const assert = require('assert')
const sinon = require('sinon')

const examples = require('../index')

const path = npath.join(__dirname, 'fixture')

describe('node-examples', function() {
    let out
    beforeEach(() => {
        out = new Writable({ write() {} })
        sinon.spy(out, 'write')
    })

    afterEach(() => {
        delete example_a
        delete example_b
        delete example_c
    })

    describe('when run with default parameters', () => {
        beforeEach(() => {
            examples({ path, out })
            this.resultA = example_a
            this.resultB = example_b
            this.resultC = example_c
            this.moduleContents = out.write.secondCall.args[0]
        })

        it('then it adds to the global context', () => {
            assert.equal(this.resultA, 'test123', 'loads up the first example')
        })

        it('and works for function returns', () => {
            assert.equal(this.resultB(123), 246, 'loads up the second example')
        })

        it('and works for function returns', () => {
            this.resultC.key = 'value'
            assert.equal(example_c.key, 'value', 'loads the same module instance')
        })

        it('and it writes a pagebreak', () => {
            assert.equal(out.write.firstCall.args[0], '\x1B[2J')
        })

        it('and it writes the contents of the module', () => {
            assert(/test123/.test(this.moduleContents), 'contains output text from module')
        })

        it('with line numbers', () => {
            assert(/1\:/.test(this.moduleContents), 'contains linenumbers')
        })
    })

    describe('when run without clear and without linenos', () => {
        beforeEach(() => {
            examples({ path, out, linenos: false, clear: false })
            this.result = example_a
            this.moduleContents = out.write.firstCall.args[0]
        })

        it('it writes the contents of the module', () => {
            assert(/test123/.test(this.moduleContents), 'contains output text from module')
        })

        it('without line numbers', () => {
            assert.equal(/1\:/.test(this.moduleContents), false, 'contains linenumbers')
        })
    })

    describe('when given another context', () => {
        beforeEach(() => {
            this.context = {}
            examples({ path, out, context: this.context })
        })

        it('then it does NOT add it to the global context', () => {
            assert.equal(global.example_a, undefined, 'added to global')
        })

        it('then it does add it to the given context', () => {
            assert.equal(this.context.example_a, 'test123', 'added to context')
        })
    })

    describe('when a REPL is running', () => {
        beforeEach(() => {
            this.replServer = repl.start({ prompt: '' })
            examples({ path, out })
        })

        afterEach(() => {
            this.replServer.close()
            delete repl.repl // required to get around node memoizing repl context
        })

        it('then it does NOT add it using the default prefix', () => {
            assert.equal(global.example_a, undefined)
        })

        it('and it does add it to the REPL context', () => {
            assert.equal(this.replServer.context.example_a, 'test123')
        })
    })

    describe('when given a prefix', () => {
        beforeEach(() => {
            examples({ path, out, prefix: 'some_' })
        })

        afterEach(() => {
            delete some_a
            delete some_b
            delete some_c
        })

        it('then it does add it to the global context using the given prefix', () => {
            assert.equal(global.some_a, 'test123')
        })

        it('and it does NOT add it using the default prefix', () => {
            assert.equal(global.example_a, undefined)
        })
    })

    describe('when a new file is created', () => {
        const filepath = npath.join(path, 'd.js')

        beforeEach(() => {
            fs.writeFileSync(filepath, 'module.exports = 565')
        })

        afterEach(() => {
            delete example_d
            fs.unlinkSync(filepath)
        })

        // NOTE: This section breaks under sucessive `mocha watch` as example_d isn't
        // being properly removed from the global scope. (TODO)
        describe('and the examples are loaded with defaults', () => {
            beforeEach(() => {
                examples({ path, out })
            })

            it('then it is loaded', () => {
                assert.equal(example_d, 565)
            })

            describe('when the file changes', () => {
                beforeEach(() => {
                    fs.writeFileSync(filepath, 'module.exports = 101')
                })

                it('then the same cached result is returned', () => {
                    assert.equal(example_d, 565)
                })
            })
        })

        describe('and the examples are loaded with cache = false', () => {
            beforeEach(() => {
                examples({ path, out, cache: false })
            })

            it('then it is loaded', () => {
                assert.equal(example_d, 565)
            })

            describe('when the file changes', () => {
                beforeEach(() => {
                    fs.writeFileSync(filepath, 'module.exports = 101')
                })

                it('then the result is unchanged', () => {
                    assert.equal(example_d, 101)
                })
            })
        })
    })
})
