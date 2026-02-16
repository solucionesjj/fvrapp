#please, export or create enviroment vars in .env file
# export MONGODB_INITDB_ROOT_USERNAME=globalAdmin
# export MONGODB_INITDB_ROOT_PASSWORD="ejemploooo"
docker exec -it mongodb_container mongosh -u "$MONGODB_INITDB_ROOT_USERNAME" -p "$MONGODB_INITDB_ROOT_PASSWORD" --authenticationDatabase admin
