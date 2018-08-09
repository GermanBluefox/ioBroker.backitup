'use strict';

const Client = require('ftp');

function uploadFiles(client, dir, fileNames, log, errors, callback) {
	if (!fileNames || !fileNames.length) {
		callback();
	} else {
		let fileName = fileNames.shift();
        fileName = fileName.replace(/\\/g, '/');
		const onlyFileName = fileName.split('/').pop();

        log.debug('Send ' + onlyFileName);

        client.put(fileName, dir + '/' + onlyFileName, err => {
        	if (err) {
                errors.ftp = err;
        		log.error(err);
			}
            setImmediate(uploadFiles, client, dir, fileNames, log, errors, callback);
        });
	}
}

function command(options, log, callback) {
	if (options.host && options.context && options.context.fileNames && options.context.fileNames.length) {
		const client = new Client();
		const fileNames = JSON.parse(JSON.stringify(options.context.fileNames));
		client.on('ready', () => {
		    log.debug('FTP connected.');
			uploadFiles(client, options.dir, fileNames, log, options.context.errors, err => {
				// todo: clean to many files on FTP

                if (err) {
                	options.context.errors.ftp = options.context.errors.ftp || err;
                } else {
                    options.context.done.push('ftp');
                }
                client.end();
				if (callback) {
					callback(err);
					callback = null;
				}
			});
		});
		client.on('error', err => {
            options.context.errors.ftp = err;
			if (callback) {
				callback(err);
				callback = null;
			}
		});

		const srcFTP = {
			host     : options.host,
			port     : options.port || 21,
			user     : options.user,
			password : options.pass
		};

		client.connect(srcFTP);
	} else {
		callback();
	}
}

module.exports = {
    command,
    ignoreErrors: true
};