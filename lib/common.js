import asyncHooks from 'async_hooks';
import { randomBytes } from 'crypto';
import uniqid from 'uniqid';
import winston from 'winston';
import PouchDB from 'pouchdb';
import pouchSeed from 'pouchdb-seed-design';
import config from './config';


const requestNamespace = {};
const asyncHook = asyncHooks.createHook({
	init(asyncId, type, triggerId, resource) {
		if (requestNamespace[triggerId]) {
			requestNamespace[asyncId] = requestNamespace[triggerId];
		}
	},

	destroy(asyncId) {
		delete requestNamespace[asyncId];
	}
});

asyncHook.enable();


export function reqid(req, res, next) {
	const eid = asyncHooks.executionAsyncId();
	if (req) {
		if (!(eid in requestNamespace)) {
			requestNamespace[eid] = {
				id: req.headers['x-request-id'] || uniqid()
			};
		}
		res.setHeader('x-request-id', requestNamespace[eid].id);
		if (typeof next === 'function') {
			next();
		}
		return requestNamespace[eid].id;
	} else {
		if (typeof next === 'function') {
			next();
		}
		return eid in requestNamespace ? requestNamespace[eid].id : null;
	}
}


const reqidFormat = winston.format(info => {
	const eid = asyncHooks.executionAsyncId();
	if (eid in requestNamespace && 'id' in requestNamespace[eid]) {
		info.reqid = requestNamespace[eid].id;
	}
	return info;
});


export const logger = winston.createLogger({
	format: winston.format.combine(reqidFormat(), winston.format.simple()),
	transports: [new winston.transports.Console({ level: 'debug' })]
});


export const db = new PouchDB(config.database);


pouchSeed(db, { })
	.then(updated => {
		if (updated) {
			logger.info('Design documents updated');
		} else {
			logger.debug('Design documents didn\'t need updates');
		}
	}, e => {
		logger.error('Failed to seed database with design documents', { e: e.message });
	});
