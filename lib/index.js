#!/usr/bin/node

require('@babel/register')({
        only: [__dirname],
        plugins: [__dirname + '/../node_modules/@babel/plugin-transform-modules-commonjs']
});

const { chmodSync, unlinkSync } = require('fs');
const http = require('http');
const cleanup = require('./cleanup').default;
const { logger } = require('./common');
const config = require('./config').default;
const app = require('./app').default;


let notify = {
	ready() {
	}
};

try {
	notify = require('sd-notify');
} catch(e) {
	logger.debug('Systemd notifications are disabled');
}


const server = http.createServer(app);

server.on('error', e => {
	logger.error('Server error', { e });
	cleanup(1);
});

cleanup((exit, callback) => {
	server.close();
	logger.on('finish', callback);
	logger.info('Exiting...', {exit});
	logger.end();
	if(config.listen.path) {
		try {
			unlinkSync(config.listen.path);
		} catch(e) {
			if(e.code !== 'ENOENT') {
				throw e;
			}
		}
	}
});

if(config.listen === 'systemd') {
	const socketCount = Number(process.env.LISTEN_FDS);
	if(socketCount !== 1) {
		logger.error('Bad number of sockets', { socketCount });
	} else {
		const PipeWrap = process.binding('pipe_wrap');
		if(PipeWrap.constants && typeof PipeWrap.constants.SOCKET !== 'undefined') {
			server._handle = new PipeWrap.Pipe(PipeWrap.constants.SOCKET);
		} else {
			server._handle = new PipeWrap.Pipe();
		}
		server._handle.open(3);
		server._listen2(null, -1, -1);
		logger.info('Listening', { fd: 3 });
		notify.ready();
	}
} else if('port' in config.listen) {
	server.listen(config.listen.port, config.listen.address, () => {
		const address = server.address();
		logger.info('Listening', address);
		notify.ready();
	});
} else if('path' in config.listen) {
	server.listen(config.listen.path, () => {
		let error = false;
		if('mode' in config.listen) {
			try {
				chmodSync(config.listen.path, config.listen.mode);
			} catch(e) {
				error = true;
				logger.error(e.code === 'ERR_INVALID_ARG_VALUE' ? 'Bad socket mode' : 'Failed to set socket mode', {
					path: config.listen.path,
					mode: config.listen.mode
				});
				server.close();
			}
		}
		if(!error) {
			logger.info('Listening', { path: config.listen.path });
			notify.ready();
		}
	});
}
