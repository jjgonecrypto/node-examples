'use strict'

const npath = require('path')
const fs = require('fs')

const repl = require('repl')

const cardinal = require('cardinal')

module.exports = ({ path, out = process.stdout, context = repl.repl ? repl.repl.context : global, prefix = 'example_', clear = true, linenos = true, cache = true }) => {

    const pathToExamples = npath.isAbsolute(path) ? path : npath.join(process.cwd(), path)

    const echoAndRunFile = filename => {
        if (clear) out.write('\x1B[2J')

        if (!cache) {
            // delete cached module
            delete require.cache[require.resolve(npath.join(pathToExamples, filename))]
        }

        const module = require(npath.join(pathToExamples, filename))
        const contents = cardinal.highlightFileSync(npath.join(pathToExamples, `${filename}.js`), { linenos })
        out.write(`${contents}\n`)

        return module
    }

    fs.readdirSync(pathToExamples)
        .filter(f => /\.js$/.test(f))
        .map(f => { return { name: npath.parse(f).name, path: npath.join(pathToExamples, f) } })
        .forEach(fileDesc => {
            const filename = fileDesc.name
            const prop = `${prefix}${filename}`

            // do not override existing prop
            if (Reflect.has(context, prop)) return

            Reflect.defineProperty(context, prop, {
                get: () => {
                    return echoAndRunFile(fileDesc.name)
                },
                configurable: true
            })
        })
}
