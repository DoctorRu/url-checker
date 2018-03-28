# URL Checker
Tecnologies: NodeJS

Little app with access control to check if a url is up or down.


#### Production mode
    NODE_ENV=production nodemon index.js

#### Staging (Development) mode
    nodemon index.js


#### To generate SSL certificate

    openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pe
