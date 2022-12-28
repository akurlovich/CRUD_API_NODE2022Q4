# CRUD_API_NODE2022Q4
# Task 3

## Downloading and installing dependencies

- Сlone repository:

`git clone https://github.com/akurlovich/`

- Move to folder:

`cd `

- Checkout to branch "develop":

`git checkout develop`

- Install dependencies:

`npm i`


## Usage

- Start server in development mode:

```
npm run start:dev
```

- Build application and start server in production mode:
```
npm run start:prod
```

- Run E2E tests:


```
`- In fist terminal start server:`

npm run start:dev

`- In second terminal run tests:`

npm run test
```

## API usage

- GET `/person` return all persons
- GET `/person/${personId}` return person with corresponding personId
- POST `/person` is used to create record about new person and store it in database
- PUT `/person/${personId}` is used to update record about existing person
- DELETE `/person/${personId}` is used to delete record about existing person from database

>**NOTE**
>
>Data for **POST** and **PUT** method must be in **JSON** and have 3 required field: **name**, **age** and **hobbies**, for example:
>```
>{
>  "name": "Anna"
>  "age": "29",
>  "hobbies": "fishing"
>}
>```
