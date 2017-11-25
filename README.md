# simple-goals
💸 Setup recurring bills as goals in Simple

## Installing
```
git clone git@github.com:ScottBouloutian/simple-goals.git
cd simple-goals
yarn
```

## Building
```
yarn build
```
This will create a `build.zip` file which you can upload to AWS Lambda.

## Environment Variables
- SIMPLE_GOALS_USERNAME - username
- SIMPLE_GOALS_PASSWORD - password
- SIMPLE_GOALS_SFST - see below
- SIMPLE_GOALS_BUCKET - s3 bucket

## Obtaining the sfst
This token is related to two factor authentication with Simple. To obtain it, capture your network traffic while signing into Simple. Next, look at the request to `https://signin.simple.com/`. Under the request's header you will see one called `sfst`. The value of this header should be assigned to the corresponding environment variable. Alternatively this key can be obtained by looking at your cookies for `signin.simple.com`.
