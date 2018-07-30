var lib = require('../../lib'),
    Git = require('simple-git/promise'),
    middleware = async () => {
        return (await Git().revparse(['--show-toplevel'])).trim()
    }

exports.command = 'evolve [src]'
exports.desc = 'Manage the evolution'
exports.builder = (yargs) => {
    return yargs
        .option('src', {
            type: 'string',
            description: 'new generated code folder'
        })
        .option('abort', {
            type: 'boolean',
            description: 'abort the evolution',
            alias: 'a'
        })
        .option('continue', {
            type: 'boolean',
            description: 'continue the evolution',
            alias: 'c'
        })
        .check((argv) => {
            if (!!argv.src + !!argv.abort + !!argv.continue == 1) {
                return true;
            } else {
                throw (new Error('Argument check failed: options are mutually exclusive'));
            }
        })
}

exports.handler = (argv) => {
    middleware().then((folder) => {
        if (argv.src) {
            lib.evolve.init(folder, argv.src)
                .then(() => {
                    console.log('Evolution completed!')
                })
        }
        if (argv.abort) {
            lib.evolve.abort(folder)
                .then(() => {
                    console.log('Evolution aborted!')
                })
        }
        if (argv.continue) {
            lib.evolve.continue(folder)
                .then(() => {
                    console.log('Evolution completed!')
                })
        }
    }).catch((err) => {
        console.error(err)
    })

}