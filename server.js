'use strict'
require('dotenv').config();

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
require('dotenv').config();
require('ejs');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.get('/', getBooks); //app.get('/', getBooks); // rendering our home page which shows all our saved books from our database
app.get('/add', showAddForm); //app.get('/add', showSearchForm); // shows our search form
app.get('/books/:bookId', getOneBook); //app.get('/books/:id', getOneBook); // shows our detail page
app.post('/add', addBook); // app.post('/details', addToFavorites); // takes form data from the API and adds a book to our database and then redirects to a detail page
app.post('/searches', getBooksFromAPI); // takes in our search form information and displays our show.ejs page - results from our API
app.get('/searches/new', getSearchForm);
app.put('/update/:bookId', updateBook);
app.delete('/delete/:bookId', deleteBook);
app.get('*', (request, response) => {response.status(200).send('Page Not Found')});

function getBooks(request, response){
  let sql = 'SELECT * FROM books;';
  client.query(sql)
    .then(sqlResults => {
      let books = sqlResults.rows;
      // console.log(books)
      response.status(200).render('index.ejs', {myBooks: books})
    }).catch(error => console.error(error))
}

function showAddForm(request, response){
  response.status(200).render('add.ejs');
}

function getOneBook(request, response){
  console.log(request.params.bookId);
  let myBookId = request.params.bookId;
  let sql = `SELECT * FROM books WHERE id = $1;`;
  let safeValues = [myBookId];
  client.query(sql, safeValues)
    .then(sqlResults => {
      console.log(sqlResults.rows[0]);
      response.status(200).render('details.ejs', {oneBook: sqlResults.rows[0]});
    }).catch(error => console.error(error))
}

function addBook(request, response){
  // console.log('running addBook')
  let {title, authors, description, thumbnail, isbn, bookshelf} = request.body;
  let sql = `INSERT INTO books (title, authors, description, thumbnail, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
  let safeValues = [title, authors, description, thumbnail, isbn, bookshelf];
  client.query(sql, safeValues)
    .then(results => {
      console.log(results.rows);
      response.redirect(`/books/${results.rows[0].id}`)
    }).catch(error => console.error(error))
}

function getSearchForm(request, response) {
  response.render('searches/new');
}

function getBooksFromAPI(request, response){
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
    }).catch(error => console.error(error))
}


function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title available';
  this.authors = info.authors ? info.authors : 'no authors available';
  this.description = info.description ? info.description : 'no description available';
  this.thumbnail = info.imageLinks.thumbnail ? info.imageLinks.thumbnail : placeholderImage;
  this.isbn = info.industryIdentifiers[0].identifier ? info.industryIdentifiers[0].identifier : 'no isbn available';
  this.bookshelf = info.categories ? info.categories : 'no categories available';
}

function updateBook(request, response){
  // collect the information that needs to be updated
  console.log('this is our params', request.params); //{ bookId: '3' }
  let bookId = request.params.bookId;

  console.log('form information to be updated', request.body);
  let { title, authors, description, thumbnail, isbn, bookshelf } = request.body;
  //'UPDATE movies SET title, authors, description, thumbnail, isbn, bookshelf WHERE id=$7;';

  let sql = 'UPDATE books SET title=$1, authors=$2, description=$3, thumbnail=$4, isbn=$5, bookshelf=$6 WHERE id=$7;';
  let safeValues = [title, authors, description, thumbnail, bookId, isbn, bookshelf, bookId];
  // update the database with the new information

  client.query(sql, safeValues)
    .then(sqlResults => {
      // redirect to teh detail page with the new values
      response.redirect(`/tasks/${bookId}`);
    }).catch(error => console.error(error))
}

function deleteBook(request, response){
  // collect the information that needs to be deleted
  console.log('this is our params', request.params); //{ bookId: '3' }
  let bookId = request.params.bookId;
  console.log('form information to be updated', request.body);
  let { title, authors, description, thumbnail, isbn, bookshelf } = request.body;
  let sql = 'DELETE tasks SET title=$1, authors=$2, description=$3, thumbnail=$4, isbn=$5, bookshelf=$6, WHERE bookId=$7;';
  let safeValues = [title, authors, description, thumbnail, bookId, isbn, bookshelf];
  // update the database with the new information

  client.query(sql, safeValues)
    .then(sqlResults => {
      // redirect to teh detail page with the new values
      response.redirect('/');
    })
    .catch(error => console.error(error))
}

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));
client.connect()
  .then(() => {app.listen(PORT, () => console.log(`heard on ${PORT}`));})
  .catch(error => console.error(error));
