const http = require('http');
const stringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

const server = http.createServer(function (req, res) {
    
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let method = req.method.toLowerCase();
    
    let headers = req.headers;
    let queryStringObject = parsedUrl.query;
    let decoder = new stringDecoder('utf-8');
    let buffer = '';
    
    req.on('data', data => {
        buffer += decoder.write(data);
    });
    
    req.on('end', () => {
        buffer += decoder.end();
        
        let chosenHandler = typeof(router[ trimmedPath ]) !== 'undefined' ? router[ trimmedPath ] : handlers.notFound;
        
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject ': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };
        
        chosenHandler(data, function(statusCode, payload){
            
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            
            let payloadString = JSON.stringify(payload);
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            console.log(`Request> ${trimmedPath}\nMethod> ${method}`);
            console.log('Query> ', queryStringObject);
            console.log('Headers> ', headers);
            console.log('Status code> ', statusCode);
            console.log('Payload> ', payload);
        
        });
        
        
    });
    
});


server.listen(3000, function () {
    console.log('The server is running on 3000');
});

let handlers = {};

handlers.sample = (data, callback) => {
    callback(406, {'name': 'sample handler'});
};

handlers.notFound = (data, callback) => {
    callback(404);
};

let router = {
    'sample': handlers.sample
};