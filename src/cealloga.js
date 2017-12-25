'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Fáilte go dtí cealloga.js'));
app.use('/code', require('./code/route'));

let server = app.listen(port, () => console.log(`Ceallóga app listening on port ${port}`));

module.exports = {
    localhost: `http://localhost:${process.env.PORT}`,
    stop: () => {
        server.close();
    }
};
