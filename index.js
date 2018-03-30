const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');
const fs = require('fs');
const handlers = require('./lib/handlers');
const config = require('./lib/config');
const helpers = require('./lib/helpers');


// Json post eg:
//
// {
//     "firstName" : "Alice",
//     "lastName"  : "Bradengburg",
//     "phone"		: "5551234567",
//     "password"	:	"thisIsAPassword",
//     "tosAgreement": true
// }
//

// const _data = require('./lib/data');

// _data.create('test','newfile', {'foo':'bar'}, function(err){
//     console.log('this is the error', err);
// });

// _data.read('test','newfile', function(err, data){
//     console.log('this is the error', err, 'and this was the data ', data);
// });
//
// _data.update('test','newfile',{'fizz':'buzz'} ,function(err){
//     console.log('this is the error', err);
// });

// _data.delete('test', 'newfile', function (err) {
//     console.log('this is the error', err);
// });


const httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res)
});


httpServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
    
};

const httpsServer = https.createServer(httpServerOptions, function (req, res) {
    unifiedServer(req, res)
});


httpServer.listen(config.httpPort, function () {
    console.log(`The server is running on port ${config.httpPort} - ${config.envName} mode`);
});


httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is running on port ${config.httpsPort} - ${config.envName} mode`);
});

let unifiedServer = (req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let method = req.method.toLowerCase();
    
    let headers = req.headers;
    let queryStringObject = parsedUrl.query;
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    
    req.on('data', data => {
        buffer += decoder.write(data);
    });
    
    req.on('end', () => {
        buffer += decoder.end();
        
        let chosenHandler = typeof(router[ trimmedPath ]) !== 'undefined' ? router[ trimmedPath ] : handlers.notFound;
    
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };
        
        chosenHandler(data, function (statusCode, payload) {
            
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            
            let payloadString = JSON.stringify(payload);
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            // console.log(`Request> ${trimmedPath}\nMethod> ${method}`);
            // console.log('Query> ', queryStringObject);
            // console.log('Headers> ', headers);
            console.log('Status code> ', statusCode);
            console.log('Payload> ', payloadString);
            
        });
        
        
    });
};

let router = {
    'ping': handlers.ping,
    'users' : handlers.users
};