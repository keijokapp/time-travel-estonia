import express from 'express';
import expressWinston from 'express-winston';
import { logger, reqid } from './common';
import config from './config';


const app = express();
export default app;

app.set('json spaces', 2);

if('trustProxy' in config) {
	app.set('trust proxy', config.trustProxy);
}

app.use(reqid);

expressWinston.requestWhitelist.push('body');
app.use(expressWinston.logger({ winstonInstance: logger }));
app.use(express.static(__dirname + '/../static'));
app.use(express.json());


// catch 404 and forward to error handler
app.use((req, res, next) => {
	res.status(404).send({
		error: 'Not Found',
		message: 'Page not found'
	});
});

app.use((e, req, res, next) => {
	if(e instanceof Error) {
		logger.error('Application error ', { e: e.message, stack: e.stack });
		res.status(500).send({
			error: 'Internal Server Error',
			message: 'Something has gone wrong'
		});
	} else {
		logger.error('Unknown application error ', { e });
		res.status(500).send();
	}
});
