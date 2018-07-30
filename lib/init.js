const debug = require('debug')('almost-git')

var Git = require('simple-git/promise'),
    Status = require('./status'),
    throwIfMissing = (name) => {
        throw new Error('Missing parameter ' + name)
    }

module.exports = async (folder = throwIfMissing('folder')) => {

    var git = new Git(folder),
        status = new Status(folder)

    if (await git.checkIsRepo()) {
        throw new Error('this is already a git repository!')
    }

    debug('INIT: git repository init')
    await git.init()

    debug('INIT: stage all file')
    await git.add(['-A'])

    debug('INIT: commit')
    let summary = await git.commit(['model', 'almost-git'])

    debug('INIT: update commit hash %s', summary.commit.split(' ')[1])
    await status.hash(summary.commit.split(' ')[1])

    debug('INIT: update status %s', status.READY)
    return status.status(status.READY)
}

