const { spec } = require('pactum')

url = 'http://books.tc.staging.catapult.com:4000/graphql'

describe('Negative HTTP verb tests with blank body', () => {

    test('GET blank body should return 400 bad request', async () => {
        await spec()
        .get(url)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(400)   
    })

    test('POST blank body should return 400 bad request', async () => {
        await spec()
        .post(url)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(400)   
    })

    test('PUT blank body should return 405 method not allowed', async () => {
        await spec()
        .put(url)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(405)   
    })

    test('PATCH blank body should return 405 method not allowed', async () => {
        await spec()
        .patch(url)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(405)   
    })

    test('DELETE blank body should return 405 method not allowed', async () => {
        await spec()
        .delete(url)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(405)   
    })

    test('OPTIONS blank body should return 204 no content', async () => {
        await spec()
        .options(url)
        .expectStatus(204)
        .expectHeader('access-control-allow-methods', 'GET,POST,OPTIONS')
    })

    test('HEAD blank body should return 405 method not allowed', async () => {
        await spec()
        .head(url)
        .expectHeader('content-type', 'application/json; charset=utf-8')
        .expectStatus(405)   
    })
})