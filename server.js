'use strict'

const PORT = process.env.PORT || 3001;

const express = require('express');
const superagent = require('superagent');

require('ejs');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  let query = request.body.search[0];
  let titleOrAuthor = request.body.search[1];

  let url = 'https://www.googleapi.com/books/v1/volumes?q=';

  if(titleOrAuthor === 'title'){
    url+=`+intitle:${query}`;
  }else if(titleOrAuthor === 'author'){
    url+=`+inauthor:${query}`;
  }

  superagent.get(url)
    .then(result => {
      let bookArray = result.body.items;

      const finalBookArray = bookArray.map(book => {
        return new Book(book.volumeInfo);
      })
      response.render('show.ejs', {searchResults: finalBookArray})
    })
})

function Book(info) {
  // const placdholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title available';
}

app.listen(PORT, () => {
  console.log(`heard on ${PORT}`);
});
