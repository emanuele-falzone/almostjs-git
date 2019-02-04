var lib = require('../../lib'),
  Git = require('simple-git/promise'),
  middleware = async () => {
    return (await Git().revparse(['--show-toplevel'])).trim()
  }

exports.command = 'status'
exports.desc = 'Show the status of the repo'
exports.builder = {}
exports.handler = () => {
  middleware().then((folder) => {
    var status = new lib.Status(folder)
    return status.status()
  }).then((value) => {
    console.info(value);
  }).catch((err) => {
    console.error(err)
  })
}
