'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var cors= require('cors');
var path = require('path')

const PORT = process.env.PORT || 3001;

var app = express();

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
