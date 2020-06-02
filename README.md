<a name="top"></a>

# Sleep Tracker API Documentation v1.1.57

A Postgres API server using Node, Express, bcrypt and token-based authentication using JWTs.

- [Deployment](#Deployment)
  - [Heroku](#Heroku)
- [Data Standardization](#Data_Standardization)
  - [Tips for Accessing the Data Using Axios](#Tips-for-Accessing-the-Data-Using-Axios)
- [Auth](#Auth)
  - [Login a User](#Login-a-User)
  - [Registers a new user](#Registers-a-new-user)
- [Mood](#Mood)
  - [Delete a mood record by id](#Delete-a-mood-record-by-id)
- [Sleep](#Sleep)
  - [Delete a sleep record by id](#Delete-a-sleep-record-by-id)
  - [Get All Sleep](#Get-All-Sleep)
  - [Get Sleep by Id](#Get-Sleep-by-Id)
  - [Insert a sleep record](#Insert-a-sleep-record)
  - [Update a sleep record by id](#Update-a-sleep-record-by-id)
- [Users](#Users)
  - [Get All Users](#Get-All-Users)
  - [Get a User by Id](#Get-a-User-by-Id)
  - [Update a User by Id](#Update-a-User-by-Id)

---

# <a name='Deployment'></a> Deployment

## <a name='Heroku'></a> Heroku

[Back to top](#top)

<p>The API is deployed on the Heroku free tier. Please allow 5-10 seconds for Heroku to &quot;wake up&quot; the connection when using an endpoint for the first time that day.</p> <p>The url to the deployed server is: https://sleeptrackerbw.herokuapp.com/</p>

# <a name='Data_Standardization'></a> Data Standardization

## <a name='Tips-for-Accessing-the-Data-Using-Axios'></a> Tips for Accessing the Data Using Axios

[Back to top](#top)

<p>Since axios returns data in an object that also has a <code>data</code> property, you should plan to access the data from the API requests by referencing <code>res.data.data</code>. If you would prefer to rename the <code>data</code> property of the object returned by axios, then using interceptors is probably the most expedient method to rename it from <code>data</code> to <code>body</code> (to mimic the shape returned by the fetch API)</p>

### Standard Response Parameters - `Parameter`

| Name       | Type     | Description                                                   |
| ---------- | -------- | ------------------------------------------------------------- |
| message    | `String` | <p>A status message</p>                                       |
| validation | `Array`  | <p>An array of validation errors</p>                          |
| data       | `Object` | <p>An object containing any data returned by the resource</p> |

### Response example

#### Response example - `Standard Response Shape`

```json
HTTP 1.1/*
{
 "message": "",
 "validation": [],
 "data": {}
}
```

#### Using Axios Interceptors to Reshape the Response

```axios-interceptor-example.js
export const axiosWithAuth = () => {
 const instance = axios.create({
   baseURL: "http://localhost:5000/api",
   headers: {
     authorization: localStorage.getItem("token"),
   },
 });
 // Reshape the response to avoid res.data.data
 // Use the res.body shape, similar to the fetch API
 instance.interceptors.response.use((response) => {
   const body = { ...response.data };
   delete response.data; // remove the data property
   return { ...response, body };
 });
 return instance
};
```

# <a name='Auth'></a> Auth

## <a name='Login-a-User'></a> Login a User

[Back to top](#top)

<p>Logs In a User</p>

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

#### Success response - `Created 201`

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

# <a name='Mood'></a> Mood

## <a name='Delete-a-mood-record-by-id'></a> Delete a mood record by id

[Back to top](#top)

<p>Delete a mood record by id</p>

```
DELETE /api/mood/:id
```

### Success response

#### Success response - `Success 200`

| Name    | Type     | Description                                                   |
| ------- | -------- | ------------------------------------------------------------- |
| message | `Object` | <p>The standard shape with a success message is sent back</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 204: No Content
{
  "message": "The mood entry with id 1 has been successfully deleted",
  "validation": [],
  "data": {}
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

#### Error response example - `Server Error (e.g. empty update sent):`

```json
{
  "message": "There was a problem completing the required operation",
  "validation": [],
  "data": {}
}
```

# <a name='Sleep'></a> Sleep

## <a name='Delete-a-sleep-record-by-id'></a> Delete a sleep record by id

[Back to top](#top)

<p>Delete a sleep record by id</p>

```
DELETE /api/sleep/:id
```

### Success response

#### Success response - `Success 200`

| Name    | Type     | Description                                                   |
| ------- | -------- | ------------------------------------------------------------- |
| message | `Object` | <p>The standard shape with a success message is sent back</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 204: No Content
{
  "message": "The sleep entry with id 1 has been successfully deleted",
  "validation": [],
  "data": {}
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
HTTP/1.1 401: Unauthorized
{
 "message": "Invalid Credentials",
 "validation": [],
 "data": {}
}
```

#### Error response example - `Server Error (e.g. malformed or empty request sent):`

```json
HTTP/1.1 500: Server Error
{
 "message": "There was a problem completing the required operation",
 "validation": [],
 "data": {}
}
```

## <a name='Get-All-Sleep'></a> Get All Sleep

[Back to top](#top)

<p>Get All Sleep, with optional query string support</p>

```
GET /api/sleep
```

### Examples

Using `start` and `end` query params to filter the data by date:

```json
GET /api/sleep?start='4/01/2020'&end='4/17/2020'
```

Use the `page` and `limit` query params to enable pagination:

```json
GET /api/sleep?limit=10&page=2
```

Combine both date and pagination query string params if desired

```json
GET /api/sleep?start='4/01/2020'&end='4/17/2020'&limit=10&page=2
```

### Success response

#### Success response - `Success 200`

| Name  | Type    | Description                                           |
| ----- | ------- | ----------------------------------------------------- |
| sleep | `Array` | <p>An array of objects with the sleep information</p> |

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
            "user_id": 3,
            "sleep_start": "1585782000000",
            "sleep_end": "1585832400000",
            "start_formatted": "04/01/2020 11:00 PM",
            "end_formatted": "04/02/2020 1:00 PM",
            "sleep_goal": 11,
            "sleep_hours": 14,
            "mood_waking": 4,
            "mood_day": 1,
            "mood_bedtime": 4
        },
        {
            "id": 2,
            "user_id": 3,
            "sleep_start": "1585868400000",
            "sleep_end": "1585915200000",
            "start_formatted": "04/02/2020 11:00 PM",
            "end_formatted": "04/03/2020 12:00 PM",
            "sleep_goal": 8,
            "sleep_hours": 13,
            "mood_waking": 3,
            "mood_day": 1,
            "mood_bedtime": 1
        },
        {
            "id": 3,
            "user_id": 3,
            "sleep_start": "1585947600000",
            "sleep_end": "1585969200000",
            "start_formatted": "04/03/2020 9:00 PM",
            "end_formatted": "04/04/2020 3:00 AM",
            "sleep_goal": 10,
            "sleep_hours": 6,
            "mood_waking": 3,
            "mood_day": 1,
            "mood_bedtime": 4
        }
    ]
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
HTTP/1.1 401: Unauthorized
{
 "message": "Invalid Credentials",
 "validation": [],
 "data": {}
}
```

## <a name='Get-Sleep-by-Id'></a> Get Sleep by Id

[Back to top](#top)

<p>Get Sleep By Id</p>

```
GET /api/sleep/:id
```

### Success response

#### Success response - `Success 200`

| Name  | Type    | Description                                               |
| ----- | ------- | --------------------------------------------------------- |
| sleep | `Array` | <p>An array with an object with the sleep information</p> |

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
            "user_id": 3,
            "sleep_start": "1585782000000",
            "sleep_end": "1585832400000",
            "start_formatted": "04/01/2020 11:00 PM",
            "end_formatted": "04/02/2020 1:00 PM",
            "sleep_goal": 11,
            "sleep_hours": 14,
            "mood_waking": 4,
            "mood_day": 1,
            "mood_bedtime": 4
        }
    ]
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
HTTP/1.1 401: Unauthorized
{
 "message": "Invalid Credentials",
 "validation": [],
 "data": {}
}
```

## <a name='Insert-a-sleep-record'></a> Insert a sleep record

[Back to top](#top)

<p>Add a sleep record</p>

```
POST /api/sleep
```

### Parameters - `Parameter`

| Name         | Type      | Description                                       |
| ------------ | --------- | ------------------------------------------------- |
| sleep_start  | `Integer` | <p>The start time for the sleep entry</p>         |
| sleep_end    | `Integer` | <p>The end time for the sleep entry</p>           |
| user_id      | `Integer` | <p>The user id of the person who slept</p>        |
| mood_waking  | `Integer` | <p>The user's mood score on waking (1-4)</p>      |
| mood_day     | `Integer` | <p>The user's mood score during the day (1-4)</p> |
| mood_bedtime | `Integer` | <p>The user's mood score at bedtime (1-4)</p>     |

### Parameters examples

`json` - Request Example:

```json
{
  "sleep_start": 1588039200000,
  "sleep_end": 1588068000000,
  "sleep_goal": 6,
  "user_id": 3,
  "mood_waking": 4,
  "mood_day": 3,
  "mood_bedtime": 2
}
```

### Success response

#### Success response - `Created 201`

| Name  | Type    | Description                                          |
| ----- | ------- | ---------------------------------------------------- |
| sleep | `Array` | <p>An array with the object with the information</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 201: Created
{
  "message": "The sleep entry has been successfully added",
  "validation": [],
  "data": [
      {
          "id": 1,
          "sleep_start": 1588039200000,
          "sleep_end": 1588068000000,
          "sleep_goal": 6,
          "user_id": 3,
          "mood_waking": 4,
          "mood_day": 3,
          "mood_bedtime": 2
      }
  ]
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
HTTP/1.1 401: Unauthorized
{
 "message": "Invalid Credentials",
 "validation": [],
 "data": {}
}
```

## <a name='Update-a-sleep-record-by-id'></a> Update a sleep record by id

[Back to top](#top)

<p>Update a sleep record by id</p>

```
PUT /api/sleep/:id
```

### Parameters - `Parameter`

| Name     | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| property | `Object` | <p>Any property on the sleep record</p> |

### Parameters examples

`json` - Request Example:

```json
{
  "sleep_end": 1588068000000
}
```

### Success response

#### Success response - `Success 200`

| Name  | Type    | Description                                                  |
| ----- | ------- | ------------------------------------------------------------ |
| sleep | `Array` | <p>An array with the object with the updated information</p> |

### Success response example

#### Success response example - `Success Response:`

```json
HTTP/1.1 200: OK
{
  "message": "The sleep entry has been successfully updated",
  "validation": [],
  "data": [
      {
          "id": 1,
          "sleep_start": 1588039200000,
          "sleep_end": 1588068000000,
          "sleep_goal": 6,
          "user_id": 3,
          "mood_waking": 4,
          "mood_day": 3,
          "mood_bedtime": 2
      }
  ]
}
```

### Error response example

#### Error response example - `Invalid Credentials:`

```json
HTTP/1.1 401: Unauthorized
{
 "message": "Invalid Credentials",
 "validation": [],
 "data": {}
}
```

#### Error response example - `Server Error (e.g. malformed or empty request sent):`

```json
HTTP/1.1 500: Server Error
{
 "message": "There was a problem completing the required operation",
 "validation": [],
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

## <a name='Update-a-User-by-Id'></a> Update a User by Id

[Back to top](#top)

<p>Update a User by Id</p>

```
PUT /api/users/:id
```

### Parameters - `Parameter`

| Name     | Type     | Description                            |
| -------- | -------- | -------------------------------------- |
| property | `Object` | <p>Any property on the user record</p> |

### Parameters examples

`json` - Request Example:

```json
{
  "role": 2,
  "first_name": "Updated Test"
}
```

### Success response

#### Success response - `Success 200`

| Name | Type     | Description                                   |
| ---- | -------- | --------------------------------------------- |
| user | `Object` | <p>An object with the updated information</p> |

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
           "role": 2,
           "first_name": "Updated Test",
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

#### Error response example - `Server Error (e.g. empty update sent):`

```json
{
  "message": "There was a problem completing the required operation",
  "validation": [],
  "data": {}
}
```
