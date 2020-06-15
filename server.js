'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');
const path = require('path');
const superagent = require('superagent');
require('ejs');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

const app = express();

app.use(bodyParser());
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

app.listen(PORT, function() {
  console.log(`heard on ${PORT}`);
});
