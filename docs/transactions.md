# Transactions

```
query {
  libraries {
    books {
      title
      author {
        name
      }
    }
  }
}
```

`post /query/<anonymous>/libraries.books.author.name`

---

Transactions are captured as web transactions, associated with the underlying framework (Express, Koa, etc.), and named based on the GraphQL operations executed.

We leverage several details in a transaction name to attempt to mostly group unique query representations: http method, operation type, operation name and the deepest path resolved (the first, if multiple).

The raw representation of a transaction looks like the following: `/WebTransaction/{framework-name}/POST//{operation-type}/{operation-name}/{deepest-path}`

For an Express usage of Apollo Server, that may look like: `/WebTransaction/Expressjs/POST//query/<anonymous>/libraries.books.author.name`

The transaction on New Relic One will ultimately display similar to: `post /query/<anonymous>/libraries.books.author.name`.

## Details

**Http Method:** Http method/verb for the web request. Data may be requested via GET or POST and is surfaced to differentiate similar to other web transactions.

**Operation Type:** Indicates if the operation was a query or a mutation.

**Operation Name:** The operation name when provided or `<anonymous>`.

**Deepest Path:** The deepest path resolved (or attempted in the case of a validation error). Since operation names may be reused, this helps further determine uniqueness of a given operation.

## Naming on Error

Errors parsing or validating a GraphQL request can impact transaction naming.

### Validation Errors

If a request was able to parse, but was not able to validate, we will name the transaction off what was attempted to be queried. For example: when a field in the incoming GraphQL query does not exist.

In this situation, we'll leverage the parsed document to indicate each of the intended pieces including calculating the deepest path intended.

Below is an example of querying for a field that does not exist (`doesnotexist`) and what that may look like in NR One.

```
query GetBooksByLibrary {
  libraries {
    books {
      title
      doesnotexist {
        name
      }
    }
  }
}
```

`post /query/GetBooksByLibrary/libraries.books.doesnotexist.name`

### Parsing Errors

If a requested operation cannot be parsed, we will name the transaction using a wildcard (*) in place of the usual operation pieces. In this situation, the query is invalid and we do not know if we have any tangible pieces to safely go off of.

Below is an example missing a closing `}` that cannot parse and what that may look like in NR One.

```
query GetBooksByLibrary {
  libraries {
    books {
      title
      author {
        name
      }
    }
  }
// missing closing }
```

`post /*`

In these situations, the `query` attribute on the operation span associated with the error is the best way to identify the particular offender.

### Batch Queries

Apollo Server allows the sending of batch queries. In these situations, there are multiple operation/queries in play to impact naming.

To continue to best uniquely identify transaction groupings, we aggregate the operation names after an additional `/batch` indicator. These names are likely to be quite long. We are considering dropping the deepest-path from these names but are currently maintaining consistency.

Below is an example of a batch query and what that may look like in NR One.

```
[
  {
    query: query GetBookForLibrary {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
      }
    }
  },
  {
    query: mutation {
      addThing(name: "added thing!")
    }
  }
]
```

`post /batch/query/GetBookForLibrary/library.books.author.name/mutation/<anonymous>/addThing`

Here you see `batch/` followed by `query/GetBookForLibrary/library.books.author.name` and `mutation/<anonymous>/addThing`.