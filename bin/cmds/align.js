var lib = require('../../lib'),
    Git = require('simple-git/promise'),
    middleware = async () => {
        return (await Git().revparse(['--show-toplevel'])).trim()
    }

exports.command = 'align <hash>'
exports.desc = 'Align the status'
exports.builder = (yargs) => {
    return yargs
        .option('hash', {
            type: 'string',
            description: 'hash of the last commit'
        })
}

exports.handler = (argv) => {
    var status;
    middleware().then((folder) => {
        status = new lib.Status(folder);
        if (argv.hash) {
            return status.hash(argv.hash)
                .then(function () {
                    return status.status(status.READY)
                }).then(() => {
                    console.log('Status aligned!')
                })
        }
    }).catch((err) => {
        console.error(err)
    })
}