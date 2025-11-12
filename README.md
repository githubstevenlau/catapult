# Catapult SDET - API Automation Test

Author: Steven Lau softwaredev@stevenlau.net

## Part 1: Test plan for GraphQL API

Functional test plan for the GraphQL endpoint:
### Pre-requites

Data strategy for testing:
1. Use of FakerJS and the book API - this has data specifically for books. Can be used during
development and early testing.
2. Use of different Faker locales to test for special characters, e.g., diacritics
3. Full UTF-8 character testing


### Author
1. Basic create, read, update and delete functionality for items in the Author object including
tests for mandatory and nullable fields. Test for acceptable lengths for the field entries.
2. Test functionality for author posts: test for create, read, update and delete for post items
### Book
1. Basic create, read, update and delete functionality for items in the Book object

### Negative test
These are tests that ensure that there is correct error handling. For example:
- read, update and delete on items that do not exist


## Part 2: Automated tests

The tests have been implemented using PactumJS.

### Improvements backlog for tests

1. Implement test suite with TypeScript
2. Fix project for CommonJS vs ESM issues to use ESM. Current issues with Faker v10 and integration
with Jest v30.
3. Implement contract testing: there is native support for this within PactumJS
4. Add environment variables
5. Implement BDD Gherkin syntax
6. Add data templates
7. Refactor - add a base class that can be inherited by the tests
8. Data quality tests: different locales to test for special characters, test length of all inputs
9. Add reporting - integrate Allure reports
10. Mock endpoints/functions especially for expensive auth token requests and functions under development
and for use within the CI pipelines
11. Add hooks to run before and after tests, e.g., insert a pre-defined set of data


## Part 3: Load testing

Load testing scripts added for query and mutations requests:
- query: graphql_query_test.js
- mutation: graphql_mutation_test.js


## Part 4: Bugs

The following bugs have been found:

### General bugs

- Endpoint Introspection
Descriptions should be added for the mutations listings (i.e., createBook, updateBook etc)

- Incorrect response status for HTTP verb requests
The response to an OPTIONS request to the endpoint states that only GET, POST and OPTIONS
calls are allowed. This implies that all of the other verbs, i.e., DELETE, HEAD, PATCH and PUT
should return 405 Method Not Allowed responses.
Actual: 400 response
Expected: 405 response


### Author

Author object
- Spelling error: there is a spelling error across Author object, fields and functions
Actual: Auther
Expected: Author

This is also visible across the mutation functions: createAuther, updateAuther and removeAuther
Severity: low
Priority: high

Low impact since the API functionality can be used but spelling errors, especially for public APIs,
reflect badly on the company. Should be relatively easy to fix.

- Schema: able to add an author without a name: should be validation to ensure that this is not possible

### Book 

- Schema: able to add a book without an author: should be validation to ensure that this is not possible

- Query: Performing a read query on a non-existant item results in a 200 response code but a message
with code INTERNAL_SERVER_ERROR. This may or may not be a defect and depends on how much information is
wished to provided to the endpoint users, particularly from a security or usability perspective.
For usability, it would be helpful to tell users that the requested resource does not exist return
No Content or Not Found responses (may also depend on verb). For security one aim may be to provide as
little information as possible and simply return a 200 saying that the request was valid but return
no data. These decisions can be applied to all requests. This behaviour is tested in the negative tests.


### Summary
Should this be release to production?
No
Recommend that this should not be released to production until issues have been resolved.
