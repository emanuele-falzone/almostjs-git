const debug = require('debug')('almost-git')

var Git = require('simple-git/promise'),
    Status = require('../status'),
    path = require('path'),
    finalize = require('./finalize'),
    fse = require('fs-extra'),
    throwIfMissing = (name) => {
        throw new Error('Missing parameter ' + name)
    }

module.exports = async (folder = throwIfMissing('folder'), evolution = throwIfMissing('evolution')) => {

    var git = new Git(folder),
        status = new Status(folder)

    if (await status.status() !== status.READY) {
        throw new Error('the status of the evolution is ' + await status.status())
    }

    debug('EVOLVE --INIT: update status %s', status.CONFLICTED)
    await status.status(status.CONFLICTED)

    debug('EVOLVE --INIT: checkout master')
    await git.checkout('master')

    debug('EVOLVE --INIT: checkout model commit %s', await status.hash())
    await git.checkout(await status.hash())

    debug('EVOLVE --INIT: create local branch %s and checkout', status.TEMP_BRANCH)
    await git.checkoutLocalBranch(status.TEMP_BRANCH)

    debug('EVOLVE --INIT: empty directory')
    await fse.readdir(folder).then(files => {
        return Promise.all(files.filter((src) => {
            return !['.git'].includes(path.basename(src))
        }).map(file => fse.remove(path.join(folder, path.basename(file)))))
    })

    debug('EVOLVE --INIT: copy the generated code')
    await fse.copy(evolution, folder)

    debug('EVOLVE --INIT: stage all file')
    await git.add(['-A'])

    debug('EVOLVE --INIT: commit')
    await git.commit(['model'])

    debug('EVOLVE --INIT: checkout master')
    await git.checkout('master')

    debug('EVOLVE --INIT: create local branch %s and checkout', status.FINAL_BRANCH)
    await git.checkoutLocalBranch(status.FINAL_BRANCH)

    debug('EVOLVE --INIT: soft reset to %s', await status.hash())
    await git.reset(['--soft', await status.hash()])

    debug('EVOLVE --INIT: commit changes (in this way we squash all te commits)')
    await git.commit('squash commits')

    debug('EVOLVE --INIT: rebase on branch %s', status.TEMP_BRANCH)
    await git.rebase([status.TEMP_BRANCH])

    debug('EVOLVE --INIT: finalize the evolution')
    return finalize(folder)
}