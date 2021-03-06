const child_process = require('child_process');
const utils = require('@iobroker/adapter-core');

function restore(options, fileName, log, callback) {
    let ioPath = utils.controllerDir + '/iobroker.js';

    try {
        const cmd = child_process.fork(ioPath, ['restore', fileName], {silent: true});
        cmd.stdout.on('data', data => log.debug(data.toString()));

        cmd.stderr.on('data', data => log.error(data.toString()));

        cmd.on('close', code => {
            if (callback) {
                callback(null, code);
                callback = null;
            }
        });

        cmd.on('error', error => {
            log.error(error);
            if (callback) {
                callback(error, -1);
                callback = null;
            }
        });
    } catch (error) {
        log.error(error);

        if (callback) {
            callback(error, -1);
            callback = null;
        }
    }
}

module.exports = {
    restore,
    isStop: true
};