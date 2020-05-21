<a name="top"></a>

# Sleep Tracker API Documentation v1.0.3

A Postgres API server using Node, Express, bcrypt and token-based authentication using JWTs.

- [Deployment](#Deployment)
  - [Heroku](#Heroku)
- [Data Standarization](#DataStandardization)
  - [Response Shape](#ResponseShape)
- [Auth](#Auth)
  - [Login a User](#Login-a-User)
  - [Registers a new user](#Registers-a-new-user)
- [Users](#Users)
  - [Get All Users](#Get-All-Users)
  - [Get a User by Id](#Get-a-User-by-Id)

---

# <a name='Deployment'></a> Deployment

## <a name='Heroku'></a> Heroku

<p>The API is deployed on the Heroku free tier. Please allow 5-10 seconds for Heroku to "wake up" the connection when using an endpoint for the first time that day.

The url to the deployed server is: [https://sleeptrackerbw.herokuapp.com/](https://sleeptrackerbw.herokuapp.com/)</p>

# <a name='DataStandardization'></a> Data Standardization

## <a name='ResponseShape`></a> Response Shape

<p>The API responses conform to a standard shape comprised of the following properties:

| Name       | Type     | Description                                              |
| ---------- | -------- | -------------------------------------------------------- |
| message    | `String` | <p>A status message indicating the request status</p>    |
| validation | `Array`  | <p>An array of validation errors</p>                     |
| data       | `Object` | <p>An object containing any data returned by the API</p> |

`json` - Standard Response Shape Example:

```json
{
  "message": "",
  "validation": [],
  "data": {}
}
```

## Tips for Using Axios

<p>Since axios returns data in an object that also has a `data` property, you should plan to access the data from the API requests by referencing `res.data.data`. If you would prefer to rename the `data` property of the object returned by axios, then using interceptors is probably the most expedient method to rename it from `data` to `body` (to mimic the shape returned by the fetch API)</p>

```axios-interceptor-example.js
export const axiosWithAuth = () => {
  const instance = axios.create({
    baseURL: "http://url-here/api",
    headers: {
      authorization: localStorage.getItem("token"),
    },
  });
  // Reshape the response to avoid res.data.data
  instance.interceptors.response.use((response) => {
    const body = { ...response.data };
    delete response.data; // remove the data property
    return { ...response, body };
  });
  return instance;
};
```

# <a name='Auth'></a> Auth

## <a name='Login-a-User'></a> Login a User

[Back to top](#top)

<p>Registers a New User</p>

```
POST /api/login
```

### Parameters - `Parameter`

| Name     | Type     | Description                          |
| -------- | -------- | ------------------------------------ |
| username | `String` | <p>The username for the new user</p> |
| password | `String` | <p>The password for the new user</p> |

### Parameters examples

`json` - Request Example:

```json
{
  "username": "david1234",
  "password": "1234"
}
```

### Success response

#### Success response - `Success 200`

| Name | Type     | Description                          |
| ---- | -------- | ------------------------------------ |
| user | `Object` | <p>The user object and the token</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 200: Success
{
 "message": "Welcome, david1234!",
 "validation": [],
 "data": {
   "user": {
     "id": 3,
     "username": "david1234",
     "role": 1,
     "first_name": "David",
     "last_name": "White",
     "email": null
   },
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
 }
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
{
  "message": "Invalid Credentials",
  "validation": [],
  "data": {}
}
```

#### Error response example - `Username Not Found:`

```json
{
  "message": "Invalid Username",
  "validation": ["There was a problem retrieving the username"],
  "data": {}
}
```

## <a name='Registers-a-new-user'></a> Registers a new user

[Back to top](#top)

<p>Registers a New User</p>

```
POST /api/register
```

### Parameters - `Parameter`

| Name       | Type      | Description                                         |
| ---------- | --------- | --------------------------------------------------- |
| username   | `String`  | <p>The username for the new user</p>                |
| password   | `String`  | <p>The password for the new user</p>                |
| role       | `Integer` | <p>The role for the new user</p>                    |
| first_name | `String`  | **optional** <p>The first name for the new user</p> |
| last_name  | `String`  | **optional** <p>The last name for the new user</p>  |
| email      | `String`  | **optional** <p>The email for the new user</p>      |

### Parameters examples

`json` - Request Example:

```json
{
  "username": "david1234",
  "password": "1234",
  "role": 1,
  "first_name": "David",
  "last_name": "White"
}
```

### Success response

#### Success response - `Success 200`

| Name | Type     | Description                                    |
| ---- | -------- | ---------------------------------------------- |
| user | `Object` | <p>The object containing the new user data</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 201: Created
{
 "message": "Registered david1234 successfully",
 "validation": [],
 "data": {
   "user": {
     "id": 3,
     "username": "david1234",
     "role": 1,
     "first_name": "David",
     "last_name": "White",
     "email": null
   }
}
```

### Error response example

#### Error response example - `Invalid Username:`

```json
HTTP/1.1 400: Bad Request
{
 "message": "Invalid Username",
 "validation": [
   "Username is invalid"
 ],
 "data": {}
}
```

# <a name='Users'></a> Users

## <a name='Get-All-Users'></a> Get All Users

[Back to top](#top)

<p>Get All Users</p>

```
GET /api/users
```

### Success response

#### Success response - `Success 200`

| Name  | Type    | Description                     |
| ----- | ------- | ------------------------------- |
| users | `Array` | <p>An array of user objects</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 200: OK
{
  "message": "Success",
  "validation": [],
  "data": [
      {
          "id": 1,
          "username": "test1",
          "role": 1,
          "first_name": "Test",
          "last_name": "User 1",
          "email": "test@testing.com"
      },
      {
          "id": 2,
          "username": "test2",
          "role": 1,
          "first_name": "Test",
          "last_name": "User 2",
          "email": "test@testing.com"
      },
      {
          "id": 3,
          "username": "test3",
          "role": 1,
          "first_name": "Test",
          "last_name": "User 3",
          "email": "test@testing.com"
      }
  ]
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
{
  "message": "Invalid Credentials",
  "validation": [],
  "data": {}
}
```

## <a name='Get-a-User-by-Id'></a> Get a User by Id

[Back to top](#top)

<p>Get a User by Id</p>

```
GET /api/users/:id
```

### Success response

#### Success response - `Success 200`

| Name | Type     | Description                                |
| ---- | -------- | ------------------------------------------ |
| user | `Object` | <p>An object with the user information</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 200: OK
{
  "message": "Success",
  "validation": [],
  "data": {
           "id": 1,
           "username": "test1",
           "role": 1,
           "first_name": "Test",
           "last_name": "User 1",
           "email": "test@testing.com"
   }
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
{
  "message": "Invalid Credentials",
  "validation": [],
  "data": {}
}
```
