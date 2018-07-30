const debug = require('debug')('almost-git')

var Git = require('simple-git/promise'),
    Status = require('../status'),
    throwIfMissing = (name) => {
        throw new Error('Missing parameter ' + name)
    }

module.exports = async (folder = throwIfMissing('folder')) => {

    var git = new Git(folder),
        status = new Status(folder)

    if (await status.status() !== status.CONFLICTED) {
        throw new Error('the status of the evolution is ' + await status.status())
    }

    debug('EVOLVE --ABORT: clean repository')
    await git.clean('f')

    debug('EVOLVE --ABORT: abort rebase')
    await git.rebase(['--abort'])

    debug('EVOLVE --ABORT: checkout master')
    await git.checkout('master')

    debug('EVOLVE --ABORT: delete %s branch', status.TEMP_BRANCH)
    await git.branch(['-D', status.TEMP_BRANCH])

    debug('EVOLVE --ABORT: delete %s branch', status.FINAL_BRANCH)
    await git.branch(['-D', status.FINAL_BRANCH])

    debug('EVOLVE --INIT: update status %s', status.READY)
    return status.status(status.READY)
}
