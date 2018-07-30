var lib = require('../../lib');

exports.command = 'init'
exports.desc = 'Initialize the repo to use almost-git'
exports.builder = {}
exports.handler = () => {
  lib.init().then(() => {
    console.log('Repository correctly initialized!')
  }).catch((err) => {
    console.error(err);
  })
}