'use strict'
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');

require('ejs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('index.ejs');
});

app.get('/new', (request, response) => {
  response.render('searches/new.ejs');
});

app.post('/searches', (request, response) => {
  console.log(request.body);
  let query = request.body.search[0];
  let titleOrAuthor = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if(titleOrAuthor === 'title'){
    url+=`+intitle:${query}`;
  }else if(titleOrAuthor === 'author'){
    url+=`+inauthor:${query}`;
  }
// console.log(url)
  superagent.get(url)
    .then(result => {
      let bookArray = result.body.items;

      const finalBookArray = bookArray.map(book => {
        return new Book(book.volumeInfo);
      })
      response.render('show.ejs', {searchResults: finalBookArray})
    }).catch(err => console.log(err));
})

function Book(info) {
  // const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title available';
}

app.listen(PORT, () => {
  console.log(`heard on ${PORT}`);
});
