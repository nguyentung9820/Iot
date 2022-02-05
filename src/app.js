const express = require('express')
const app = express();
const port = 9820;
const path = require('path');

const morgan = require('morgan');
app.use(morgan('combined'));
app.use(express.urlencoded());

const Iot = require('./index');

app.use(Iot)

const db = require('./database');
db.connect();
app.listen(port, () => console.log(`Connect http://localhost:${port}`));