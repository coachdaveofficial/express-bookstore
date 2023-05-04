const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require("../models/book");

let book_isbn;

beforeEach(async function () {
    await db.query('DELETE FROM books');
    await Book.create({
      isbn: '1234567890',
      amazon_url: 'https://www.amazon.com/dp/1234567890',
      author: 'John Doe',
      language: 'English',
      pages: 200,
      publisher: 'Random House',
      title: 'My Test Book',
      year: 2022
    });
    book_isbn = '1234567890';
  });

afterAll(async () => {
  await db.end();
});

describe('GET /books', () => {
  test('get all books', async () => {
    const response = await request(app).get('/books');
    expect(response.status).toBe(200);
    expect(response.body.books).toHaveLength(1);
  });
});

describe('POST /books', () => {
  test('create a new book', async () => {
    book_isbn = '1234567890';
    const book = {
      isbn: '1234',
      amazon_url: 'https://www.amazon.com/dp/1234',
      author: 'John Doe',
      language: 'French',
      pages: 200,
      publisher: 'Publisher B',
      title: 'Book B',
      year: 2023,
    };
    const response = await request(app).post('/books').send(book);
    expect(response.status).toBe(201);
    expect(response.body.book).toEqual(book);
  });

  test('return 400 if invalid data is provided', async () => {
    const book = {
      isbn: '1234567890',
      author: 'Jane Doe',
      language: 'English',
      pages: 200,
      publisher: 'Publisher A',
      title: 'Book A',
      year: '2023',
    };
    const response = await request(app).post('/books').send(book);
    expect(response.status).toBe(400);
  });
});

describe('GET /books/:id', () => {
  test('get a book by id', async () => {
    const book = {
        isbn: '1234567890',
        amazon_url: 'https://www.amazon.com/dp/1234567890',
        author: 'John Doe',
        language: 'English',
        pages: 200,
        publisher: 'Random House',
        title: 'My Test Book',
        year: 2022
      }
    const response = await request(app).get(`/books/${book_isbn}`);
    expect(response.status).toBe(200);
    expect(response.body.book).toEqual(book);
  });

  test('return 404 if book is not found', async () => {
    const response = await request(app).get('/books/999999');
    expect(response.status).toBe(404);
  });
});

describe('PUT /books/:isbn', () => {
  test('update a book by isbn', async () => {
    const updatedBook = {
      amazon_url: 'https://www.amazon.com/dp/0987654321',
      author: 'John Smith',
      language: 'Spanish',
      pages: 300,
      publisher: 'Publisher B',
      title: 'Book B',
      year: 2022,
    };
    const response = await request(app)
      .put(`/books/${book_isbn}`)
      .send(updatedBook);
    expect(response.status).toBe(200);
    });
    test("handle invalid update", async () => {
        const invalidBook = {
            isbn: '1234567890',
            INVALID_FIELD: "this is just wrong",
            amazon_url: 'https://www.amazon.com/dp/1234567890',
            author: 'Jane Doe',
            language: 'English',
            pages: 200,
            publisher: 'Publisher A',
            title: 'Book A',
            year: 2023,
          };
        const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send(invalidBook);
        expect(response.status).toBe(400);
    });
});

describe('DELETE /[isbn]', () => {
    test('delete a book by isbn', async () => {
        const response = await request(app).delete(`/books/${book_isbn}`)
        expect(response.body).toEqual({message: "Book deleted"});
        const getBook = await request(app).get(`/books/${book_isbn}`);
        expect(getBook.status).toBe(404);
    })
})
