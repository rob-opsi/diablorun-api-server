require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const users = require('./users');
const characters = require('./characters');
const races = require('./races');
const speedruns = require('./speedruns');
const webhooks = require('./webhooks');

const app = express();
const port = process.env.PORT || 8123;

app.use(cors());
app.use(bodyParser.json());

app.use(users.router);
app.use(characters.router);
app.use(races.router);
app.use(speedruns.router);
app.use(webhooks.router);

app.listen(port, () => {
    console.log(`diablorun-api-server running on port ${port}`);
});
