const { faker } = require('@faker-js/faker')
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

    const randomAuthor = faker.book.author()

    test('Add a new author and search', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createAuther($name: String!) {
                createAuther(createAutherInput: { name: $name }) {
                    id
                    name
                }
            }
         `)
         .withGraphQLVariables({
            "name": randomAuthor
         })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createAuther.name', randomAuthor)
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

    const randomAuthor = faker.book.author()

    test('Add new author and then remove and verify', async () => {

        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation createAuther($name: String!) {
                createAuther(createAutherInput: { name: $name }) {
                    id
                    name
                }
            }
         `)
         .withGraphQLVariables({
            "name": randomAuthor
         })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)
        .expectJsonMatch('data.createAuther.name', randomAuthor)
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

    const removeAuthorId = faker.string.uuid();

    test('Remove author that does not exist', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            mutation removeAuther($id: String!) {
                removeAuther(id: { id: $id }) {
                    id
                }
            }
        `)
         .withGraphQLVariables({
            "id": removeAuthorId
         })
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(200)   
        .expectBodyContains('Invalid')
    })

    const queryAuthorId = faker.string.uuid();

    test('Query author that does not exist', async () => {
        await spec()
        .post(url)
        .withGraphQLQuery(`
            query($id: String!) {
                auther(id: { id: $id }) {
                    id
                    name
                    posts {
                        title
                        published
                    }
                }
            }
        `)
         .withGraphQLVariables({
            "id": queryAuthorId
         })
        .expectStatus(200)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectBodyContains('Cannot return null for non-nullable field Query.auther.')
    })
})
