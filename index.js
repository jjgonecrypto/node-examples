'use strict'

const npath = require('path')
const fs = require('fs')

const repl = require('repl').repl

const cardinal = require('cardinal')

module.exports = ({ path, out = process.stdout, context = repl ? repl.context : global, prefix = 'example_', clear = true, linenos = true }) => {

    const pathToExamples = npath.isAbsolute(path) ? path : npath.join(process.cwd(), path)

    const echoAndRunFile = filename => {
        if (clear) out.write('\x1B[2J')
        out.write(cardinal.highlightFileSync(npath.join(pathToExamples, `${filename}.js`), { linenos }))
        out.write('\n')
        return require(npath.join(pathToExamples, filename))
    }

    fs.readdirSync(pathToExamples)
        .filter(f => /\.js$/.test(f))
        .map(f => { return { name: npath.parse(f).name, path: npath.join(pathToExamples, f) } })
        .forEach(fileDesc => {
            const prop = `${prefix}${fileDesc.name}`

            if (Reflect.has(context, prop)) return

            Reflect.defineProperty(context, prop, {
                get: () => {
                    return echoAndRunFile(fileDesc.name)
                },
                configurable: true
            })
        })
}
