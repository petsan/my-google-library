'use strict'
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();
require('ejs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', getBooks);
app.get('/books/:book_id', getOneBook);
app.get('/add', showAddForm);
app.post('/add', addBook);

function getBooks(request, response){
  let sql = 'SELECT * FROM books;';
  client.query(sql)
    .then(sqlResults => {
      let books = sqlResults.rows;
      console.log(books)
      response.status(200).render('index.ejs', {myBooks: books})
    })
}

function getOneBook(request, response){
  let myBookId = request.params.book_id;
  let sql = `SELECT * FROM books WHERE id = $1;`;
  let safeValues = [myBookId];
  client.query(sql, safeValues)
    .then(sqlResults => {
      console.log(sqlResults.rows[0]);
      response.status(200).render('details.ejs', {oneBook: sqlResults.rows[0]});
    })
}

function addBook(request, response){
  let {title, authors, description, thumbnail} = request.body;
  let sql = `INSERT INTO books (title, authors, description, thumbnail) VALUES ($1, $2, $3, $4) RETURNING id;`;
  let safeValues = [title, authors, description, thumbnail];
  client.query(sql, safeValues)
    .then(results => {
      console.log(results.rows);
      response.redirect(`/books/${id}`)
    })
}

function showAddForm(request, response){
  response.status(200).render('add.ejs');
}

app.get('/searches/new', (request, response) => {
  response.render('searches/new.ejs');
});

app.post('/searches/new', (request, response) => {
  console.log(request.body);
  let query = request.body.search[0];
  let titleOrAuthor = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

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
    }).catch(err => console.log(err));
})

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title available';
  this.authors = info.authors ? info.authors : 'no authors available';
  this.description = info.description ? info.description : 'no description available';
  this.thumbnail = info.imageLinks.thumbnail ? info.imageLinks.thumbnail : placeholderImage;
}

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));
client.connect().then(() => {
  app.listen(PORT, () => console.log(`heard on ${PORT}`));
});
