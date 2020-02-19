process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

const Book = require("../models/book");

describe("Book Routes Test", function () {
  let book1;
  beforeEach(async function () {
    await db.query("DELETE FROM books");

    book1 = await Book.create(
      {
        "isbn": "0691161518",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Matthew Lane",
        "language": "english",
        "pages": 264,
        "publisher": "Princeton University Press",
        "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        "year": 2017
      }
    );
  });

  describe("POST /books", function () {

    test("can add new book", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "isbn": "000000000",
          "amazon_url": "http://a.co/eobPtX2",
          "author": "Test Author",
          "language": "english",
          "pages": 999,
          "publisher": "Princeton University Press",
          "title": "Test Title",
          "year": 2017
        });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        book: {
          "isbn": "000000000",
          "amazon_url": "http://a.co/eobPtX2",
          "author": "Test Author",
          "language": "english",
          "pages": 999,
          "publisher": "Princeton University Press",
          "title": "Test Title",
          "year": 2017
        }
      });
    });

    test("missing year input returns one validation error", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "isbn": "000000000",
          "amazon_url": "http://test.com",
          "author": "Test Author",
          "language": "english",
          "pages": 999,
          "publisher": "Princeton University Press",
          "title": "Test Title"
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toEqual(["instance requires property \"year\""]);
    });

    test("no input information returns validation errors", async function () {
      let response = await request(app)
        .post("/books");

      expect(response.status).toBe(400);
      expect(response.body.error.message.length).toEqual(8);
    });

    test("Year needs to be an integer. Returns validation error.", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "isbn": "000000000",
          "amazon_url": "http://test.com",
          "author": "Test Author",
          "language": "english",
          "pages": 999,
          "publisher": "Princeton University Press",
          "title": "Test Title",
          "year": "year"
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toEqual(["instance.year is not of a type(s) integer"]);
    });

    test("amazon_url needs to be of type string. Returns validation error", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "isbn": "000000000",
          "amazon_url": 9999999,
          "author": "Test Author",
          "language": "english",
          "pages": 999,
          "publisher": "Princeton University Press",
          "title": "Test Title",
          "year": 1999
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toEqual(["instance.amazon_url is not of a type(s) string"]);
    });
  });
  describe("PUT /books/:isbn", function () {

    test("Can update information for a book. Returns book.", async function () {
      let response = await request(app)
        .put(`/books/${book1.isbn}`)
        .send({
          "amazon_url": book1.amazon_url,
          "author": book1.author,
          "language": "spanish",
          "pages": 250,
          "publisher": book1.publisher,
          "title": "Updated Title",
          "year": 2000
        });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        book: {
          "isbn": book1.isbn,
          "amazon_url": book1.amazon_url,
          "author": book1.author,
          "language": "spanish",
          "pages": 250,
          "publisher": book1.publisher,
          "title": "Updated Title",
          "year": 2000
        }
      });
    });

    test("missing year input returns one validation error", async function () {
      let response = await request(app)
        .put(`/books/${book1.isbn}`)
        .send({
          "amazon_url": book1.amazon_url,
          "author": book1.author,
          "language": "spanish",
          "pages": 250,
          "publisher": book1.publisher,
          "title": "Updated Title"
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toEqual(["instance requires property \"year\""]);
    });

  });
});

afterAll(async function () {
  await db.end();
});
