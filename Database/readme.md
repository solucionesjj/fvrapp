# Mongo Install, Config and Admin

## Definitions
* Database name: fvrapp
* Collections: scans
* Port: 38291

## Development or testing environments  
* In local computer and test or dev please install using docker.

### Install
```bash
sh upMongoDb.sh
```

### Connect to mongo DB
```bash
sh connectToMongo.sh
```

## Debian install

## General
after install mongo DB, create and change global user password..

```Mongo
db.createUser({
  user: "globalAdmin",
  pwd: "???", 
  roles: [ { role: "root", db: "admin" } ]
})
```

```Mongo
use fvrapp;
db.createUser({
  user: "proxyAppUser",
  pwd: "LaMig2314##",
  roles: [
    { role: "readWrite", db: "fvrapp" }
  ]
});
```


