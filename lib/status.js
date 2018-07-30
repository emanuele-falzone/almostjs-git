const debug = require('debug')('almost-git')
var path = require('path'),
    fse = require('fs-extra');

const FILE = '.git/almost.git';

class Status {
    constructor(root) {
        debug('STATUS: the contructor has been called')
        this._path = path.join(root, FILE)
    }

    get READY() { return 'READY' }
    get CONFLICTED() { return 'CONFLICTED' }
    get TEMP_BRANCH() { return 'almost-git-temp' }
    get FINAL_BRANCH() { return 'almost-git-final' }

    async _write(obj) {
        debug('STATUS: the file almost.git will be writen %O', obj)
        return fse.writeJson(this._path, obj)
    }

    async _read() {
        if (!(await fse.pathExists(this._path))) {
            debug('STATUS: the file almost.git does not exist')
            await this._write({})
        }
        debug('STATUS: the file almost.git will be read')
        return fse.readJson(this._path)
    }

    async status(status) {
        var obj = await this._read();
        if (status === undefined) {
            debug('STATUS: status read %s', obj.status)
            return obj.status;
        } else {
            debug('STATUS: status write %s', status)
            obj.status = status;
            return this._write(obj);
        }
    }

    async hash(hash) {
        var obj = await this._read();
        if (hash === undefined) {
            debug('STATUS: hash read %s', obj.hash)
            return obj.hash;
        } else {
            debug('STATUS: hash write %s', hash)
            obj.hash = hash;
            return this._write(obj);
        }
    }
}

module.exports = Status;