// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server listening on port', port));
