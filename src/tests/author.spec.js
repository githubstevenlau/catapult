const { faker } = require('@faker-js/faker')
const { randomUUID } = require('crypto')
const { spec } = require('pactum')

url = 'http://books.tc.staging.catapult.com:4000/graphql'

describe('Query author tests', () => {

    test('Test query all authors and then individual author by id', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            {
                autherAll {
                    id
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .stores('authorId', 'data.autherAll[0].id')
        
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                auther(id: { id: "$S{authorId}" } ){
                    id
                    name
                    posts {
                        title
                        published
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
    })
})

describe('Create author tests', () => {

    const randomAuthor = faker.book.randomAuthor
    const fixedAuthor = 'Charles Dickens'

    // todo fix: pactumjs withGraphQLVariables not being passed through to query
    test('Add a new author and search', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createAuther {
                createAuther(createAutherInput: { name: "Charles Dickens" }) {
                    id
                    name
                }
            }
         `)
         /*
         .withGraphQLVariables({
            'randomAuthor': randomAuthor
         })
         */
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createAuther.name', fixedAuthor)
        .stores('authorId', 'data.createAuther.id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                auther(id: { id: "$S{authorId}" } ){
                    id
                    name
                    posts {
                        title
                        published
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
    })
})

describe('Remove author tests', () => {

    const randomAuthor = faker.book.randomAuthor
    // todo fix to use faker for author name
    test('Add new author and then remove and verify', async () => {

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createAuther {
                createAuther(createAutherInput: { name: "Charles Dickens" }) {
                    id
                    name
                }
            }
         `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createAuther.name', 'Charles Dickens')
        .stores('authorId', 'data.createAuther.id')

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation removeAuther {
                removeAuther(id: { id: "$S{authorId}" }) {
                    id
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)   

        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                auther(id: { id: "$S{authorId}" } ){
                    id
                    name
                    posts {
                        title
                        published
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectBodyContains('Cannot return null for non-nullable field Query.auther.')
    })
})

describe('Author negative tests', () => {

    test('Remove author that does not exist', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation removeAuther {
                removeAuther(id: { id: "56d6f01a-adfb-48de-8420-76e7f54262ca" }) {
                    id
                }
            }
        `)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)   
        .expectBodyContains('Invalid')
    })

    test('Query author that does not exist', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query {
                auther(id: { id: "56d6f01a-adfb-48de-8420-76e7f54262ca" } ){
                    id
                    name
                    posts {
                        title
                        published
                    }
                }
            }
        `)
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectBodyContains('Cannot return null for non-nullable field Query.auther.')
    })
})
