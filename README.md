<a name="top"></a>
# Generic sqlite3 API Documentation v1.0.0

A generic sqlite3 for rapid development and prototyping

 - [Auth](#Auth)
   - [Login a User](#Login-a-User)
   - [Registers a new user](#Registers-a-new-user)
 - [Users](#Users)
   - [Get All Users](#Get-All-Users)
   - [Get a User by Id](#Get-a-User-by-Id)

___


# <a name='Auth'></a> Auth

## <a name='Login-a-User'></a> Login a User
[Back to top](#top)

<p>Registers a New User</p>

```
POST /api/login
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `String` | <p>The username for the new user (<em>required</em>)</p> |
| password | `String` | <p>The password for the new user (<em>required</em>)</p> |

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

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `json` | <p>The user object and the token</p> |

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
 "validation": [
   "There was a problem retrieving the username"
  ],
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

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `String` | <p>The username for the new user     (<em>required</em>)</p> |
| password | `String` | <p>The password for the new user     (<em>required</em>)</p> |
| role | `Integer` | <p>The role for the new user            (<em>required</em>)</p> |
| String |  | **optional** <p>first_name The first name for the new user</p> |

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

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user |  | <p>The object containing the new user data</p> |

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

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| users |  | <p>An array of user objects</p> |

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

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user |  | <p>An object with the user information</p> |

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
