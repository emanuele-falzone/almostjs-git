const debug = require('debug')('almost-git')

var Git = require('simple-git/promise'),
    Status = require('../status'),
    finalize = require('./finalize'), throwIfMissing = (name) => {
        throw new Error('Missing parameter ' + name)
    }

module.exports = async (folder = throwIfMissing('folder')) => {

    var git = new Git(folder),
        status = new Status(folder)

    if (await status.status() !== status.CONFLICTED) {
        throw new Error('the status of the evolution is ' + await status.status())
    }

    debug('EVOLVE --CONTINUE: continue rebase')
    await git.rebase(['--continue'])

    debug('EVOLVE --CONTINUE: finalize the evolution')
    return finalize(folder)
}
