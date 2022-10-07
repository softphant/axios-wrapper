# Axios wrapper

Wrapper was designed to use mostly Apisauce-compatible API, but latest axios version.
No errors thrown, response data can always be strictly typed.

## Basic usage

### Creating a new API

```
const config = {
  url: 'localhost:3000',
  timeout: 30000,
  headers: {}
}

const api = createApi({
    url: config.url,
    timeout: config.timeout,
    headers: config.headers,
})
```

### Api calls

```
const response: ApiResponse<ResponseInterface> = await api.get('/todos')
if (response.ok) {
  // Handle successful api call
  handleSuccess(response.data)
} else {
  // Handle errors. Response contains originalError, statusCode and apisauce-like problem.
}
```
