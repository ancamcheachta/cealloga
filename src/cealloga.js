/**
 * @desc Launches and manages cealloga server.
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const bodyParser = require('body-parser'),
	express = require('express'),
	settings = require('./settings'),
	app = express(),
	port = process.env.PORT || 3000,
	cachePlugin = require('./plugins/cealloga-expire-cache-plugin'),
	variablesPlugin = require('./plugins/cealloga-variables-plugin');

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Fáilte go dtí cealloga.js'));
app.use('/code', require('./code/route'));
app.use(`/${settings.cealloga.api_path}`, 
	require('./cealloga/route')(cachePlugin, variablesPlugin)
);

/**
 * @ignore
 */
let server = app.listen(port, () =>
	console.log(`Ceallóga app listening on port ${port}`)
);

module.exports = {
	localhost: `http://127.0.0.1:${port}`,
	onListen: callback => {
		callback();
	},
	stop: () => {
		server.close();
	}
};
