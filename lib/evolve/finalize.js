const debug = require('debug')('almost-git')

var Git = require('simple-git/promise'),
    Status = require('../status'),
    fse = require('fs-extra'),
    path = require('path'),
    tmp = require('tmp-promise'),
    throwIfMissing = (name) => {
        throw new Error('Missing parameter ' + name)
    },
    filter = (src) => {
        return !['.git'].includes(path.basename(src))
    }

module.exports = async (folder = throwIfMissing('folder')) => {

    var git = new Git(folder),
        status = new Status(folder)

    if (await status.status() !== status.CONFLICTED) {
        throw new Error('the status of the evolution is ' + await status.status())
    }

    debug('EVOLVE --FINALIZE: checkout %s', status.TEMP_BRANCH)
    await git.checkout(status.TEMP_BRANCH)

    debug('EVOLVE --FINALIZE: create a temporary folder')
    var temp_folder = (await tmp.dir()).path
    debug('EVOLVE --FINALIZE: temporary folder %s', temp_folder)

    debug('EVOLVE --FINALIZE: copy the content in the temporary folder')
    await fse.copy(folder, temp_folder, { filter: filter })

    debug('EVOLVE --FINALIZE: checkout master')
    await git.checkout('master')

    debug('EVOLVE --FINALIZE: empty the folder')
    await fse.readdir(folder).then(files => {
        return Promise.all(files.filter((src) => {
            return !['.git'].includes(path.basename(src))
        }).map(file => fse.remove(path.join(folder, path.basename(file)))))
    })

    debug('EVOLVE --FINALIZE: copy content from temp folder')
    await fse.copy(temp_folder, folder, { filter: filter })

    debug('EVOLVE --FINALIZE: stash all files')
    await git.add(['-A'])

    debug('EVOLVE --FINALIZE: commit')
    var summary = await git.commit(['model', 'almost-git'])

    debug('EVOLVE --FINALIZE: update commit hash %s', summary.commit)
    await status.hash(summary.commit)

    debug('EVOLVE --FINALIZE: get diff')
    var diff = await git.diff(['master..' + status.FINAL_BRANCH, '--full-index', '--binary']);

    if (diff != '') {
        debug('EVOLVE --FINALIZE: create temp file to store diff patch')
        var temp_file = (await tmp.file()).path
        debug('EVOLVE --FINALIZE: temporary file %s', temp_file)

        debug('EVOLVE --FINALIZE: save diff to patch file')
        await fse.outputFile(temp_file, diff)

        debug('EVOLVE --FINALIZE: apply patch to master branch')
        await git.raw(['apply', temp_file])

        debug('EVOLVE --FINALIZE: stash all files')
        await git.add(['-A'])

        debug('EVOLVE --FINALIZE: commit')
        await git.commit(['merged model', 'almost-git'])
    }

    debug('EVOLVE --FINALIZE: delete %s branch', status.TEMP_BRANCH)
    await git.branch(['-D', status.TEMP_BRANCH])

    debug('EVOLVE --FINALIZE: delete %s branch', status.FINAL_BRANCH)
    await git.branch(['-D', status.FINAL_BRANCH])

    debug('EVOLVE --INIT: update status %s', status.READY)
    return status.status(status.READY)
}