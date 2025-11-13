const { faker } = require('@faker-js/faker')
const { randomUUID } = require('crypto')
const { spec } = require('pactum')

url = 'http://books.tc.staging.catapult.com:4000/graphql'


describe('Query book tests', () => {

    test('Test query all books and then query first individual book by id', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                bookAll {
                    id
                    title
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .stores('bookId', 'data.bookAll[0].id')
        
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                book(id: { id: "$S{bookId}" } ){
                    id
                    title
                    author {
                        name
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
    })
})

describe('Create book test', () => {

    test('Test create a new book and query by id', async () => {

        const randomTitle = faker.book.title()

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createBook($title: String!) {
                createBook(createBookInput: { title: $title }) {
                    id
                    title
                }
            }
        `)
        .withGraphQLVariables({
            "title": randomTitle
        })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createBook.title', randomTitle)
        .stores('bookId', 'data.createBook.id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                book(id: { id: "$S{bookId}" }) {
                    id
                    title
                    author {
                        name
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
    })
})

describe('Remove book tests', () => {

    test('Test create a new book and remove and query', async () => {

        const randomTitle = faker.book.title()

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createBook($title: String!) {
                createBook(createBookInput: { title: $title }) {
                    id
                    title
                }
            }
        `)
        .withGraphQLVariables({
            "title": randomTitle
        })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createBook.title', randomTitle)
        .stores('bookId', 'data.createBook.id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation removeBook {
                removeBook(id: { id: "$S{bookId}" }) {
                    id
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)   
        .expectJsonMatch('data.removeBook.id', '$S{bookId}');

        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                book(id: { id: "$S{bookId}" }) {
                    id
                    title
                    author {
                        name
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                book(id: { id: "$S{bookId}" }) {
                    id
                    title
                    author {
                        name
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectBodyContains('Cannot return null for non-nullable field Query.book.')
    })

    test('Test query all books and then remove first book by id', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                bookAll {
                    id
                    title
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .stores('bookId', 'data.bookAll[0].id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation removeBook {
                removeBook(id: { id: "$S{bookId}" }) {
                    id
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)   
        .expectJsonMatch('data.removeBook.id', '$S{bookId}');
    })
})


describe('Update book test', () => {
    
    test('Test create book and then update title', async () => {

        const randomTitle = faker.book.title()
        const updatedTitle = faker.book.title()

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createBook($title: String!) {
                createBook(createBookInput: { title: $title }) {
                    id
                    title
                }
            }
        `)
        .withGraphQLVariables({
            "title": randomTitle
        })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createBook.title', randomTitle)
        .stores('bookId', 'data.createBook.id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation updateBook($title: String!) {
                updateBook(updateBookInput: { id: { set: "$S{bookId}" }, title: { set: $title }}) {
                    id
                    title
                }
            }
        `)
        .withGraphQLVariables({
            "title": updatedTitle
        })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectJsonMatch('data.updateBook.title', updatedTitle)
        .stores('bookId', 'data.createBook.id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                book(id: { id: "$S{bookId}" }) {
                    id
                    title
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectJsonMatch('data.updateBook.title', newRandomTitle)
    })
})

describe('Book negative tests', () => {

    test('Test query book that does not exist', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                book(id: { id: "f0091eef-b323-4803-89cd-8d29b3acceed" }) {
                    id
                    title
                    author {
                        name
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectBodyContains('Cannot return null for non-nullable field Query.book.')
    })

    test('Test remove book that does not exist', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation removeBook {
                removeBook(id: { id: "f0091eef-b323-4803-89cd-8d29b3acceed" }) {
                    id
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)   
        .expectBodyContains('Invalid')
    })
})
