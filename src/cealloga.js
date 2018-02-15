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
	pug = require('pug'),
	path = require('path'),
	indexPugFile = path.join(settings.appDir, 'templates', 'index.pug'),
	indexTemplate = pug.compileFile(indexPugFile);

app.use(bodyParser.json());
app.get('/', (req, res) => res.send(indexTemplate(settings)));
app.use('/code', require('./code/route'));
app.use(`/${settings.cealloga.api_path}`, require('./cealloga/route'));

/**
 * @ignore
 */
let server = app.listen(port);

module.exports = {
	localhost: `http://127.0.0.1:${port}`,
	onListen: callback => {
		require('./cache').init(() => {
			callback(port);
		});
	},
	stop: () => {
		server.close();
	}
};
