'use strict'

const npath = require('path')
const fs = require('fs')

const repl = require('repl').repl

const cardinal = require('cardinal')

module.exports = ({ path, context = repl.context, prefix = 'example_', clear = true, linenos = true }) => {

    const pathToExamples = npath.isAbsolute(path) ? path : npath.join(process.cwd(), path)

    const echoAndRunFile = filename => {
        if (clear) process.stdout.write('\x1B[2J')
        process.stdout.write(cardinal.highlightFileSync(npath.join(pathToExamples, `${filename}.js`), { linenos }))
        process.stdout.write('\n')
        return require(npath.join(pathToExamples, filename))
    }

    fs.readdir(pathToExamples, (err, files) => {
        files = files
            .filter(f => /\.js$/.test(f))
            .map(f => { return { name: npath.parse(f).name, path: npath.join(pathToExamples, f) } })

        files.forEach(fileDesc => {
            const prop = `${prefix}${fileDesc.name}`

            if (Reflect.has(context, prop)) return

            Reflect.defineProperty(context, prop, {
                get: () => {
                    return echoAndRunFile(fileDesc.name)
                }
            })
        })
    })
}
