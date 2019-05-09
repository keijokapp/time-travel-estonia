import fs from 'fs';
import Ajv from 'ajv';


let jsonConfig, config;

if(process.argv.length >= 3) {
	try {
		console.log('Reading configuration from %s', process.argv[2]);
		jsonConfig = fs.readFileSync(process.argv[2]);
	} catch(e) {
		console.error('Failed to read configuration file: ', e.message);
		process.exit(1);
	}
} else {
	try {
		console.log('Reading configuration from standard input');
		jsonConfig = fs.readFileSync(0);
	} catch(e) {
		console.error('Failed to read configuration from standard input: ', e.message);
		process.exit(1);
	}
}

try {
	config = JSON.parse(jsonConfig);
} catch(e) {
	console.error('Failed to parse configuration: ' + e.message);
	process.exit(1);
}


const configSchema = {
	type: 'object',
	properties: {
		listen: {
			oneOf: [{
				type: 'string',
				enum: ['systemd']
			}, {
				type: 'object',
				properties: {
					port: { type: 'integer', min: 1, max: 65535 },
					address: { type: 'string', minLength: 1 }
				},
				additionalProperties: false,
				required: ['port']
			}, {
				type: 'object',
				properties: {
					path: { type: 'string', minLength: 1 },
					mode: { oneOf: [{ type: 'string' }, { type: 'integer' }] }
				},
				additionalProperties: false,
				required: ['path']
			}]
		},
		trustProxy: {
			type: [ 'boolean', 'integer', 'string' ]
		},
		database: {
			type: 'string',
			minLength: 1
		}
	},
	required: ['listen', 'database'],
	additionalProperties: false
};


const validator = new Ajv();
const valid = validator.validate(configSchema, config);


if (!valid) {
	console.error('Found configuration errors:');
	console.error(validator.errorsText(validator.errors, {
		separator: '\n',
		dataVar: 'config',
	}));
	process.exit(1);
}

export default config;
